import { DIALECTS } from './dialectMeta';
import { ELOUED_GRAMMAR_NOTES } from './dialects';
import { getVocabByDialect, getVocabByCategory } from './dialects';
import { generateExercisesForWords, type GrammarNote } from './lessonGenerator';
import type { DialectId, Lesson, Unit, VocabCategory } from '@/types';

/**
 * Which El Oued grammar note (if any) to teach inside a given category's lesson. Spreads the
 * three flagship grammar notes across the tracks so learners meet the ق→g shift, ma-...-sh
 * negation, and ntaε possession in context rather than all at once.
 */
const ELOUED_GRAMMAR_BY_CATEGORY: Partial<Record<VocabCategory, string>> = {
  greetings: 'eloued_gram_qaf',
  daily_life: 'eloued_gram_negation',
  family: 'eloued_gram_possession',
};

function grammarNotesFor(dialectId: DialectId, category: VocabCategory): GrammarNote[] {
  if (dialectId !== 'algerian_eloued') return [];
  const noteId = ELOUED_GRAMMAR_BY_CATEGORY[category];
  if (!noteId) return [];
  const note = ELOUED_GRAMMAR_NOTES.find((n) => n.id === noteId);
  return note ? [{ title: note.title, explanation: note.explanation, comparisons: note.comparisons as any }] : [];
}

const CATEGORY_LABEL: Partial<Record<VocabCategory, { title: string; titleArabic: string; icon: string }>> = {
  greetings: { title: 'Greetings', titleArabic: 'التّحايا', icon: '👋' },
  daily_life: { title: 'Daily Speech', titleArabic: 'الحديث اليومي', icon: '💬' },
  family: { title: 'Family', titleArabic: 'العائلة', icon: '👪' },
  market: { title: 'At the Market', titleArabic: 'في السّوق', icon: '🧺' },
  religion: { title: 'Religious Phrases', titleArabic: 'العبارات الدّينية', icon: '🕌' },
  ramadan: { title: 'Ramadan', titleArabic: 'رمضان', icon: '🌙' },
  football: { title: 'Football Talk', titleArabic: 'حديث الكورة', icon: '⚽' },
  school: { title: 'School Life', titleArabic: 'الحياة المدرسية', icon: '🎓' },
  business: { title: 'Business', titleArabic: 'العمل والتّجارة', icon: '💼' },
  marriage: { title: 'Weddings', titleArabic: 'الأعراس', icon: '💍' },
  slang: { title: 'Slang & Everyday Words', titleArabic: 'الدّارجة', icon: '😎' },
  expressions: { title: 'Expressions', titleArabic: 'التّعابير', icon: '🗣️' },
  idioms: { title: 'Idioms & Proverbs', titleArabic: 'الأمثال', icon: '📜' },
};

function buildLessonsForCategories(dialectId: DialectId, categories: VocabCategory[], unitId: string): Lesson[] {
  const dialectVocab = getVocabByDialect(dialectId);
  return categories
    .map((cat) => {
      const words = getVocabByCategory(dialectId, cat);
      if (words.length === 0) return null;
      const label = CATEGORY_LABEL[cat] ?? { title: cat, titleArabic: cat, icon: '📘' };
      const exercises = generateExercisesForWords(words, dialectVocab, { grammarNotes: grammarNotesFor(dialectId, cat) });
      const lesson: Lesson = {
        id: `${unitId}_${cat}`,
        unitId,
        dialectId,
        title: label.title,
        titleArabic: label.titleArabic,
        description: `Learn and practice ${words.length} essential ${label.title.toLowerCase()} words and phrases.`,
        category: cat,
        exercises,
        xpReward: exercises.reduce((sum, e) => sum + e.xpReward, 0),
        estimatedMinutes: Math.max(3, Math.round(exercises.length * 0.8)),
        difficulty: Math.min(5, Math.max(1, Math.round(words.reduce((s, w) => s + w.difficulty, 0) / words.length))) as 1 | 2 | 3 | 4 | 5,
      };
      return lesson;
    })
    .filter((l): l is Lesson => l !== null);
}

// ---- El Oued: the flagship, most detailed track ----
const ELOUED_UNIT_DEFS: { id: string; title: string; titleArabic: string; icon: string; categories: VocabCategory[]; colorFrom: string; colorTo: string }[] = [
  { id: 'eloued_u1', title: 'Greetings', titleArabic: 'التّحايا', icon: '👋', categories: ['greetings'], colorFrom: '#1ab86a', colorTo: '#0f7a47' },
  { id: 'eloued_u2', title: 'Everyday Speech', titleArabic: 'حياة يومية', icon: '💬', categories: ['daily_life', 'time'], colorFrom: '#38bdf8', colorTo: '#0ea5e9' },
  { id: 'eloued_u3', title: 'Family & Home', titleArabic: 'العائلة و الدّار', icon: '👪', categories: ['family'], colorFrom: '#f0a80e', colorTo: '#c17d00' },
  { id: 'eloued_u4', title: 'The Market', titleArabic: 'السّوق', icon: '🧺', categories: ['market'], colorFrom: '#f5a524', colorTo: '#d97706' },
  { id: 'eloued_u5', title: 'Faith & Ramadan', titleArabic: 'الدّين ورمضان', icon: '🕌', categories: ['religion', 'ramadan'], colorFrom: '#7ce7ab', colorTo: '#1ab86a' },
  { id: 'eloued_u6', title: 'Football & School', titleArabic: 'الكورة والمدرسة', icon: '⚽', categories: ['football', 'school'], colorFrom: '#38bdf8', colorTo: '#1ab86a' },
  { id: 'eloued_u7', title: 'Business & Marriage', titleArabic: 'العمل والعرس', icon: '💼', categories: ['business', 'marriage'], colorFrom: '#f0a80e', colorTo: '#f5a524' },
  { id: 'eloued_u8', title: 'Slang, Idioms & Wit', titleArabic: 'الدّارجة والأمثال', icon: '📜', categories: ['slang', 'expressions', 'idioms'], colorFrom: '#0f9a56', colorTo: '#0a5c34' },
];

export const ELOUED_UNITS: Unit[] = ELOUED_UNIT_DEFS.map((def, i) => ({
  id: def.id,
  dialectId: 'algerian_eloued',
  title: def.title,
  description: `Unit ${i + 1} of the Algerian Arabic track.`,
  icon: def.icon,
  colorFrom: def.colorFrom,
  colorTo: def.colorTo,
  lessonIds: buildLessonsForCategories('algerian_eloued', def.categories, def.id).map((l) => l.id),
  order: i,
}));

export const ELOUED_LESSONS: Lesson[] = ELOUED_UNIT_DEFS.flatMap((def) =>
  buildLessonsForCategories('algerian_eloued', def.categories, def.id),
);

// ---- Starter unit (1 unit, all available vocab) for every other dialect ----
const OTHER_DIALECT_IDS: DialectId[] = [
  'msa',
  'moroccan',
  'tunisian',
  'libyan',
  'egyptian',
  'levantine',
  'palestinian',
  'lebanese',
  'syrian',
  'jordanian',
  'saudi',
  'gulf',
  'iraqi',
  'sudanese',
  'yemeni',
];

export const OTHER_UNITS: Unit[] = OTHER_DIALECT_IDS.map((dialectId, i) => {
  const unitId = `${dialectId}_starter`;
  const words = getVocabByDialect(dialectId);
  const categories = Array.from(new Set(words.map((w) => w.category)));
  const lessons = buildLessonsForCategories(dialectId, categories, unitId);
  return {
    id: unitId,
    dialectId,
    title: `${DIALECTS[dialectId].name} Starter`,
    description: `A first taste of ${DIALECTS[dialectId].name}.`,
    icon: DIALECTS[dialectId].flag,
    colorFrom: '#1ab86a',
    colorTo: '#0f7a47',
    lessonIds: lessons.map((l) => l.id),
    order: i,
  };
});

export const OTHER_LESSONS: Lesson[] = OTHER_DIALECT_IDS.flatMap((dialectId) => {
  const unitId = `${dialectId}_starter`;
  const words = getVocabByDialect(dialectId);
  const categories = Array.from(new Set(words.map((w) => w.category)));
  return buildLessonsForCategories(dialectId, categories, unitId);
});

export const ALL_UNITS: Unit[] = [...ELOUED_UNITS, ...OTHER_UNITS];
export const ALL_LESSONS: Lesson[] = [...ELOUED_LESSONS, ...OTHER_LESSONS];

export const UNITS_BY_ID: Record<string, Unit> = Object.fromEntries(ALL_UNITS.map((u) => [u.id, u]));
export const LESSONS_BY_ID: Record<string, Lesson> = Object.fromEntries(ALL_LESSONS.map((l) => [l.id, l]));

export function getUnitsForDialect(dialectId: DialectId): Unit[] {
  return ALL_UNITS.filter((u) => u.dialectId === dialectId).sort((a, b) => a.order - b.order);
}
