import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/lib/AuthProvider';
import { useTheme } from '@/lib/ThemeProvider';
import { useUserStore } from '@/stores/useUserStore';

export default function Index() {
  const { session, isLoading } = useAuth();
  const onboardingComplete = useUserStore((s) => s.onboardingComplete);
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!onboardingComplete) return <Redirect href="/onboarding" />;
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(tabs)" />;
}
