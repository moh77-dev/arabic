import { ALL_VOCAB, getVocabByDialect } from './dialects';
import type { DialectId, VocabWord } from '@/types';

export interface TranslateResult {
  word: VocabWord;
  others: { dialectId: DialectId; arabic: string; transliteration?: string }[];
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[.,!?]/g, '');
}

/**
 * Offline dictionary translate against the bundled vocabulary. Real AI translation (any phrase)
 * would come from the ai-tutor edge function; this keeps the feature useful with zero backend by
 * matching known words/phrases in the chosen dialect, plus the same meaning across other dialects.
 */
export function translateLocally(english: string, dialectId: DialectId): TranslateResult | null {
  const q = normalize(english);
  if (!q) return null;
  const pool = getVocabByDialect(dialectId);
  const exact = pool.find((w) => normalize(w.english) === q);
  const partial = exact ?? pool.find((w) => normalize(w.english).includes(q) || q.includes(normalize(w.english)));
  if (!partial) return null;

  // Same english meaning across other dialects (+ any crossDialect hints on the matched word).
  const others: TranslateResult['others'] = [];
  const seen = new Set<DialectId>([dialectId]);
  for (const w of ALL_VOCAB) {
    if (w.dialectId === dialectId) continue;
    if (seen.has(w.dialectId)) continue;
    if (normalize(w.english) === normalize(partial.english)) {
      others.push({ dialectId: w.dialectId, arabic: w.arabic, transliteration: w.transliteration });
      seen.add(w.dialectId);
    }
  }
  if (partial.crossDialect) {
    for (const [d, val] of Object.entries(partial.crossDialect)) {
      const did = d as DialectId;
      if (!seen.has(did) && val) {
        others.push({ dialectId: did, arabic: val });
        seen.add(did);
      }
    }
  }
  return { word: partial, others: others.slice(0, 6) };
}

/** A few example prompts that exist in the dictionary, to seed the empty state. */
export const TRANSLATE_SUGGESTIONS = ['Hello', 'How are you?', 'Thank you', 'How much?', 'Good'];
