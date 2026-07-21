import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme } from '@/lib/ThemeProvider';

const TAB_ICONS: Record<string, IconName> = {
  index: 'home',
  learn: 'learn',
  streak: 'streak',
  profile: 'profile',
  settings: 'settings',
};

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 66,
          borderRadius: 26,
          borderTopWidth: 0,
          backgroundColor: Platform.OS === 'android' ? theme.glassTint : 'transparent',
          overflow: 'hidden',
          elevation: 0,
          shadowColor: '#0f172a',
          shadowOpacity: 0.16,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 12 },
        },
        tabBarBackground: () => (
          <BlurView
            intensity={theme.mode === 'dark' ? 50 : 70}
            tint={theme.mode === 'dark' ? 'dark' : 'light'}
            style={{ flex: 1, borderRadius: 26, borderWidth: 1, borderColor: theme.glassBorder }}
          />
        ),
        tabBarItemStyle: { paddingTop: 8 },
        tabBarLabelStyle: { fontWeight: '800', fontSize: 9, letterSpacing: 0.2 },
        tabBarIcon: ({ focused, color }) => (
          <Icon name={TAB_ICONS[route.name] ?? 'home'} size={22} color={focused ? theme.primary : color} />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="streak" options={{ title: 'Streak' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
