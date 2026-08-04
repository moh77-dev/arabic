import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Icon } from '@/components/ui/Icon';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { getCharactersForDialect } from '@/content/characters';
import { DIALECTS } from '@/content/dialectMeta';
import { useTheme } from '@/lib/ThemeProvider';
import { useT } from '@/lib/i18n';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores/useUserStore';
import type { DialectId } from '@/types';

/**
 * Free Talk — an open, unscripted roleplay: pick a local to chat with (or let it surprise you) and
 * hold a real conversation in your dialect. Distinct from "Ask Amine", which is the tutor hub for
 * corrections, grammar and quick lessons.
 */
export default function FreeTalk() {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const isPremium = useUserStore((s) => s.subscriptionTier !== 'free');
  const meta = DIALECTS[activeDialect] ?? DIALECTS.msa;
  const cast = useMemo(() => getCharactersForDialect(activeDialect), [activeDialect]);

  const open = (id: string, locked: boolean) => router.push(locked ? '/paywall' : `/conversation/${id}`);

  const surprise = () => {
    const unlocked = cast.filter((c) => !c.isPremium || isPremium);
    const pool = unlocked.length ? unlocked : cast;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    open(pick.id, pick.isPremium && !isPremium);
  };

  return (
    <ScreenContainer style={{ paddingTop: insets.top + 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <AnimatedPressable onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)'))} withHaptic={false}>
          <Icon name="chevronLeft" size={28} color={theme.textPrimary} />
        </AnimatedPressable>
        <Text style={{ color: theme.textPrimary, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 }}>{t('freetalk.title')}</Text>
      </View>
      <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 18 }}>
        A real, unscripted conversation in {meta.name} — no lesson, no right answer. Pick who you want to talk to.
      </Text>

      {/* Surprise me — jump into a random local. */}
      <AnimatedPressable
        onPress={surprise}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          backgroundColor: theme.primary,
          borderRadius: 22,
          padding: 18,
          marginBottom: 22,
          shadowColor: theme.primary,
          shadowOpacity: 0.4,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 7 },
        }}
      >
        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="freetalk" size={24} color={theme.primaryText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.primaryText, fontWeight: '900', fontSize: 16 }}>{t('freetalk.surprise')}</Text>
          <Text style={{ color: theme.primaryText, opacity: 0.85, fontSize: 13 }}>Drop into a chat with a random local</Text>
        </View>
        <Icon name="chevronRight" size={22} color={theme.primaryText} />
      </AnimatedPressable>

      <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginBottom: 12 }}>
        PEOPLE TO TALK TO
      </Text>
      <View style={{ gap: 12 }}>
        {cast.map((ch) => {
          const locked = ch.isPremium && !isPremium;
          return (
            <AnimatedPressable
              key={ch.id}
              onPress={() => open(ch.id, locked)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: theme.surfaceElevated,
                borderRadius: 22,
                padding: 16,
                opacity: locked ? 0.6 : 1,
                shadowColor: theme.primary,
                shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.12,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: `${theme.primary}1f`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 26 }}>{ch.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 15.5 }}>
                  {ch.name} · {ch.role}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {DIALECTS[ch.dialectId as DialectId]?.name ?? ch.dialectId} · {'★'.repeat(ch.difficulty)}
                </Text>
              </View>
              <Icon name={locked ? 'lock' : 'chat'} size={20} color={theme.textSecondary} />
            </AnimatedPressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
