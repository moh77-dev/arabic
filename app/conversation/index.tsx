import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { AI_CHARACTERS } from '@/content/characters';
import { DIALECTS } from '@/content/dialectMeta';
import { useTheme } from '@/lib/ThemeProvider';
import { useUserStore } from '@/stores/useUserStore';

export default function ConversationPicker() {
  const theme = useTheme();
  const isPremium = useUserStore((s) => s.subscriptionTier !== 'free');

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 26, fontWeight: '900', color: theme.textPrimary }}>AI Conversation Mode</Text>
      <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
        Practice with characters who talk back — order food, haggle, or catch up with grandma.
      </Text>

      <View style={{ marginTop: 20, gap: 12 }}>
        {AI_CHARACTERS.map((c) => {
          const locked = c.isPremium && !isPremium;
          return (
            <AnimatedPressable
              key={c.id}
              onPress={() => (locked ? router.push('/paywall') : router.push(`/conversation/${c.id}`))}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 14,
                borderRadius: 18,
                backgroundColor: theme.surfaceElevated,
                borderWidth: 1,
                borderColor: theme.border,
                opacity: locked ? 0.6 : 1,
              }}
            >
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: `${theme.primary}22`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 26 }}>{c.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{c.name} · {c.role}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  {DIALECTS[c.dialectId].name} · {'⭐'.repeat(c.difficulty)}
                </Text>
              </View>
              <Text style={{ fontSize: 18 }}>{locked ? '🔒' : '💬'}</Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
