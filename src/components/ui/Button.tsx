import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme } from '@/lib/ThemeProvider';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type Size = 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  loading,
  icon,
  fullWidth = true,
}: ButtonProps) {
  const theme = useTheme();

  const bg = {
    primary: theme.primary,
    secondary: theme.surfaceElevated,
    ghost: 'transparent',
    danger: theme.danger,
    gold: theme.accentGold,
  }[variant];

  const textColor = {
    primary: theme.primaryText,
    secondary: theme.textPrimary,
    ghost: theme.primary,
    danger: '#ffffff',
    gold: '#3a2900',
  }[variant];

  const height = size === 'lg' ? 56 : 46;
  const isDisabled = disabled || loading;
  const isFilled = variant === 'primary' || variant === 'gold' || variant === 'danger';
  const hasShadow = isFilled && !isDisabled;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={{
        height,
        borderRadius: 20,
        backgroundColor: bg,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        opacity: isDisabled ? 0.5 : 1,
        borderWidth: variant === 'secondary' ? 2 : 0,
        borderColor: theme.border,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        paddingHorizontal: 24,
        ...(hasShadow
          ? {
              shadowColor: bg,
              shadowOpacity: 0.4,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
              elevation: 5,
            }
          : null),
      }}
    >
      {/* Premium glossy sheen: a bright highlight across the top fading to a faint shade at the
          bottom, painted over the solid fill. Gives filled buttons a polished, tactile feel
          without hard-coding a lighter/darker shade per color. */}
      {isFilled && (
        <>
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.05)', 'rgba(0,0,0,0.08)']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.45)' }} />
        </>
      )}
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text style={{ color: textColor, fontSize: 17, fontWeight: '800', letterSpacing: 0.2 }}>{label}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}
