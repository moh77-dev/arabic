import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface StreakFlameProps {
  streak: number;
  size?: 'sm' | 'lg';
}

export function StreakFlame({ streak, size = 'sm' }: StreakFlameProps) {
  const scale = useSharedValue(1);
  const isActive = streak > 0;

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(withSequence(withTiming(1.12, { duration: 650 }), withTiming(1, { duration: 650 })), -1, true);
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const fontSize = size === 'lg' ? 40 : 20;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Animated.Text style={[{ fontSize, opacity: isActive ? 1 : 0.35 }, animatedStyle]}>🔥</Animated.Text>
      <Text style={{ fontSize: size === 'lg' ? 28 : 16, fontWeight: '900', color: isActive ? '#f0a80e' : '#9aa1ae' }}>
        {streak}
      </Text>
    </View>
  );
}
