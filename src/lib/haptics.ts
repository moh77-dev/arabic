import * as Haptics from 'expo-haptics';

/** Thin wrapper so exercise/gamification code doesn't import expo-haptics directly everywhere. */
export const haptic = {
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  select: () => Haptics.selectionAsync(),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
};
