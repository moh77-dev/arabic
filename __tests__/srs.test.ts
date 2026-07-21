import { createSRSCard, getDueCards, getWeakCards, isCardDue, reviewSRSCard } from '@/lib/srs';

describe('srs', () => {
  it('creates a fresh card due immediately', () => {
    const card = createSRSCard('word_1');
    expect(card.repetitions).toBe(0);
    expect(card.easeFactor).toBe(2.5);
    expect(isCardDue(card)).toBe(true);
  });

  it('schedules increasing intervals on repeated "good" reviews', () => {
    let card = createSRSCard('word_1');
    const now = new Date('2026-01-01T00:00:00Z');

    card = reviewSRSCard(card, 'good', now);
    expect(card.intervalDays).toBe(1);
    expect(card.repetitions).toBe(1);

    card = reviewSRSCard(card, 'good', new Date('2026-01-02T00:00:00Z'));
    expect(card.intervalDays).toBe(3);
    expect(card.repetitions).toBe(2);

    const prevInterval = card.intervalDays;
    card = reviewSRSCard(card, 'good', new Date('2026-01-05T00:00:00Z'));
    expect(card.intervalDays).toBeGreaterThan(prevInterval);
    expect(card.repetitions).toBe(3);
  });

  it('resets repetitions and shortens interval on "again"', () => {
    let card = createSRSCard('word_1');
    const now = new Date('2026-01-01T00:00:00Z');
    card = reviewSRSCard(card, 'good', now);
    card = reviewSRSCard(card, 'good', new Date('2026-01-02T00:00:00Z'));
    expect(card.repetitions).toBe(2);

    card = reviewSRSCard(card, 'again', new Date('2026-01-05T00:00:00Z'));
    expect(card.repetitions).toBe(0);
    expect(card.intervalDays).toBe(1);
    expect(card.lapses).toBe(1);
  });

  it('never lets ease factor drop below the floor', () => {
    let card = createSRSCard('word_1');
    let now = new Date('2026-01-01T00:00:00Z');
    for (let i = 0; i < 20; i++) {
      card = reviewSRSCard(card, 'again', now);
      now = new Date(now.getTime() + 86400000);
    }
    expect(card.easeFactor).toBeGreaterThanOrEqual(1.5);
  });

  it('filters and sorts due cards by soonest due date', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const past = { ...createSRSCard('a'), dueAt: '2026-01-05T00:00:00Z' };
    const future = { ...createSRSCard('b'), dueAt: '2026-02-01T00:00:00Z' };
    const dueSoonest = { ...createSRSCard('c'), dueAt: '2026-01-01T00:00:00Z' };

    const due = getDueCards([future, past, dueSoonest], now);
    expect(due.map((c) => c.wordId)).toEqual(['c', 'a']);
  });

  it('surfaces cards with repeated lapses as weak', () => {
    const cards = [
      { ...createSRSCard('a'), lapses: 0 },
      { ...createSRSCard('b'), lapses: 3 },
      { ...createSRSCard('c'), lapses: 2 },
    ];
    const weak = getWeakCards(cards);
    expect(weak.map((c) => c.wordId)).toEqual(['b', 'c']);
  });
});
