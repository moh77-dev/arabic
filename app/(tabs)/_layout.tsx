import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '@/lib/ThemeProvider';

const ICONS: Record<string, string> = {
  index: '🏠',
  learn: '📚',
  practice: '🔁',
  leaderboard: '🏆',
  profile: '👤',
};

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surfaceElevated, borderTopColor: theme.border, height: 84, paddingTop: 8 },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{ICONS[route.name]}</Text>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Ranks' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
