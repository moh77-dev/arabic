import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/lib/ThemeProvider';
import { LEAGUE_ORDER } from '@/lib/gamificationMath';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useSocialStore } from '@/stores/useSocialStore';
import { useUserStore } from '@/stores/useUserStore';

const LEAGUE_EMOJI: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  sapphire: '🔷',
  ruby: '❤️',
  emerald: '💚',
  amethyst: '💜',
  diamond: '💎',
};

export default function Leaderboard() {
  const theme = useTheme();
  const gami = useGamificationStore();
  const friends = useSocialStore((s) => s.friends);
  const displayName = useUserStore((s) => s.displayName) ?? 'You';
  const [tab, setTab] = useState<'league' | 'friends'>('league');

  return (
    <ScreenContainer gradient>
      <Text style={{ fontSize: 26, fontWeight: '900', color: theme.textPrimary }}>Leaderboard</Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Chip label="League" selected={tab === 'league'} onPress={() => setTab('league')} />
        <Chip label="Friends" selected={tab === 'friends'} onPress={() => setTab('friends')} />
      </View>

      {tab === 'league' && (
        <View style={{ marginTop: 20 }}>
          <Card glass style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ fontSize: 56 }}>{LEAGUE_EMOJI[gami.league]}</Text>
            <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 22, marginTop: 8, textTransform: 'capitalize' }}>
              {gami.league} League
            </Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>{gami.weeklyXp} XP this week</Text>
          </Card>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            {LEAGUE_ORDER.map((l) => (
              <View
                key={l}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: l === gami.league ? `${theme.primary}22` : theme.surfaceElevated,
                  borderWidth: 1,
                  borderColor: l === gami.league ? theme.primary : theme.border,
                }}
              >
                <Text>{LEAGUE_EMOJI[l]}</Text>
                <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>{l}</Text>
              </View>
            ))}
          </View>

          <Card glass style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontWeight: '900', color: theme.textSecondary, width: 24 }}>1</Text>
              <Avatar id={gami.activeAvatar} size={36} ring />
              <Text style={{ flex: 1, color: theme.textPrimary, fontWeight: '700' }}>{displayName}</Text>
              <Text style={{ color: theme.textSecondary }}>{gami.weeklyXp} XP</Text>
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 12 }}>
              Compete against friends and climb the leagues. Finish top of your league each week to promote; finish
              bottom and you'll be demoted.
            </Text>
          </Card>
        </View>
      )}

      {tab === 'friends' && (
        <View style={{ marginTop: 20 }}>
          {friends.length === 0 ? (
            <Card glass>
              <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>No friends yet</Text>
              <Text style={{ color: theme.textSecondary, marginTop: 6 }}>
                Invite friends from Profile → Invite Friends to race for XP and compare streaks.
              </Text>
            </Card>
          ) : (
            <View style={{ gap: 8 }}>
              {friends.map((f) => (
                <AnimatedPressable key={f.userId} withHaptic={false}>
                  <Card glass>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Avatar id={f.avatar} size={36} />
                      <Text style={{ flex: 1, color: theme.textPrimary, fontWeight: '700' }}>{f.displayName}</Text>
                      <Text style={{ color: theme.textSecondary }}>{f.weeklyXp} XP</Text>
                    </View>
                  </Card>
                </AnimatedPressable>
              ))}
            </View>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
