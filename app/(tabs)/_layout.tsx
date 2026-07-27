import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme } from '@/lib/ThemeProvider';

const TAB_ICONS: Record<string, IconName> = {
  index: 'home',
  learn: 'learn',
  explore: 'explore',
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
          // Visible (not hidden) so the enlarged center Home button can lift above the bar.
          overflow: 'visible',
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
            style={{ flex: 1, borderRadius: 26, borderWidth: 1, borderColor: theme.glassBorder, overflow: 'hidden' }}
          />
        ),
        tabBarItemStyle: { paddingTop: 8 },
        tabBarLabelStyle: { fontWeight: '800', fontSize: 9, letterSpacing: 0.2 },
        tabBarIcon: ({ focused, color }) => {
          // Home is the centerpiece: a big, raised circular button that pops above the bar.
          if (route.name === 'index') {
            return (
              <View
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  marginTop: -22,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: theme.mode === 'dark' ? theme.surface : '#fff8ef',
                  shadowColor: theme.primary,
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 6 },
                }}
              >
                <Icon name="home" size={30} color={theme.primaryText} />
              </View>
            );
          }
          return <Icon name={TAB_ICONS[route.name] ?? 'home'} size={22} color={focused ? theme.primary : color} />;
        },
      })}
    >
      {/* Order sets the bar layout — Home sits dead center. */}
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarLabel: () => null }} />
      <Tabs.Screen name="streak" options={{ title: 'Streak' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      {/* Settings stays routable (from Profile) but is no longer a bottom tab. */}
      <Tabs.Screen name="settings" options={{ title: 'Settings', href: null }} />
    </Tabs>
  );
}
