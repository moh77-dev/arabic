import { ALL_VOCAB } from './dialects';
import type { DialectId, Exercise, ExerciseType, VocabWord } from '@/types';

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

/**
 * AI-generated exercises (from the generate-lesson function) often arrive missing the fields a given
 * type needs to be answerable — a multiple-choice with no `options`, or a `word_order` with no
 * `wordBank` — which renders a dead-end the learner can't interact with. This repairs each exercise
 * so every one is actually playable: derives a word bank from the answer, ensures choice options
 * include the correct answer (or falls back to a typed answer), and avoids mic-only items.
 */
export function normalizeGeneratedExercises(exercises: Exercise[]): Exercise[] {
  const mcTypes: ExerciseType[] = ['vocabulary', 'listening', 'matching', 'picture_match', 'speed_round', 'quiz'];
  const speakTypes: ExerciseType[] = ['speaking', 'pronunciation', 'shadowing'];

  return (exercises ?? []).map((e, i) => {
    const id = e.id || `ai_${i}`;
    const answerText = Array.isArray(e.correctAnswer) ? e.correctAnswer.join(' ') : (e.correctAnswer ?? '');

    if (e.type === 'word_order') {
      const words = (e.wordBank && e.wordBank.length ? e.wordBank : answerText.split(/\s+/)).filter(Boolean);
      return { ...e, id, wordBank: seededShuffle(words, id.length + i), correctAnswer: answerText || words.join(' ') };
    }

    if (mcTypes.includes(e.type)) {
      let opts = (e.options ?? []).filter(Boolean);
      if (opts.length < 2) return { ...e, id, type: 'typing', options: undefined, correctAnswer: answerText };
      if (answerText && !opts.includes(answerText)) opts = [answerText, ...opts];
      opts = Array.from(new Set(opts)).slice(0, 4);
      if (answerText && !opts.includes(answerText)) opts[opts.length - 1] = answerText;
      return { ...e, id, options: opts, correctAnswer: answerText };
    }

    // Generated speaking items depend on the mic (unreliable on web) — make them typed instead.
    if (speakTypes.includes(e.type)) return { ...e, id, type: 'translation', correctAnswer: answerText };

    return { ...e, id, correctAnswer: answerText };
  });
}

/** Ready-made sentence-building (word-order) exercises from the dialect's example sentences. */
export function generateSentenceBuilders(dialectId: DialectId, count = 4): Exercise[] {
  const pool = ALL_VOCAB.filter((w) => w.dialectId === dialectId && w.exampleSentenceTranslit && w.exampleSentenceEnglish);
  return seededShuffle(pool, dialectId.length + count)
    .slice(0, count)
    .map((w, i) => {
      const words = (w.exampleSentenceTranslit ?? '').split(' ').filter(Boolean);
      return {
        id: `sb_${w.id}_${i}`,
        type: 'word_order' as const,
        dialectId,
        relatedWordId: w.id,
        prompt: `Build the sentence: "${w.exampleSentenceEnglish}"`,
        promptArabic: w.exampleSentenceArabic,
        wordBank: seededShuffle(words, w.id.length + i),
        correctAnswer: words,
        xpReward: 12,
      };
    });
}

export { ALL_VOCAB };
