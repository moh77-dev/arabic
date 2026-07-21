import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { useTheme } from '@/lib/ThemeProvider';

interface CardProps extends ViewProps {
  glass?: boolean;
  padded?: boolean;
}

const softShadow = Platform.select({
  web: { boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)' } as any,
  default: {
    shadowColor: '#0a0f1a',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
});

export function Card({ glass, padded = true, style, children, ...rest }: CardProps) {
  const theme = useTheme();

  if (glass) {
    return (
      <BlurView
        intensity={theme.mode === 'dark' ? 40 : 60}
        tint={theme.mode === 'dark' ? 'dark' : 'light'}
        style={[
          {
            borderRadius: 24,
            overflow: 'hidden',
            padding: padded ? 18 : 0,
            borderWidth: 1,
            borderColor: theme.glassBorder,
            backgroundColor: theme.glassTint,
          },
          softShadow,
          style as any,
        ]}
        {...(rest as any)}
      >
        {/* Faint top highlight to sell the "liquid glass" refraction — a thin bright line along
            the upper edge, the way light catches a curved glass surface. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: theme.glassHighlight,
          }}
        />
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
        softShadow,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
