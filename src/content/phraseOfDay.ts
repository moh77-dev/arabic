import { ALL_VOCAB } from './dialects';
import type { DialectId } from '@/types';

export interface DailyPhrase {
  arabic: string;
  translit: string;
  english: string;
}

const FALLBACK: DailyPhrase = { arabic: 'مرحبا', translit: 'marhaba', english: 'Hello' };

/**
 * A stable "phrase of the evening" for a dialect — the same phrase all day, rotating daily. Prefers
 * an example sentence (a real phrase you'd say) and falls back to the word itself.
 */
export function getPhraseOfDay(dialectId: DialectId): DailyPhrase {
  const pool = ALL_VOCAB.filter((w) => w.dialectId === dialectId);
  const src = pool.length ? pool : ALL_VOCAB;
  if (!src.length) return FALLBACK;

  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const w = src[dayIndex % src.length];

  if (w.exampleSentenceArabic && w.exampleSentenceEnglish) {
    return {
      arabic: w.exampleSentenceArabic,
      translit: w.exampleSentenceTranslit ?? w.transliteration,
      english: w.exampleSentenceEnglish,
    };
  }
  return { arabic: w.arabic, translit: w.transliteration, english: w.english };
}
