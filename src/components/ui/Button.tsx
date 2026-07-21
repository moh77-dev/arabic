import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
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
  const hasShadow = (variant === 'primary' || variant === 'gold' || variant === 'danger') && !isDisabled;

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
              shadowOpacity: 0.35,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 },
              elevation: 4,
            }
          : null),
      }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text style={{ color: textColor, fontSize: 17, fontWeight: '800' }}>{label}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}
