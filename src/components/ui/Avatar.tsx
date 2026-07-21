import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/lib/ThemeProvider';

const AVATAR_EMOJI: Record<string, string> = {
  default_1: '🧑',
  default_2: '👩',
  camel: '🐫',
  falcon: '🦅',
  oasis: '🌴',
  crescent: '🌙',
  tea: '🍵',
  desert_fox: '🦊',
};

interface AvatarProps {
  id: string;
  size?: number;
  ring?: boolean;
}

export function Avatar({ id, size = 48, ring }: AvatarProps) {
  const theme = useTheme();
  const emoji = AVATAR_EMOJI[id] ?? '🧑';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 3 : 1,
        borderColor: ring ? theme.primary : theme.border,
      }}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

export { AVATAR_EMOJI };
