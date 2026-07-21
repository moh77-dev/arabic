import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/lib/storage';
import type { LeaderboardEntry } from '@/types';

interface Friend {
  userId: string;
  displayName: string;
  avatar: string;
  weeklyXp: number;
  status: 'accepted' | 'pending_sent' | 'pending_received';
}

interface SocialState {
  friends: Friend[];
  leaderboard: LeaderboardEntry[];
  setFriends: (friends: Friend[]) => void;
  addFriendRequest: (friend: Friend) => void;
  acceptFriend: (userId: string) => void;
  removeFriend: (userId: string) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
      friends: [],
      leaderboard: [],
      setFriends: (friends) => set({ friends }),
      addFriendRequest: (friend) => set((s) => ({ friends: [...s.friends, friend] })),
      acceptFriend: (userId) =>
        set((s) => ({
          friends: s.friends.map((f) => (f.userId === userId ? { ...f, status: 'accepted' } : f)),
        })),
      removeFriend: (userId) => set((s) => ({ friends: s.friends.filter((f) => f.userId !== userId) })),
      setLeaderboard: (leaderboard) => set({ leaderboard }),
    }),
    { name: 'lahja-social', storage: createJSONStorage(() => zustandMMKVStorage) },
  ),
);
