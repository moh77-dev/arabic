import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/lib/storage';
import type { ConversationScore, ConversationTurn } from '@/types';

interface ConversationState {
  historyByCharacter: Record<string, ConversationTurn[]>;
  lastScoreByCharacter: Record<string, ConversationScore>;
  completedConversationCount: number;
  appendTurn: (characterId: string, turn: ConversationTurn) => void;
  clearHistory: (characterId: string) => void;
  saveScore: (characterId: string, score: ConversationScore) => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set) => ({
      historyByCharacter: {},
      lastScoreByCharacter: {},
      completedConversationCount: 0,
      appendTurn: (characterId, turn) =>
        set((s) => ({
          historyByCharacter: {
            ...s.historyByCharacter,
            [characterId]: [...(s.historyByCharacter[characterId] ?? []), turn],
          },
        })),
      clearHistory: (characterId) =>
        set((s) => ({ historyByCharacter: { ...s.historyByCharacter, [characterId]: [] } })),
      saveScore: (characterId, score) =>
        set((s) => ({
          lastScoreByCharacter: { ...s.lastScoreByCharacter, [characterId]: score },
          completedConversationCount: s.completedConversationCount + 1,
        })),
    }),
    { name: 'lahja-conversations', storage: createJSONStorage(() => zustandMMKVStorage) },
  ),
);
