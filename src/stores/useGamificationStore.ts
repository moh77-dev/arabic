import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { computeStreak, levelFromTotalXp, streakFreezeCost } from '@/lib/gamificationMath';
import { zustandMMKVStorage } from '@/lib/storage';
import type { League, UserGamification } from '@/types';

export interface DailyActivity {
  xp: number;
  lessonsCompleted: number;
  perfectLessons: number;
  speakingDone: number;
  wordsReviewed: number;
  conversationsCompleted: number;
}

const emptyActivity = (): DailyActivity => ({
  xp: 0,
  lessonsCompleted: 0,
  perfectLessons: 0,
  speakingDone: 0,
  wordsReviewed: 0,
  conversationsCompleted: 0,
});

interface GamificationState extends UserGamification {
  totalXp: number;
  league: League;
  dailyActivity: Record<string, DailyActivity>;
  /** Unit ids whose end-of-unit reward chest has already been claimed (so it pays out once). */
  claimedUnitRewards: string[];
  /** Claim a unit's reward chest. Returns false if already claimed; otherwise grants coins + gems. */
  claimUnitReward: (unitId: string) => boolean;
  recordActivity: (patch: Partial<DailyActivity>, isoDate?: string) => void;
  getTodayActivity: () => DailyActivity;
  addXp: (amount: number, opts?: { isoDate?: string; minutesStudied?: number }) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addDiamonds: (amount: number) => void;
  spendDiamonds: (amount: number) => boolean;
  buyStreakFreeze: () => boolean;
  useStreakFreeze: () => boolean;
  unlockAchievement: (id: string, xpReward: number, coinReward: number) => void;
  unlockAvatar: (id: string) => void;
  setActiveAvatar: (id: string) => void;
  addTitle: (title: string) => void;
  setActiveTitle: (title: string | null) => void;
  addSeasonPassXp: (amount: number) => void;
  resetWeeklyXp: () => void;
  setLeague: (league: League) => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      totalXp: 0,
      level: 1,
      coins: 100,
      diamonds: 10,
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      weeklyXp: 0,
      weeklyGoalXp: 500,
      freezesAvailable: 1,
      seasonPassLevel: 1,
      seasonPassXp: 0,
      titles: ['Newcomer'],
      activeTitle: 'Newcomer',
      unlockedAvatars: ['default_1'],
      activeAvatar: 'default_1',
      unlockedAchievementIds: [],
      studyHeatmap: {},
      league: 'bronze',
      dailyActivity: {},
      claimedUnitRewards: [],

      claimUnitReward: (unitId) => {
        const s = get();
        if (s.claimedUnitRewards.includes(unitId)) return false;
        set({
          claimedUnitRewards: [...s.claimedUnitRewards, unitId],
          coins: s.coins + 50,
          diamonds: s.diamonds + 3,
        });
        return true;
      },

      recordActivity: (patch, isoDate) => {
        const date = isoDate ?? todayISO();
        set((s) => {
          const current = s.dailyActivity[date] ?? emptyActivity();
          const merged: DailyActivity = {
            xp: current.xp + (patch.xp ?? 0),
            lessonsCompleted: current.lessonsCompleted + (patch.lessonsCompleted ?? 0),
            perfectLessons: current.perfectLessons + (patch.perfectLessons ?? 0),
            speakingDone: current.speakingDone + (patch.speakingDone ?? 0),
            wordsReviewed: current.wordsReviewed + (patch.wordsReviewed ?? 0),
            conversationsCompleted: current.conversationsCompleted + (patch.conversationsCompleted ?? 0),
          };
          return { dailyActivity: { ...s.dailyActivity, [date]: merged } };
        });
      },
      getTodayActivity: () => get().dailyActivity[todayISO()] ?? emptyActivity(),

      addXp: (amount, opts) => {
        const date = opts?.isoDate ?? todayISO();
        const state = get();
        const newTotalXp = state.totalXp + amount;
        const { level } = levelFromTotalXp(newTotalXp);
        const newStreak = computeStreak(state.lastStudyDate, state.currentStreak, date);
        set({
          totalXp: newTotalXp,
          xp: state.xp + amount,
          level,
          weeklyXp: state.weeklyXp + amount,
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          lastStudyDate: date,
          studyHeatmap: {
            ...state.studyHeatmap,
            [date]: (state.studyHeatmap[date] ?? 0) + (opts?.minutesStudied ?? 1),
          },
        });
        get().recordActivity({ xp: amount }, date);
      },

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
      spendCoins: (amount) => {
        const s = get();
        if (s.coins < amount) return false;
        set({ coins: s.coins - amount });
        return true;
      },
      addDiamonds: (amount) => set((s) => ({ diamonds: s.diamonds + amount })),
      spendDiamonds: (amount) => {
        const s = get();
        if (s.diamonds < amount) return false;
        set({ diamonds: s.diamonds - amount });
        return true;
      },
      buyStreakFreeze: () => {
        const cost = streakFreezeCost();
        const s = get();
        if (s.coins < cost) return false;
        set({ coins: s.coins - cost, freezesAvailable: s.freezesAvailable + 1 });
        return true;
      },
      useStreakFreeze: () => {
        const s = get();
        if (s.freezesAvailable <= 0) return false;
        set({ freezesAvailable: s.freezesAvailable - 1 });
        return true;
      },
      unlockAchievement: (id, xpReward, coinReward) => {
        const s = get();
        if (s.unlockedAchievementIds.includes(id)) return;
        set({
          unlockedAchievementIds: [...s.unlockedAchievementIds, id],
          coins: s.coins + coinReward,
        });
        get().addXp(xpReward);
      },
      unlockAvatar: (id) =>
        set((s) => ({ unlockedAvatars: Array.from(new Set([...s.unlockedAvatars, id])) })),
      setActiveAvatar: (activeAvatar) => set({ activeAvatar }),
      addTitle: (title) => set((s) => ({ titles: Array.from(new Set([...s.titles, title])) })),
      setActiveTitle: (activeTitle) => set({ activeTitle }),
      addSeasonPassXp: (amount) =>
        set((s) => {
          const newXp = s.seasonPassXp + amount;
          const level = Math.min(100, Math.floor(newXp / 1000) + 1);
          return { seasonPassXp: newXp, seasonPassLevel: level };
        }),
      resetWeeklyXp: () => set({ weeklyXp: 0 }),
      setLeague: (league) => set({ league }),
    }),
    { name: 'lahja-gamification', storage: createJSONStorage(() => zustandMMKVStorage) },
  ),
);
