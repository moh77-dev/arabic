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
  displayName: string;
  email: string;
  password: string;
}

export default function SignUp() {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<FormData>({ defaultValues: { displayName: '', email: '', password: '' } });
  const continueAsGuest = useUserStore((s) => s.continueAsGuest);
  const setDisplayName = useUserStore((s) => s.setDisplayName);

  const tryAsGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)');
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setInfo(null);
    setLoading(true);
    const { data: result, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { display_name: data.displayName } },
    });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }
    // Remember their name locally for the profile + greeting.
    if (data.displayName.trim()) setDisplayName(data.displayName.trim());

    // No email-confirmation wall: with "Confirm email" disabled on the project, signUp already
    // returns a session. If it didn't, sign straight in with the same credentials (works the
    // moment confirmation is off) so the learner goes right through to the app.
    let session = result.session;
    if (!session) {
      const { data: signInData } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
      session = signInData?.session ?? null;
    }
    setLoading(false);

    if (session) {
      // Real, persistent Supabase account — the session is saved, so they stay signed in and can
      // sign back in later with this email + password.
      router.replace('/(tabs)');
      return;
    }
    // Only reached if the project still has email confirmation enabled. Don't block the learner —
    // let them straight into the app; their account already exists in Supabase for later sign-in.
    continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer>
      <View style={{ marginTop: 60, marginBottom: 32 }}>
        <Text style={{ fontSize: 34 }}>✨</Text>
        <Text style={{ fontSize: 30, fontWeight: '900', color: theme.textPrimary, marginTop: 12 }}>Create your account</Text>
        <Text style={{ fontSize: 16, color: theme.textSecondary, marginTop: 4 }}>
          Start your journey to speaking Arabic like a local.
        </Text>
      </View>

      <View style={{ gap: 16 }}>
        <Controller
          control={control}
          name="displayName"
          rules={{ required: true }}
          render={({ field }) => <TextField label="Name" placeholder="Your name" value={field.value} onChangeText={field.onChange} />}
        />
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
            <TextField label="Password" placeholder="At least 6 characters" secureTextEntry value={field.value} onChangeText={field.onChange} />
          )}
        />

        {error ? <Text style={{ color: theme.danger }}>{error}</Text> : null}
        {info ? (
          <View style={{ backgroundColor: `${theme.primary}14`, borderRadius: 12, padding: 12 }}>
            <Text style={{ color: theme.primary, fontWeight: '600' }}>{info}</Text>
          </View>
        ) : null}

        <Button label="Create Account" onPress={handleSubmit(onSubmit)} loading={loading} />

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 8 }}>
          <Text style={{ color: theme.textSecondary }}>Already have an account?</Text>
          <Link href="/(auth)/sign-in">
            <Text style={{ color: theme.primary, fontWeight: '700' }}>Sign in</Text>
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
