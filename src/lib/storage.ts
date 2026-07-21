import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const storage = new MMKV({ id: 'lahja-storage' });

/** Adapter so Zustand's `persist` middleware can use MMKV instead of AsyncStorage. */
export const zustandMMKVStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
};
