import { ALL_VOCAB } from './dialects';
import type { Exercise, ExerciseType, VocabWord } from '@/types';

/** Deterministic PRNG so generated lessons are stable across app runs (no re-shuffling on every render). */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distractorsFor(word: VocabWord, pool: VocabWord[], count: number): string[] {
  const others = pool.filter((w) => w.id !== word.id && w.category === word.category && w.english !== word.english);
  const fallback = pool.filter((w) => w.id !== word.id && w.english !== word.english);
  const source = others.length >= count ? others : fallback;
  return seededShuffle(source, word.id.length * 31 + count)
    .slice(0, count)
    .map((w) => w.english);
}

export interface GrammarNote {
  title: string;
  explanation: string;
  comparisons?: VocabWord['crossDialect'];
}

/** A rich "learn this" card shown before a word is ever quizzed. */
function teachCard(word: VocabWord): Exercise {
  return {
    id: `${word.id}_teach`,
    type: 'teach',
    dialectId: word.dialectId,
    relatedWordId: word.id,
    prompt: word.english,
    promptArabic: word.arabic,
    correctAnswer: word.english,
    xpReward: 3,
  };
}

/** One practice item of a given type for a word. */
function makePractice(word: VocabWord, type: ExerciseType, pool: VocabWord[], seed: number): Exercise {
  const base = { id: `${word.id}_p${seed}`, dialectId: word.dialectId, relatedWordId: word.id, xpReward: 10 };
  switch (type) {
    case 'listening':
      return {
        ...base,
        type,
        prompt: 'Listen and choose the correct translation.',
        promptArabic: word.arabic,
        options: seededShuffle([word.english, ...distractorsFor(word, pool, 3)], seed + 13),
        correctAnswer: word.english,
      };
    case 'matching':
      return {
        ...base,
        type,
        prompt: `Which one means "${word.english}"?`,
        options: seededShuffle(
          [
            word.arabic,
            ...seededShuffle(pool.filter((w) => w.id !== word.id), seed + 5)
              .slice(0, 3)
              .map((w) => w.arabic),
          ],
          seed + 19,
        ),
        correctAnswer: word.arabic,
      };
    case 'translation':
      return {
        ...base,
        type,
        prompt: `Translate to English: "${word.arabic}" (${word.transliteration})`,
        correctAnswer: word.english,
      };
    case 'typing':
      return {
        ...base,
        type,
        prompt: `Type the transliteration for "${word.english}"`,
        promptArabic: word.arabic,
        correctAnswer: word.transliteration.toLowerCase(),
      };
    case 'word_order':
      return {
        ...base,
        type,
        prompt: word.exampleSentenceEnglish
          ? `Build the sentence: "${word.exampleSentenceEnglish}"`
          : `Put it in order: "${word.english}"`,
        wordBank: seededShuffle((word.exampleSentenceTranslit ?? word.transliteration).split(' '), seed + 23),
        correctAnswer: (word.exampleSentenceTranslit ?? word.transliteration).split(' '),
      };
    case 'speed_round':
      return {
        ...base,
        type,
        prompt: `Quick! "${word.arabic}" means…`,
        options: seededShuffle([word.english, ...distractorsFor(word, pool, 3)], seed + 29),
        correctAnswer: word.english,
        xpReward: 15,
      };
    case 'vocabulary':
    default:
      return {
        ...base,
        type: 'vocabulary',
        prompt: `What does "${word.arabic}" mean?`,
        promptArabic: word.arabic,
        options: seededShuffle([word.english, ...distractorsFor(word, pool, 3)], seed + 7),
        correctAnswer: word.english,
      };
  }
}

const PRACTICE_CYCLE: ExerciseType[] = [
  'vocabulary',
  'matching',
  'listening',
  'translation',
  'typing',
  'word_order',
  'speed_round',
];

/**
 * Builds a full, teach-first lesson: every word is introduced with a rich teaching card, then
 * practiced several ways, followed by a couple of speaking reps, any grammar mini-lessons, and a
 * flashcard review. This makes lessons meaningfully longer and actually instructional rather than
 * a quick quiz. Roughly ~4-5 activities per word.
 */
export function generateExercisesForWords(
  words: VocabWord[],
  dialectVocabPool: VocabWord[],
  opts?: { grammarNotes?: GrammarNote[] },
): Exercise[] {
  if (words.length === 0) return [];
  const out: Exercise[] = [];

  // 1) Learn — teach each word.
  words.forEach((w) => out.push(teachCard(w)));

  // 2) Practice — two interleaved rounds with rotating types so it stays varied.
  words.forEach((w, i) => out.push(makePractice(w, PRACTICE_CYCLE[i % PRACTICE_CYCLE.length], dialectVocabPool, i + 1)));
  words.forEach((w, i) =>
    out.push(makePractice(w, PRACTICE_CYCLE[(i + 3) % PRACTICE_CYCLE.length], dialectVocabPool, i + 200)),
  );

  // 3) Speaking — say a few of the words aloud.
  words.slice(0, Math.min(3, words.length)).forEach((w) => out.push(generateSpeakingExercise(w)));

  // 4) Grammar mini-lessons (if any apply to this lesson).
  (opts?.grammarNotes ?? []).forEach((g, gi) =>
    out.push({
      id: `${words[0].id}_gram${gi}`,
      type: 'grammar_teach',
      dialectId: words[0].dialectId,
      prompt: g.title,
      correctAnswer: '',
      explanation: g.explanation,
      grammar: { title: g.title, explanation: g.explanation, comparisons: g.comparisons },
      xpReward: 5,
    }),
  );

  // 5) Review — flashcards for the whole set.
  out.push(...generateFlashcards(words));

  return out;
}

export function generateSpeakingExercise(word: VocabWord): Exercise {
  return {
    id: `${word.id}_speak`,
    type: 'speaking',
    dialectId: word.dialectId,
    relatedWordId: word.id,
    prompt: `Say: "${word.transliteration}"`,
    promptArabic: word.arabic,
    audioUrl: word.audioUrl,
    correctAnswer: word.transliteration,
    xpReward: 15,
  };
}

export function generateFlashcards(words: VocabWord[]): Exercise[] {
  return words.map((word) => ({
    id: `${word.id}_flash`,
    type: 'flashcard' as const,
    dialectId: word.dialectId,
    relatedWordId: word.id,
    prompt: word.transliteration,
    promptArabic: word.arabic,
    correctAnswer: word.english,
    xpReward: 5,
  }));
}

export { ALL_VOCAB };
