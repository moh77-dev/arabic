import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createSRSCard, getDueCards, getWeakCards, reviewSRSCard } from '@/lib/srs';
import { zustandMMKVStorage } from '@/lib/storage';
import type { SRSCard, SRSGrade } from '@/types';

interface LessonState {
  completedLessonIds: string[];
  lessonAccuracy: Record<string, number>; // lessonId -> best accuracy 0..1
  srsCards: Record<string, SRSCard>; // wordId -> card
  currentUnitId: string | null;
  markLessonComplete: (lessonId: string, accuracy: number) => void;
  isLessonComplete: (lessonId: string) => boolean;
  ensureSRSCard: (wordId: string) => void;
  reviewWord: (wordId: string, grade: SRSGrade) => void;
  getDueWordIds: () => string[];
  getWeakWordIds: () => string[];
  setCurrentUnit: (unitId: string) => void;
  resetProgress: () => void;
}

export const useLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      completedLessonIds: [],
      lessonAccuracy: {},
      srsCards: {},
      currentUnitId: null,

      markLessonComplete: (lessonId, accuracy) =>
        set((s) => ({
          completedLessonIds: s.completedLessonIds.includes(lessonId)
            ? s.completedLessonIds
            : [...s.completedLessonIds, lessonId],
          lessonAccuracy: {
            ...s.lessonAccuracy,
            [lessonId]: Math.max(s.lessonAccuracy[lessonId] ?? 0, accuracy),
          },
        })),

      isLessonComplete: (lessonId) => get().completedLessonIds.includes(lessonId),

      ensureSRSCard: (wordId) =>
        set((s) => (s.srsCards[wordId] ? s : { srsCards: { ...s.srsCards, [wordId]: createSRSCard(wordId) } })),

      reviewWord: (wordId, grade) =>
        set((s) => {
          const existing = s.srsCards[wordId] ?? createSRSCard(wordId);
          return { srsCards: { ...s.srsCards, [wordId]: reviewSRSCard(existing, grade) } };
        }),

      getDueWordIds: () => getDueCards(Object.values(get().srsCards)).map((c) => c.wordId),
      getWeakWordIds: () => getWeakCards(Object.values(get().srsCards)).map((c) => c.wordId),

      setCurrentUnit: (currentUnitId) => set({ currentUnitId }),
      resetProgress: () => set({ completedLessonIds: [], lessonAccuracy: {}, srsCards: {} }),
    }),
    { name: 'lahja-lessons', storage: createJSONStorage(() => zustandMMKVStorage) },
  ),
);
