import type { SRSCard, SRSGrade } from '@/types';

/**
 * Adaptive spaced repetition scheduler, based on SM-2 with two changes:
 *  - ease-factor floor is raised (1.3 -> 1.5) so weak words don't get stuck
 *    reviewing every day forever.
 *  - the first two intervals are shorter (1d / 3d instead of 1d / 6d) since
 *    spoken-dialect vocabulary decays faster than the read/write-only words
 *    SM-2 was designed for.
 */
const MIN_EASE_FACTOR = 1.5;
const GRADE_QUALITY: Record<SRSGrade, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

export function createSRSCard(wordId: string): SRSCard {
  return {
    wordId,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: new Date().toISOString(),
    lapses: 0,
  };
}

export function reviewSRSCard(card: SRSCard, grade: SRSGrade, now: Date = new Date()): SRSCard {
  const quality = GRADE_QUALITY[grade];
  const next: SRSCard = { ...card, lastReviewedAt: now.toISOString() };

  if (quality < 3) {
    // Forgotten: reset repetitions but keep some ease-factor penalty memory.
    next.repetitions = 0;
    next.intervalDays = 1;
    next.lapses = card.lapses + 1;
    next.easeFactor = Math.max(MIN_EASE_FACTOR, card.easeFactor - 0.2);
  } else {
    next.repetitions = card.repetitions + 1;
    next.easeFactor = Math.max(
      MIN_EASE_FACTOR,
      card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    );

    if (next.repetitions === 1) {
      next.intervalDays = 1;
    } else if (next.repetitions === 2) {
      next.intervalDays = 3;
    } else {
      next.intervalDays = Math.round(card.intervalDays * next.easeFactor);
    }
  }

  const due = new Date(now);
  due.setDate(due.getDate() + next.intervalDays);
  next.dueAt = due.toISOString();
  return next;
}

export function isCardDue(card: SRSCard, now: Date = new Date()): boolean {
  return new Date(card.dueAt).getTime() <= now.getTime();
}

export function getDueCards(cards: SRSCard[], now: Date = new Date()): SRSCard[] {
  return cards
    .filter((c) => isCardDue(c, now))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

/** Words the learner keeps failing — surfaced on Home as "weak areas". */
export function getWeakCards(cards: SRSCard[], minLapses = 2): SRSCard[] {
  return cards.filter((c) => c.lapses >= minLapses).sort((a, b) => b.lapses - a.lapses);
}

export function retentionEstimate(card: SRSCard, now: Date = new Date()): number {
  if (!card.lastReviewedAt) return 0;
  const daysSince =
    (now.getTime() - new Date(card.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24);
  // Exponential forgetting curve scaled by ease factor as a stability proxy.
  const stability = Math.max(1, card.intervalDays * (card.easeFactor / 2.5));
  return Math.exp(-daysSince / stability);
}
