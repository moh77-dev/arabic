import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/ThemeProvider';

interface ScreenContainerProps extends ViewProps {
  scroll?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Renders a soft brand-colored gradient wash behind the content, for screens with glass cards. */
  gradient?: boolean;
}

export function ScreenContainer({
  scroll = true,
  edges = ['top'],
  gradient = false,
  style,
  children,
  ...rest
}: ScreenContainerProps) {
  const theme = useTheme();
  const Wrapper = scroll ? ScrollView : View;
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {gradient && (
        <LinearGradient
          colors={theme.backdropGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
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
