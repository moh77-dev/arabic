import { BlurView } from 'expo-blur';
import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/lib/ThemeProvider';

interface CardProps extends ViewProps {
  glass?: boolean;
  padded?: boolean;
}

export function Card({ glass, padded = true, style, children, ...rest }: CardProps) {
  const theme = useTheme();

  if (glass) {
    return (
      <BlurView
        intensity={40}
        tint={theme.mode === 'dark' ? 'dark' : 'light'}
        style={[
          {
            borderRadius: 20,
            overflow: 'hidden',
            padding: padded ? 16 : 0,
            borderWidth: 1,
            borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)',
          },
          style as any,
        ]}
        {...(rest as any)}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: theme.surfaceElevated,
          borderRadius: 20,
          padding: padded ? 16 : 0,
          borderWidth: 1,
          borderColor: theme.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
