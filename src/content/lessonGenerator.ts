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
  const others = pool.filter((w) => w.id !== word.id && w.category === word.category);
  const fallback = pool.filter((w) => w.id !== word.id);
  const source = others.length >= count ? others : fallback;
  return seededShuffle(source, word.id.length * 31)
    .slice(0, count)
    .map((w) => w.english);
}

/** Builds one exercise per vocab word, cycling through exercise types for variety. */
export function generateExercisesForWords(words: VocabWord[], dialectVocabPool: VocabWord[]): Exercise[] {
  const cycle: ExerciseType[] = [
    'vocabulary',
    'listening',
    'matching',
    'translation',
    'typing',
    'word_order',
    'picture_match',
    'speed_round',
  ];

  return words.map((word, i) => {
    const type = cycle[i % cycle.length];
    const base = {
      id: `${word.id}_ex`,
      dialectId: word.dialectId,
      relatedWordId: word.id,
      xpReward: 10,
    };

    switch (type) {
      case 'vocabulary':
      case 'picture_match':
        return {
          ...base,
          type,
          prompt: `What does "${word.arabic}" mean?`,
          promptArabic: word.arabic,
          audioUrl: word.audioUrl,
          imageUrl: undefined,
          options: seededShuffle([word.english, ...distractorsFor(word, dialectVocabPool, 3)], i + 7),
          correctAnswer: word.english,
        };
      case 'listening':
        return {
          ...base,
          type,
          prompt: 'Listen and choose the correct translation.',
          // No recorded native audio exists yet — the listening exercise speaks this via
          // on-device TTS (see src/lib/speech.ts) rather than a silent, non-functional prompt.
          promptArabic: word.arabic,
          audioUrl: word.audioUrl,
          options: seededShuffle([word.english, ...distractorsFor(word, dialectVocabPool, 3)], i + 13),
          correctAnswer: word.english,
        };
      case 'matching':
        return {
          ...base,
          type,
          prompt: `Match "${word.transliteration}" to its meaning.`,
          promptArabic: word.arabic,
          options: seededShuffle([word.english, ...distractorsFor(word, dialectVocabPool, 3)], i + 19),
          correctAnswer: word.english,
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
          prompt: `Type the transliteration for: "${word.english}"`,
          correctAnswer: word.transliteration.toLowerCase(),
        };
      case 'word_order':
        return {
          ...base,
          type,
          prompt: word.exampleSentenceEnglish
            ? `Put the words in order: "${word.exampleSentenceEnglish}"`
            : `Put the word in order: "${word.english}"`,
          wordBank: seededShuffle(
            (word.exampleSentenceTranslit ?? word.transliteration).split(' '),
            i + 23,
          ),
          correctAnswer: (word.exampleSentenceTranslit ?? word.transliteration).split(' '),
        };
      case 'speed_round':
        return {
          ...base,
          type,
          prompt: `Quick! "${word.arabic}" means...`,
          options: seededShuffle([word.english, ...distractorsFor(word, dialectVocabPool, 3)], i + 29),
          correctAnswer: word.english,
          xpReward: 15,
        };
      default:
        return {
          ...base,
          type: 'vocabulary',
          prompt: `What does "${word.arabic}" mean?`,
          options: [word.english],
          correctAnswer: word.english,
        };
    }
  });
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
