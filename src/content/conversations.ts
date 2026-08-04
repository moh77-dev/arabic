import { DIALECTS } from './dialectMeta';
import { getVocabByDialect } from './dialects';
import { ELOUED_CONVERSATIONS, type SampleConversation } from './dialects/elouedConversations';
import type { DialectId, VocabWord } from '@/types';

/**
 * Watch-&-speak scenes per dialect. El Oued has hand-authored dialogues; every other dialect gets
 * scenes generated from ITS OWN vocab (using each word's example sentence where available), so the
 * drill always shows phrases in the dialect you're studying — never Algerian for everyone.
 */

function lineFromWord(w: VocabWord, speaker: string) {
  return {
    speaker,
    arabic: w.exampleSentenceArabic ?? w.arabic,
    transliteration: w.exampleSentenceTranslit ?? w.transliteration,
    english: w.exampleSentenceEnglish ?? w.english,
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const GENERATED_CACHE: Partial<Record<DialectId, SampleConversation[]>> = {};

function generateForDialect(dialectId: DialectId): SampleConversation[] {
  const vocab = getVocabByDialect(dialectId);
  if (vocab.length === 0) return [];
  const name = DIALECTS[dialectId]?.name ?? 'Arabic';
  // Prefer words that carry a full example sentence — they read like real speech.
  const withExample = vocab.filter((w) => w.exampleSentenceArabic);
  const pool = withExample.length >= 3 ? withExample : vocab;
  const groups = chunk(pool.slice(0, 12), 4).slice(0, 3);
  return groups.map((g, gi) => ({
    id: `${dialectId}_conv_${gi}`,
    title: gi === 0 ? `${name} — everyday phrases` : `${name} — more phrases`,
    // Standalone phrases spoken by a native speaker (not a back-and-forth), labelled as such.
    lines: g.map((w) => lineFromWord(w, 'Native speaker')),
  }));
}

export function getConversationsForDialect(dialectId: DialectId): SampleConversation[] {
  if (dialectId === 'algerian_eloued') return ELOUED_CONVERSATIONS;
  if (!GENERATED_CACHE[dialectId]) GENERATED_CACHE[dialectId] = generateForDialect(dialectId);
  return GENERATED_CACHE[dialectId] ?? [];
}
