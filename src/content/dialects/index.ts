import { ELOUED_VOCAB, ELOUED_GRAMMAR_NOTES } from './eloued';
import { ELOUED_CONVERSATIONS } from './elouedConversations';
import { OTHER_ALGERIAN_VOCAB } from './otherAlgerian';
import { OTHER_ARABIC_VOCAB } from './otherArabic';
import type { DialectId, VocabWord } from '@/types';

export const ALL_VOCAB: VocabWord[] = [...ELOUED_VOCAB, ...OTHER_ALGERIAN_VOCAB, ...OTHER_ARABIC_VOCAB];

export const VOCAB_BY_ID: Record<string, VocabWord> = Object.fromEntries(ALL_VOCAB.map((w) => [w.id, w]));

export function getVocabByDialect(dialectId: DialectId): VocabWord[] {
  return ALL_VOCAB.filter((w) => w.dialectId === dialectId);
}

export function getVocabByCategory(dialectId: DialectId, category: VocabWord['category']): VocabWord[] {
  return ALL_VOCAB.filter((w) => w.dialectId === dialectId && w.category === category);
}

export { ELOUED_VOCAB, ELOUED_GRAMMAR_NOTES, ELOUED_CONVERSATIONS };
