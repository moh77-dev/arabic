import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { DIALECTS } from '@/content/dialectMeta';
import { useTheme } from '@/lib/ThemeProvider';
import { levelFromTotalXp } from '@/lib/gamificationMath';
import { supabase } from '@/lib/supabase';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores/useUserStore';

export default function Profile() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { displayName, isGuest, clearSession } = useUserStore();
  const gami = useGamificationStore();
  const completedLessonIds = useLessonStore((s) => s.completedLessonIds);
  const wordsKnown = useLessonStore((s) => Object.keys(s.srsCards).length);
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const { level } = levelFromTotalXp(gami.totalXp);
  const meta = DIALECTS[activeDialect] ?? DIALECTS.msa;

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => {});
    clearSession();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={theme.backdropGradient} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingHorizontal: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center' }}>
          <Avatar id={gami.activeAvatar} size={82} ring />
          <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '900', marginTop: 12 }}>{displayName ?? 'Learner'}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              backgroundColor: theme.mode === 'dark' ? 'rgba(201,162,83,0.16)' : '#fbf1dc',
              borderWidth: 1,
              borderColor: theme.mode === 'dark' ? '#3a2f1a' : '#e9d4a6',
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 5,
            }}
          >
            <Text style={{ fontSize: 13 }}>{meta.flag}</Text>
            <Text style={{ color: theme.mode === 'dark' ? '#e7d4a8' : '#9a7521', fontWeight: '700', fontSize: 12 }}>
              {meta.name} · Level {level}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
          <StatCard icon="streak" tint="#ff6b3d" value={`${gami.currentStreak}`} label="day streak" />
          <StatCard icon="star" tint={theme.primary} value={`${gami.totalXp}`} label="total XP" />
          <StatCard icon="learn" tint="#0ea5e9" value={`${wordsKnown}`} label="words known" />
        </View>

        {/* Recent activity */}
        <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginTop: 28 }}>RECENT ACTIVITY</Text>
        <View style={{ marginTop: 12, backgroundColor: theme.surfaceElevated, borderRadius: 18, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}>
          {completedLessonIds.length === 0 ? (
            <View style={{ padding: 16 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>
                Finish a lesson and it'll show up here.
              </Text>
            </View>
          ) : (
            <>
              <ActivityRow icon="check" tint={theme.primary} title={`Completed ${completedLessonIds.length} lesson${completedLessonIds.length > 1 ? 's' : ''}`} meta={`${gami.totalXp} XP earned`} first />
              <ActivityRow icon="chat" tint="#0ea5e9" title="Practiced with Anis" meta="AI conversation" />
              <ActivityRow icon="review" tint={theme.accentGold} title={`${wordsKnown} words in review`} meta="Spaced repetition" />
            </>
          )}
        </View>

        {/* Premium */}
        <View style={{ marginTop: 24, borderRadius: 20, overflow: 'hidden' }}>
          <LinearGradient
            colors={theme.mode === 'dark' ? ['#241d12', '#191308'] : ['#fbf1dc', '#f4e6c8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 18, borderRadius: 20, borderWidth: 1, borderColor: theme.mode === 'dark' ? '#3a2f1a' : '#e9d4a6', flexDirection: 'row', alignItems: 'center', gap: 14 }}
          >
            <Icon name="diamond" size={26} color={theme.accentDiamond} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.mode === 'dark' ? '#e7d4a8' : '#5c3f12', fontWeight: '900', fontSize: 15 }}>Lahja Premium</Text>
              <Text style={{ color: theme.mode === 'dark' ? '#c9a253' : '#9a7521', fontSize: 12 }}>All dialects & unlimited AI</Text>
            </View>
            <Button label="Unlock" onPress={() => router.push('/paywall')} size="md" fullWidth={false} />
          </LinearGradient>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
          <View style={{ flex: 1 }}>
            <Button label="🛍️  Shop" variant="secondary" onPress={() => router.push('/shop')} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="🏆  Awards" variant="secondary" onPress={() => router.push('/achievements')} />
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <Button label="Edit profile" onPress={() => router.push('/edit-profile')} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Button label={isGuest ? 'Create an account' : 'Sign Out'} variant="secondary" onPress={isGuest ? () => router.push('/(auth)/sign-up') : signOut} />
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, tint, value, label }: { icon: IconName; tint: string; value: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.surfaceElevated, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 14, alignItems: 'center' }}>
      <Icon name={icon} size={20} color={tint} />
      <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 18, marginTop: 6 }}>{value}</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 1, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

function ActivityRow({ icon, tint, title, meta, first }: { icon: IconName; tint: string; title: string; meta: string; first?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: first ? 0 : 1, borderTopColor: theme.border }}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${tint}1f`, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>{title}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{meta}</Text>
      </View>
    </View>
  );
}
