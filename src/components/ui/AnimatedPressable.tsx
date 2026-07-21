import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic } from '@/lib/haptics';
import { useSettingsStore } from '@/stores/useSettingsStore';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  scaleTo?: number;
  withHaptic?: boolean;
  children: React.ReactNode;
}

/** Base for every tappable surface in the app — gives the uniform "press down" micro-interaction. */
export function AnimatedPressable({ scaleTo = 0.96, withHaptic = true, onPressIn, onPressOut, onPress, style, children, ...rest }: Props) {
  const scale = useSharedValue(1);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      style={[animatedStyle, style as any]}
      onPressIn={(e) => {
        if (!reduceMotion) scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reduceMotion) scale.value = withSpring(1, { damping: 12, stiffness: 250 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (withHaptic && hapticsEnabled) haptic.tap();
        onPress?.(e);
      }}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  );
}
