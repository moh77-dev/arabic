import React from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@/lib/ThemeProvider';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 13 }}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          {
            height: 54,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: error ? theme.danger : theme.border,
            paddingHorizontal: 16,
            color: theme.textPrimary,
            backgroundColor: theme.surfaceElevated,
            fontSize: 16,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={{ color: theme.danger, fontSize: 12 }}>{error}</Text> : null}
    </View>
  );
}
