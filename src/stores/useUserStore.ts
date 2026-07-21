import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandMMKVStorage } from '@/lib/storage';
import type { OnboardingProfile, SubscriptionTier } from '@/types';

interface UserState {
  userId: string | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  onboardingComplete: boolean;
  onboardingProfile: Partial<OnboardingProfile>;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: string | null;
  setSession: (opts: { userId: string; email: string | null }) => void;
  clearSession: () => void;
  setDisplayName: (name: string) => void;
  setAvatarUrl: (url: string) => void;
  updateOnboardingProfile: (patch: Partial<OnboardingProfile>) => void;
  completeOnboarding: () => void;
  setSubscription: (tier: SubscriptionTier, expiresAt: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      displayName: null,
      avatarUrl: null,
      onboardingComplete: false,
      onboardingProfile: {},
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      setSession: ({ userId, email }) => set({ userId, email }),
      clearSession: () =>
        set({
          userId: null,
          email: null,
          displayName: null,
          avatarUrl: null,
          subscriptionTier: 'free',
          subscriptionExpiresAt: null,
        }),
      setDisplayName: (displayName) => set({ displayName }),
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      updateOnboardingProfile: (patch) =>
        set((s) => ({ onboardingProfile: { ...s.onboardingProfile, ...patch } })),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setSubscription: (subscriptionTier, subscriptionExpiresAt) =>
        set({ subscriptionTier, subscriptionExpiresAt }),
    }),
    { name: 'lahja-user', storage: createJSONStorage(() => zustandMMKVStorage) },
  ),
);
