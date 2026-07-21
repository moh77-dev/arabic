import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/lib/ThemeProvider';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useSocialStore } from '@/stores/useSocialStore';
import { useUserStore } from '@/stores/useUserStore';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StreakAndRanks() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const gami = useGamificationStore();
  const friends = useSocialStore((s) => s.friends);
  const displayName = useUserStore((s) => s.displayName) ?? 'You';

  // Build the current week's fill state from the study heatmap (Mon–Sun).
  const weekDays = useMemo(() => {
    const today = new Date();
    const monday = new Date(today);
    const dow = (today.getDay() + 6) % 7; // 0 = Monday
    monday.setDate(today.getDate() - dow);
    return DAY_LABELS.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const studied = (gami.studyHeatmap[iso] ?? 0) > 0;
      const isToday = iso === today.toISOString().slice(0, 10);
      const isFuture = d > today;
      return { label, studied, isToday, isFuture };
    });
  }, [gami.studyHeatmap]);

  // Merge the user into the friends leaderboard for display.
  const board = useMemo(() => {
    const rows = [
      { userId: 'me', displayName, avatar: gami.activeAvatar, weeklyXp: gami.weeklyXp, isMe: true },
      ...friends.map((f) => ({ userId: f.userId, displayName: f.displayName, avatar: f.avatar, weeklyXp: f.weeklyXp, isMe: false })),
    ];
    return rows.sort((a, b) => b.weeklyXp - a.weeklyXp);
  }, [friends, displayName, gami.activeAvatar, gami.weeklyXp]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={theme.backdropGradient} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: theme.textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: -0.4 }}>Streak &amp; Ranks</Text>

        {/* Streak card */}
        <View style={{ marginTop: 18, backgroundColor: theme.surfaceElevated, borderRadius: 20, borderWidth: 1, borderColor: theme.border, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#ff6b3d1f', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="streak" size={26} color="#ff6b3d" />
            </View>
            <View>
              <Text style={{ color: theme.textPrimary, fontSize: 32, fontWeight: '900' }}>{gami.currentStreak} days</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                {gami.currentStreak >= gami.longestStreak && gami.currentStreak > 0 ? 'Your best yet — keep it lit' : `Best: ${gami.longestStreak} days`}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            {weekDays.map((d) => (
              <View key={d.label} style={{ alignItems: 'center', gap: 6 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: d.studied ? `${theme.primary}1f` : 'transparent',
                    borderWidth: d.isToday && !d.studied ? 1.5 : d.studied ? 0 : 1,
                    borderColor: d.isToday ? theme.primary : theme.border,
                    opacity: d.isFuture ? 0.45 : 1,
                  }}
                >
                  {d.studied ? <Icon name="check" size={16} color={theme.primary} /> : null}
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '700' }}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* League header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="trophy" size={20} color={theme.accentGold} />
            <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 17, textTransform: 'capitalize' }}>{gami.league} League</Text>
          </View>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Resets weekly</Text>
        </View>

        {/* Leaderboard */}
        <View style={{ marginTop: 12, backgroundColor: theme.surfaceElevated, borderRadius: 20, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}>
          <View style={{ backgroundColor: `${theme.primary}12`, paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>▲ TOP 5 PROMOTE</Text>
          </View>
          {board.map((row, i) => (
            <View
              key={row.userId}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: row.isMe ? `${theme.primary}12` : 'transparent',
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: theme.border,
              }}
            >
              <Text style={{ width: 20, textAlign: 'center', fontWeight: '900', color: i < 5 ? theme.primary : theme.textSecondary }}>{i + 1}</Text>
              <Avatar id={row.avatar} size={34} ring={row.isMe} />
              <Text style={{ flex: 1, color: row.isMe ? theme.primary : theme.textPrimary, fontWeight: row.isMe ? '800' : '600' }}>
                {row.displayName}
              </Text>
              <Text style={{ color: row.isMe ? theme.primary : theme.textSecondary, fontWeight: '700' }}>{row.weeklyXp} XP</Text>
            </View>
          ))}
          {friends.length === 0 && (
            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.border }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, textAlign: 'center' }}>
                Add friends to fill out your weekly league.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
