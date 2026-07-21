/* eslint-disable no-undef */
jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (k, v) => store.set(k, v),
      getString: (k) => store.get(k),
      getBoolean: (k) => store.get(k),
      getNumber: (k) => store.get(k),
      delete: (k) => store.delete(k),
      clearAll: () => store.clear(),
    })),
  };
});

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));
