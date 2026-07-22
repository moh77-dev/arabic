import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/lib/ThemeProvider';
import { fetchLeaderboard } from '@/lib/leaderboard';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useSocialStore } from '@/stores/useSocialStore';
import { useUserStore } from '@/stores/useUserStore';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PROMOTE_ZONE = 5; // top 5 promote
const DEMOTE_ZONE = 5; // bottom 5 demote

export default function StreakAndRanks() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const gami = useGamificationStore();
  const leaderboard = useSocialStore((s) => s.leaderboard);
  const setLeaderboard = useSocialStore((s) => s.setLeaderboard);
  const displayName = useUserStore((s) => s.displayName) ?? 'You';

  // Pull the global weekly leaderboard for the current league (falls back to rivals offline).
  useEffect(() => {
    let alive = true;
    fetchLeaderboard(gami.league).then((rows) => {
      if (alive) setLeaderboard(rows);
    });
    return () => {
      alive = false;
    };
  }, [gami.league, setLeaderboard]);

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

  // Merge the local "You" row into the global league board, sort, and assign ranks.
  const board = useMemo(() => {
    const rows = [
      { userId: 'me', displayName, avatar: gami.activeAvatar, weeklyXp: gami.weeklyXp, isMe: true, isRival: false },
      ...leaderboard.map((e) => ({
        userId: e.userId,
        displayName: e.displayName,
        avatar: e.avatar,
        weeklyXp: e.weeklyXp,
        isMe: false,
        isRival: e.userId.startsWith('rival_'),
      })),
    ];
    return rows
      .sort((a, b) => b.weeklyXp - a.weeklyXp)
      .map((row, i) => ({ ...row, rank: i + 1 }));
  }, [leaderboard, displayName, gami.activeAvatar, gami.weeklyXp]);

  const myRank = board.find((r) => r.isMe)?.rank ?? 0;
  const hasRivals = board.some((r) => r.isRival);

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
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            {myRank > 0 ? `You're #${myRank} of ${board.length}` : 'Resets weekly'}
          </Text>
        </View>

        {/* Leaderboard */}
        <View style={{ marginTop: 12, backgroundColor: theme.surfaceElevated, borderRadius: 20, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}>
          <View style={{ backgroundColor: `${theme.primary}12`, paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>▲ TOP {PROMOTE_ZONE} PROMOTE</Text>
          </View>
          {board.map((row, i) => {
            const promotes = row.rank <= PROMOTE_ZONE;
            const demotes = board.length > PROMOTE_ZONE + DEMOTE_ZONE && row.rank > board.length - DEMOTE_ZONE;
            // A divider marks where the demotion zone begins.
            const showDemoteDivider = demotes && board[i - 1] && board[i - 1].rank <= board.length - DEMOTE_ZONE;
            const medal = row.rank <= 3 ? ['#f0a80e', '#9aa1ae', '#c17d3a'][row.rank - 1] : undefined;
            return (
              <React.Fragment key={row.userId}>
                {showDemoteDivider && (
                  <View style={{ backgroundColor: `${theme.danger}14`, paddingVertical: 6, alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border }}>
                    <Text style={{ color: theme.danger, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>▼ DEMOTION ZONE</Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: row.isMe ? `${theme.primary}14` : 'transparent',
                    borderTopWidth: i === 0 || showDemoteDivider ? 0 : 1,
                    borderTopColor: theme.border,
                  }}
                >
                  <Text style={{ width: 22, textAlign: 'center', fontWeight: '900', color: medal ?? (promotes ? theme.primary : theme.textSecondary) }}>
                    {row.rank}
                  </Text>
                  <Avatar id={row.avatar} size={34} ring={row.isMe} />
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <Text style={{ color: row.isMe ? theme.primary : theme.textPrimary, fontWeight: row.isMe ? '800' : '600' }} numberOfLines={1}>
                      {row.isMe ? 'You' : row.displayName}
                    </Text>
                    {row.isRival && (
                      <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '700', backgroundColor: theme.surface, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, overflow: 'hidden' }}>
                        practice
                      </Text>
                    )}
                  </View>
                  <Text style={{ color: row.isMe ? theme.primary : theme.textSecondary, fontWeight: '700' }}>{row.weeklyXp} XP</Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {hasRivals && (
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 10, textAlign: 'center' }}>
            Practice rivals fill empty seats until more learners join your league.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
