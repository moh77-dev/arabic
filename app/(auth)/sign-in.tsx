import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { useTheme } from '@/lib/ThemeProvider';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/useUserStore';

interface FormData {
  email: string;
  password: string;
}

export default function SignIn() {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<FormData>({ defaultValues: { email: '', password: '' } });
  const continueAsGuest = useUserStore((s) => s.continueAsGuest);

  const tryAsGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)');
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword(data);
    setLoading(false);
    if (signInError) {
      // Map Supabase's terse auth errors to something a learner can act on.
      const msg = signInError.message.toLowerCase();
      if (msg.includes('email not confirmed')) {
        setError('Your email isn’t confirmed yet — check your inbox for the confirmation link, then try again.');
      } else if (msg.includes('invalid login credentials')) {
        setError('Wrong email or password. If you just signed up, you may need to confirm your email first (check your inbox).');
      } else {
        setError(signInError.message);
      }
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

        <AnimatedPressable onPress={tryAsGuest} withHaptic={false} style={{ marginTop: 4 }}>
          <Text style={{ color: theme.textSecondary, textAlign: 'center', textDecorationLine: 'underline' }}>
            Try without an account
          </Text>
        </AnimatedPressable>
      </View>
    </ScreenContainer>
  );
}
