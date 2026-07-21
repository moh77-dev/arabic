import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/lib/ThemeProvider';

interface XPBarProps {
  xpIntoLevel: number;
  xpForNextLevel: number;
  level: number;
}

export function XPBar({ xpIntoLevel, xpForNextLevel, level }: XPBarProps) {
  const theme = useTheme();
  const pct = useSharedValue(0);

  useEffect(() => {
    pct.value = withTiming(Math.min(1, xpIntoLevel / xpForNextLevel), { duration: 600 });
  }, [xpIntoLevel, xpForNextLevel]);

  const barStyle = useAnimatedStyle(() => ({ width: `${pct.value * 100}%` }));

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>Level {level}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          {xpIntoLevel} / {xpForNextLevel} XP
        </Text>
      </View>
      <View style={{ height: 12, borderRadius: 999, backgroundColor: theme.border, overflow: 'hidden' }}>
        <Animated.View style={[{ height: '100%', backgroundColor: theme.primary, borderRadius: 999 }, barStyle]} />
      </View>
    </View>
  );
}
