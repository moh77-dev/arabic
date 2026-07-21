import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { useTheme } from '@/lib/ThemeProvider';
import { supabase } from '@/lib/supabase';

interface FormData {
  email: string;
  password: string;
}

export default function SignIn() {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<FormData>({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword(data);
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer>
      <View style={{ marginTop: 60, marginBottom: 32 }}>
        <Text style={{ fontSize: 34 }}>🕌</Text>
        <Text style={{ fontSize: 30, fontWeight: '900', color: theme.textPrimary, marginTop: 12 }}>Welcome back</Text>
        <Text style={{ fontSize: 16, color: theme.textSecondary, marginTop: 4 }}>
          Sign in to keep your streak alive.
        </Text>
      </View>

      <View style={{ gap: 16 }}>
        <Controller
          control={control}
          name="email"
          rules={{ required: true, pattern: /^\S+@\S+\.\S+$/ }}
          render={({ field }) => (
            <TextField label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={field.value} onChangeText={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="password"
          rules={{ required: true, minLength: 6 }}
          render={({ field }) => (
            <TextField label="Password" placeholder="••••••••" secureTextEntry value={field.value} onChangeText={field.onChange} />
          )}
        />

        {error ? <Text style={{ color: theme.danger }}>{error}</Text> : null}

        <Button label="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} />

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 8 }}>
          <Text style={{ color: theme.textSecondary }}>New to Lahja?</Text>
          <Link href="/(auth)/sign-up">
            <Text style={{ color: theme.primary, fontWeight: '700' }}>Create an account</Text>
          </Link>
        </View>
      </View>
    </ScreenContainer>
  );
}
