import { DIALECT_LIST } from './dialectMeta';
import { ALL_VOCAB } from './dialects';
import type { DialectId } from '@/types';

export interface ChallengeRound {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  correct: DialectId;
  options: DialectId[]; // 4 options, includes correct
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds a round set for the "Where is this phrase from?" game. Prefers dialect-distinctive
 * vocabulary (greetings/slang/idioms/expressions read most differently across regions) so the
 * answer isn't ambiguous, and guarantees four different-flag options per round.
 */
export function generateChallengeRounds(count = 10): ChallengeRound[] {
  const DISTINCTIVE = new Set(['greetings', 'slang', 'idioms', 'expressions', 'market', 'food']);
  const pool = ALL_VOCAB.filter((w) => DISTINCTIVE.has(w.category) && w.arabic.length > 1);
  const allDialectIds = DIALECT_LIST.map((d) => d.id);

  const picked = shuffle(pool).slice(0, count);
  return picked.map((word, i) => {
    const distractors = shuffle(allDialectIds.filter((d) => d !== word.dialectId)).slice(0, 3);
    return {
      id: `${word.id}_r${i}`,
      arabic: word.arabic,
      transliteration: word.transliteration,
      english: word.english,
      correct: word.dialectId,
      options: shuffle([word.dialectId, ...distractors]),
    };
  });
}
