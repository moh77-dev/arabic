import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

/**
 * react-native-mmkv is a JSI native module with no web binding — importing/instantiating it
 * on web throws immediately. On web we fall back to `window.localStorage`; everywhere else we
 * use the real MMKV instance. Both are wrapped behind the same `zustandMMKVStorage` adapter so
 * the rest of the app never has to branch on platform.
 */
const zustandMMKVStorage: StateStorage =
  Platform.OS === 'web'
    ? {
        setItem: (name, value) => {
          try {
            window.localStorage.setItem(name, value);
          } catch {
            // localStorage can throw in private-browsing/SSR contexts — ignore, non-fatal.
          }
        },
        getItem: (name) => {
          try {
            return window.localStorage.getItem(name);
          } catch {
            return null;
          }
        },
        removeItem: (name) => {
          try {
            window.localStorage.removeItem(name);
          } catch {
            // ignore
          }
        },
      }
    : (() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { MMKV } = require('react-native-mmkv');
        const storage = new MMKV({ id: 'lahja-storage' });
        return {
          setItem: (name: string, value: string) => storage.set(name, value),
          getItem: (name: string) => storage.getString(name) ?? null,
          removeItem: (name: string) => storage.delete(name),
        };
      })();

export { zustandMMKVStorage };
