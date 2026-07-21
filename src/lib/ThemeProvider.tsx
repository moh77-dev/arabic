import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type Theme } from '@/lib/theme';
import { useSettingsStore } from '@/stores/useSettingsStore';

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore((s) => s.themePreference);

  const theme = useMemo(() => {
    const resolved = preference === 'system' ? (systemScheme ?? 'light') : preference;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
