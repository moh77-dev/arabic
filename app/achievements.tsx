import { Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ACHIEVEMENTS } from '@/content/achievements';
import { useTheme } from '@/lib/ThemeProvider';
import { useGamificationStore } from '@/stores/useGamificationStore';

const TIER_COLOR: Record<string, string> = {
  bronze: '#c17d00',
  silver: '#94a3b8',
  gold: '#f0a80e',
  platinum: '#38bdf8',
  legendary: '#a855f7',
};

export default function Achievements() {
  const theme = useTheme();
  const unlockedIds = useGamificationStore((s) => s.unlockedAchievementIds);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Achievements', headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.textPrimary }} />
      <ScreenContainer edges={[]}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedIds.includes(a.id);
            return (
              <View
                key={a.id}
                style={{
                  width: '47%',
                  padding: 14,
                  borderRadius: 18,
                  backgroundColor: unlocked ? `${TIER_COLOR[a.tier]}18` : theme.surfaceElevated,
                  borderWidth: 1.5,
                  borderColor: unlocked ? TIER_COLOR[a.tier] : theme.border,
                  opacity: unlocked ? 1 : 0.55,
                }}
              >
                <Text style={{ fontSize: 30 }}>{a.icon}</Text>
                <Text style={{ color: theme.textPrimary, fontWeight: '800', marginTop: 8 }}>{a.title}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{a.description}</Text>
                <Text style={{ color: TIER_COLOR[a.tier], fontSize: 11, marginTop: 6, fontWeight: '700', textTransform: 'uppercase' }}>{a.tier}</Text>
              </View>
            );
          })}
        </View>
      </ScreenContainer>
    </>
  );
}
