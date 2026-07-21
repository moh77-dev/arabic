import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';
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
        tabBarShowLabel: true,
        // Floating "liquid glass" pill: absolutely positioned with margin on all sides so the
        // blurred background shows real content behind it, rounded like an iOS 26 glass surface.
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 68,
          borderRadius: 28,
          borderTopWidth: 0,
          backgroundColor: Platform.OS === 'android' ? theme.glassTint : 'transparent',
          overflow: 'hidden',
          elevation: 0,
          shadowColor: '#0a0f1a',
          shadowOpacity: 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
        },
        tabBarBackground: () => (
          <BlurView
            intensity={theme.mode === 'dark' ? 50 : 70}
            tint={theme.mode === 'dark' ? 'dark' : 'light'}
            style={{ flex: 1, borderRadius: 28, borderWidth: 1, borderColor: theme.glassBorder }}
          />
        ),
        tabBarItemStyle: { paddingTop: 6 },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 10 },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{ICONS[route.name]}</Text>
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
