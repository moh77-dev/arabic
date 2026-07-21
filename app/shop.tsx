import { Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AVATAR_EMOJI } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { GemCounter } from '@/components/ui/GemCounter';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/lib/ThemeProvider';
import { streakFreezeCost } from '@/lib/gamificationMath';
import { haptic } from '@/lib/haptics';
import { notify } from '@/lib/platformAlert';
import { useGamificationStore } from '@/stores/useGamificationStore';

const AVATAR_SHOP: { id: string; cost: number; currency: 'coins' | 'diamonds' }[] = [
  { id: 'camel', cost: 150, currency: 'coins' },
  { id: 'falcon', cost: 150, currency: 'coins' },
  { id: 'oasis', cost: 200, currency: 'coins' },
  { id: 'crescent', cost: 8, currency: 'diamonds' },
  { id: 'tea', cost: 200, currency: 'coins' },
  { id: 'desert_fox', cost: 10, currency: 'diamonds' },
];

export default function Shop() {
  const theme = useTheme();
  const gami = useGamificationStore();

  const buyFreeze = () => {
    const ok = gami.buyStreakFreeze();
    if (ok) {
      haptic.success();
      notify('Streak freeze purchased!', "You're now protected if you miss a day.");
    } else {
      notify('Not enough coins', `A streak freeze costs ${streakFreezeCost()} coins.`);
    }
  };

  const buyAvatar = (id: string, cost: number, currency: 'coins' | 'diamonds') => {
    if (gami.unlockedAvatars.includes(id)) {
      gami.setActiveAvatar(id);
      return;
    }
    const ok = currency === 'coins' ? gami.spendCoins(cost) : gami.spendDiamonds(cost);
    if (ok) {
      gami.unlockAvatar(id);
      gami.setActiveAvatar(id);
      haptic.success();
    } else {
      notify('Not enough currency', `You need ${cost} ${currency} to unlock this avatar.`);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Shop',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.textPrimary,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <GemCounter icon="🪙" value={gami.coins} />
              <GemCounter icon="💎" value={gami.diamonds} />
            </View>
          ),
        }}
      />
      <ScreenContainer edges={[]}>
        <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800' }}>Power-ups</Text>
        <AnimatedPressable onPress={buyFreeze} style={{ marginTop: 10 }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 26 }}>🧊</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>Streak Freeze</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Owned: {gami.freezesAvailable}</Text>
              </View>
              <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>🪙 {streakFreezeCost()}</Text>
            </View>
          </Card>
        </AnimatedPressable>

        <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 24 }}>Avatars</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
          {AVATAR_SHOP.map((item) => {
            const owned = gami.unlockedAvatars.includes(item.id);
            const active = gami.activeAvatar === item.id;
            return (
              <AnimatedPressable
                key={item.id}
                onPress={() => buyAvatar(item.id, item.cost, item.currency)}
                style={{
                  width: '30%',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: theme.surfaceElevated,
                  borderWidth: 2,
                  borderColor: active ? theme.primary : theme.border,
                }}
              >
                <Text style={{ fontSize: 32 }}>{AVATAR_EMOJI[item.id]}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 6 }}>
                  {owned ? (active ? 'Active' : 'Owned') : `${item.currency === 'coins' ? '🪙' : '💎'} ${item.cost}`}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </ScreenContainer>
    </>
  );
}
