import { Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/lib/ThemeProvider';
import { useGamificationStore } from '@/stores/useGamificationStore';

const REWARD_TRACK = Array.from({ length: 20 }, (_, i) => {
  const level = i + 1;
  if (level % 5 === 0) return { level, icon: '💎', label: `${level * 2} Diamonds` };
  if (level % 3 === 0) return { level, icon: '🖼️', label: 'Avatar frame' };
  return { level, icon: '🪙', label: `${level * 20} Coins` };
});

export default function SeasonPass() {
  const theme = useTheme();
  const { seasonPassLevel, seasonPassXp } = useGamificationStore();
  const xpIntoLevel = seasonPassXp % 1000;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Season Pass', headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.textPrimary }} />
      <ScreenContainer edges={[]}>
        <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ fontSize: 40 }}>🎟️</Text>
          <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 22, marginTop: 8 }}>Season Pass — Level {seasonPassLevel}</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>{xpIntoLevel}/1000 XP to next tier</Text>
          <View style={{ height: 10, width: '100%', borderRadius: 999, backgroundColor: theme.border, marginTop: 12, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${(xpIntoLevel / 1000) * 100}%`, backgroundColor: theme.accentGold }} />
          </View>
        </Card>

        <View style={{ marginTop: 20, gap: 8 }}>
          {REWARD_TRACK.map((r) => {
            const unlocked = r.level <= seasonPassLevel;
            return (
              <View
                key={r.level}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 14,
                  backgroundColor: unlocked ? `${theme.accentGold}18` : theme.surfaceElevated,
                  borderWidth: 1,
                  borderColor: unlocked ? theme.accentGold : theme.border,
                }}
              >
                <Text style={{ width: 32, textAlign: 'center', color: theme.textSecondary, fontWeight: '800' }}>{r.level}</Text>
                <Text style={{ fontSize: 22 }}>{r.icon}</Text>
                <Text style={{ flex: 1, color: theme.textPrimary, fontWeight: '700' }}>{r.label}</Text>
                <Text style={{ fontSize: 16 }}>{unlocked ? '✅' : '🔒'}</Text>
              </View>
            );
          })}
        </View>
      </ScreenContainer>
    </>
  );
}
