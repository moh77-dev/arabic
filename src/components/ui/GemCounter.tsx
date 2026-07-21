import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/lib/ThemeProvider';

interface GemCounterProps {
  icon: '🪙' | '💎' | '❤️';
  value: number;
}

export function GemCounter({ icon, value }: GemCounterProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.surfaceElevated,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 13 }}>{value}</Text>
    </View>
  );
}
