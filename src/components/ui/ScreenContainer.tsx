import React from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/ThemeProvider';

interface ScreenContainerProps extends ViewProps {
  scroll?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function ScreenContainer({ scroll = true, edges = ['top'], style, children, ...rest }: ScreenContainerProps) {
  const theme = useTheme();
  const Wrapper = scroll ? ScrollView : View;
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: theme.background }}>
      <Wrapper
        {...(scroll
          ? { contentContainerStyle: [{ padding: 20, paddingBottom: 40 }, style] }
          : { style: [{ flex: 1, padding: 20 }, style] })}
        {...(rest as any)}
      >
        {children}
      </Wrapper>
    </SafeAreaView>
  );
}
