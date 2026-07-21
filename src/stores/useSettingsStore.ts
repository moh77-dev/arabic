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
  /** The dialect currently shown on Home/Learn. Always a member of `enrolledDialects`. */
  activeDialect: DialectId;
  /** Every dialect the learner has started — lets them keep several going in parallel and switch. */
  enrolledDialects: DialectId[];
  offlineDownloadedLessonIds: string[];
  setThemePreference: (t: SettingsState['themePreference']) => void;
  setReduceMotion: (v: boolean) => void;
  setLargeText: (v: boolean) => void;
  setColorBlindMode: (v: SettingsState['colorBlindMode']) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleNotifications: () => void;
  setReminderTime: (t: string) => void;
  /** Switches the focused dialect, enrolling it first if it isn't already being learned. */
  setActiveDialect: (d: DialectId) => void;
  enrollDialect: (d: DialectId) => void;
  unenrollDialect: (d: DialectId) => void;
  markLessonDownloaded: (id: string) => void;
  removeDownloadedLesson: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      themePreference: 'system',
      reduceMotion: false,
      largeText: false,
      colorBlindMode: 'none',
      soundEffectsEnabled: true,
      hapticsEnabled: true,
      notificationsEnabled: true,
      reminderTime: '19:00',
      activeDialect: 'algerian_eloued',
      enrolledDialects: ['algerian_eloued'],
      offlineDownloadedLessonIds: [],
      setThemePreference: (themePreference) => set({ themePreference }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setLargeText: (largeText) => set({ largeText }),
      setColorBlindMode: (colorBlindMode) => set({ colorBlindMode }),
      toggleSound: () => set((s) => ({ soundEffectsEnabled: !s.soundEffectsEnabled })),
      toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
      toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      setReminderTime: (reminderTime) => set({ reminderTime }),
      setActiveDialect: (activeDialect) => {
        get().enrollDialect(activeDialect);
        set({ activeDialect });
      },
      enrollDialect: (d) =>
        set((s) => (s.enrolledDialects.includes(d) ? s : { enrolledDialects: [...s.enrolledDialects, d] })),
      unenrollDialect: (d) =>
        set((s) => {
          const enrolledDialects = s.enrolledDialects.filter((x) => x !== d);
          const nextEnrolled = enrolledDialects.length > 0 ? enrolledDialects : ['algerian_eloued' as DialectId];
          return {
            enrolledDialects: nextEnrolled,
            activeDialect: s.activeDialect === d ? nextEnrolled[0] : s.activeDialect,
          };
        }),
      markLessonDownloaded: (id) =>
        set((s) => ({ offlineDownloadedLessonIds: Array.from(new Set([...s.offlineDownloadedLessonIds, id])) })),
      removeDownloadedLesson: (id) =>
        set((s) => ({ offlineDownloadedLessonIds: s.offlineDownloadedLessonIds.filter((x) => x !== id) })),
    }),
    {
      name: 'lahja-settings',
      storage: createJSONStorage(() => zustandMMKVStorage),
      version: 1,
      // The Oran/Constantine/Annaba/Tlemcen/Kabyle Algerian dialects were retired; anyone who had
      // one enrolled from an older build gets it remapped to Algiers so nothing dangles.
      migrate: (persisted: any, _version) => {
        if (!persisted) return persisted;
        const RETIRED: Record<string, DialectId> = {
          algerian_oran: 'algerian_algiers',
          algerian_constantine: 'algerian_algiers',
          algerian_annaba: 'algerian_algiers',
          algerian_tlemcen: 'algerian_algiers',
          algerian_kabyle: 'algerian_algiers',
        };
        const remap = (id: string): DialectId => RETIRED[id] ?? (id as DialectId);
        const enrolled: DialectId[] = Array.isArray(persisted.enrolledDialects)
          ? Array.from(new Set(persisted.enrolledDialects.map(remap)))
          : ['algerian_eloued'];
        return {
          ...persisted,
          activeDialect: remap(persisted.activeDialect ?? 'algerian_eloued'),
          enrolledDialects: enrolled.length > 0 ? enrolled : ['algerian_eloued'],
        };
      },
    },
  ),
);
