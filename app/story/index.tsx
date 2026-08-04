import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Icon } from '@/components/ui/Icon';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { DIALECTS } from '@/content/dialectMeta';
import { getStoriesForDialect } from '@/content/stories';
import { useTheme } from '@/lib/ThemeProvider';
import { useT } from '@/lib/i18n';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores/useUserStore';

export default function StoryList() {
  const theme = useTheme();
  const t = useT();
  const isPremium = useUserStore((s) => s.subscriptionTier !== 'free');
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const meta = DIALECTS[activeDialect] ?? DIALECTS.msa;
  const stories = useMemo(() => getStoriesForDialect(activeDialect), [activeDialect]);

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 26, fontWeight: '900', color: theme.textPrimary }}>{t('story.title')}</Text>
      <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
        {meta.flag} {meta.name} · make choices, hear native dialogue, review vocabulary.
      </Text>

      {stories.length === 0 ? (
        <View style={{ marginTop: 40, alignItems: 'center', paddingHorizontal: 24 }}>
          <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="souk" size={30} color={theme.textSecondary} />
          </View>
          <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
            Stories for {meta.name} are coming soon
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 6, textAlign: 'center' }}>
            Switch your dialect on the Learn tab to explore stories in El Oued, Algiers, Egyptian, Palestinian and more.
          </Text>
          <AnimatedPressable
            onPress={() => router.push('/(tabs)/learn')}
            style={{ marginTop: 20, backgroundColor: theme.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 }}
          >
            <Text style={{ color: theme.primaryText, fontWeight: '800' }}>Choose a dialect</Text>
          </AnimatedPressable>
        </View>
      ) : (
        <View style={{ marginTop: 20, gap: 12 }}>
          {stories.map((story) => {
            const locked = story.isPremium && !isPremium;
            return (
              <AnimatedPressable
                key={story.id}
                onPress={() => (locked ? router.push('/paywall') : router.push(`/story/${story.id}`))}
                style={{ padding: 16, borderRadius: 20, backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border, opacity: locked ? 0.6 : 1 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: `${theme.primary}18`, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="souk" size={22} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16 }}>{story.title}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }} numberOfLines={2}>{story.description}</Text>
                    <Text style={{ color: theme.primary, fontSize: 11, marginTop: 4, fontWeight: '700' }}>{DIALECTS[story.dialectId].name}</Text>
                  </View>
                  <Icon name={locked ? 'lock' : 'play'} size={20} color={theme.textSecondary} />
                </View>
              </AnimatedPressable>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}
