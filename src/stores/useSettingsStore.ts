import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/lib/storage';
import type { DialectId } from '@/types';

interface SettingsState {
  themePreference: 'light' | 'dark' | 'system';
  reduceMotion: boolean;
  largeText: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  soundEffectsEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  reminderTime: string;
  activeDialect: DialectId;
  offlineDownloadedLessonIds: string[];
  setThemePreference: (t: SettingsState['themePreference']) => void;
  setReduceMotion: (v: boolean) => void;
  setLargeText: (v: boolean) => void;
  setColorBlindMode: (v: SettingsState['colorBlindMode']) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleNotifications: () => void;
  setReminderTime: (t: string) => void;
  setActiveDialect: (d: DialectId) => void;
  markLessonDownloaded: (id: string) => void;
  removeDownloadedLesson: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      reduceMotion: false,
      largeText: false,
      colorBlindMode: 'none',
      soundEffectsEnabled: true,
      hapticsEnabled: true,
      notificationsEnabled: true,
      reminderTime: '19:00',
      activeDialect: 'algerian_eloued',
      offlineDownloadedLessonIds: [],
      setThemePreference: (themePreference) => set({ themePreference }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setLargeText: (largeText) => set({ largeText }),
      setColorBlindMode: (colorBlindMode) => set({ colorBlindMode }),
      toggleSound: () => set((s) => ({ soundEffectsEnabled: !s.soundEffectsEnabled })),
      toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
      toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      setReminderTime: (reminderTime) => set({ reminderTime }),
      setActiveDialect: (activeDialect) => set({ activeDialect }),
      markLessonDownloaded: (id) =>
        set((s) => ({ offlineDownloadedLessonIds: Array.from(new Set([...s.offlineDownloadedLessonIds, id])) })),
      removeDownloadedLesson: (id) =>
        set((s) => ({ offlineDownloadedLessonIds: s.offlineDownloadedLessonIds.filter((x) => x !== id) })),
    }),
    { name: 'lahja-settings', storage: createJSONStorage(() => zustandMMKVStorage) },
  ),
);
