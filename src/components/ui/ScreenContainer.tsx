import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPageBackground } from '@/content/dialectBackdrops';
import { useTheme } from '@/lib/ThemeProvider';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface ScreenContainerProps extends ViewProps {
  scroll?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Kept for compatibility; the dialect-tinted wash now renders on every screen by default. */
  gradient?: boolean;
}

export function ScreenContainer({
  scroll = true,
  edges = ['top'],
  gradient: _gradient,
  style,
  children,
  ...rest
}: ScreenContainerProps) {
  const theme = useTheme();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const wash = getPageBackground(activeDialect, theme.mode);
  const Wrapper = scroll ? ScrollView : View;
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Soft, app-wide wash tinted to the active dialect's color. */}
      <LinearGradient colors={wash} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={edges} style={{ flex: 1 }}>
        <Wrapper
          {...(scroll
            ? { contentContainerStyle: [{ padding: 20, paddingBottom: 120 }, style] }
            : { style: [{ flex: 1, padding: 20 }, style] })}
          {...(rest as any)}
        >
          {children}
        </Wrapper>
      </SafeAreaView>
    </View>
  );
}
