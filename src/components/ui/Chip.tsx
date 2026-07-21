import React from 'react';
import { Text } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme } from '@/lib/ThemeProvider';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  emoji?: string;
}

export function Chip({ label, selected, onPress, emoji }: ChipProps) {
  const theme = useTheme();
  return (
    <AnimatedPressable
      onPress={onPress ?? (() => {})}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: selected ? theme.primary : theme.surfaceElevated,
        borderWidth: 2,
        borderColor: selected ? theme.primary : theme.border,
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
      }}
    >
      {emoji ? <Text style={{ fontSize: 16 }}>{emoji}</Text> : null}
      <Text style={{ color: selected ? theme.primaryText : theme.textPrimary, fontWeight: '700' }}>{label}</Text>
    </AnimatedPressable>
  );
}
