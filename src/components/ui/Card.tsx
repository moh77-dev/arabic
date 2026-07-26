import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { useTheme } from '@/lib/ThemeProvider';

interface CardProps extends ViewProps {
  glass?: boolean;
  padded?: boolean;
}

// Layered, warm-tinted depth — a close contact shadow plus a soft ambient one — reads more
// premium than a single flat drop shadow.
const softShadow = Platform.select({
  web: { boxShadow: '0 1px 2px rgba(58, 33, 12, 0.06), 0 12px 34px rgba(58, 33, 12, 0.10)' } as any,
  default: {
    shadowColor: '#3a210c',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
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
          borderRadius: 22,
          padding: padded ? 18 : 0,
          overflow: 'hidden',
        },
        softShadow,
        style,
      ]}
      {...rest}
    >
      {/* Fine bright hairline along the top edge — the way light catches a polished surface. */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: theme.glassHighlight }} />
      {children}
    </View>
  );
}
