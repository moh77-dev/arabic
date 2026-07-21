import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

/**
 * Thin wrapper so exercise/gamification code doesn't import expo-haptics directly everywhere.
 * expo-haptics throws (not just no-ops) when the underlying vibration API is unavailable, which
 * happens on most desktop browsers — so every call is a no-op on web instead of calling through.
 */
export const haptic = {
  tap: () => (isWeb ? undefined : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  select: () => (isWeb ? undefined : Haptics.selectionAsync()),
  success: () => (isWeb ? undefined : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => (isWeb ? undefined : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => (isWeb ? undefined : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  heavy: () => (isWeb ? undefined : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
};
