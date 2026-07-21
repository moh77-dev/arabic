import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/lib/ThemeProvider';
import { levelFromTotalXp } from '@/lib/gamificationMath';
import { supabase } from '@/lib/supabase';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useLessonStore } from '@/stores/useLessonStore';
import { useUserStore } from '@/stores/useUserStore';

const MENU: { icon: string; label: string; href: string }[] = [
  { icon: '🏆', label: 'Achievements', href: '/achievements' },
  { icon: '🎟️', label: 'Season Pass', href: '/season-pass' },
  { icon: '🛍️', label: 'Shop', href: '/shop' },
  { icon: '⭐', label: 'Go Premium', href: '/paywall' },
  { icon: '⚙️', label: 'Settings', href: '/settings' },
];

export default function Profile() {
  const theme = useTheme();
  const { displayName, email, subscriptionTier, clearSession } = useUserStore();
  const gami = useGamificationStore();
  const completedLessonIds = useLessonStore((s) => s.completedLessonIds);
  const { level } = levelFromTotalXp(gami.totalXp);

  const signOut = async () => {
    await supabase.auth.signOut();
    clearSession();
    router.replace('/(auth)/sign-in');
  };

  return (
    <ScreenContainer gradient>
      <View style={{ alignItems: 'center', marginTop: 12 }}>
        <Avatar id={gami.activeAvatar} size={88} ring />
        <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '900', marginTop: 12 }}>{displayName ?? 'Learner'}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{email}</Text>
        {gami.activeTitle && (
          <View style={{ marginTop: 8, backgroundColor: `${theme.accentGold}22`, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ color: theme.accentGold, fontWeight: '700', fontSize: 12 }}>{gami.activeTitle}</Text>
          </View>
        )}
        {subscriptionTier !== 'free' && (
          <View style={{ marginTop: 6, backgroundColor: `${theme.primary}22`, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>
              {subscriptionTier === 'family' ? 'Family Plan' : 'Premium'}
            </Text>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 24 }}>
        <StatBox icon="🏅" value={level} label="Level" />
        <StatBox icon="🔥" value={gami.currentStreak} label="Streak" />
        <StatBox icon="📗" value={completedLessonIds.length} label="Lessons" />
        <StatBox icon="⚡" value={gami.totalXp} label="Total XP" />
      </View>

      <View style={{ marginTop: 28, gap: 10 }}>
        {MENU.map((item) => (
          <AnimatedPressable key={item.href} onPress={() => router.push(item.href as any)}>
            <Card glass>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                <Text style={{ flex: 1, color: theme.textPrimary, fontWeight: '700' }}>{item.label}</Text>
                <Text style={{ color: theme.textSecondary }}>›</Text>
              </View>
            </Card>
          </AnimatedPressable>
        ))}
      </View>

      <View style={{ marginTop: 24 }}>
        <Button label="Sign Out" variant="secondary" onPress={signOut} />
      </View>
    </ScreenContainer>
  );
}

function StatBox({ icon, value, label }: { icon: string; value: number; label: string }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 16, marginTop: 2 }}>{value}</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{label}</Text>
    </View>
  );
}
