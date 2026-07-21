import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { DIALECTS } from '@/content/dialectMeta';
import { STORIES } from '@/content/stories';
import { useTheme } from '@/lib/ThemeProvider';
import { useUserStore } from '@/stores/useUserStore';

export default function StoryList() {
  const theme = useTheme();
  const isPremium = useUserStore((s) => s.subscriptionTier !== 'free');

  return (
    <ScreenContainer>
      <Text style={{ fontSize: 26, fontWeight: '900', color: theme.textPrimary }}>Interactive Stories</Text>
      <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
        Make choices, hear native dialogue, and review vocabulary along the way.
      </Text>

      <View style={{ marginTop: 20, gap: 12 }}>
        {STORIES.map((story) => {
          const locked = story.isPremium && !isPremium;
          return (
            <AnimatedPressable
              key={story.id}
              onPress={() => (locked ? router.push('/paywall') : router.push(`/story/${story.id}`))}
              style={{ padding: 16, borderRadius: 20, backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border, opacity: locked ? 0.6 : 1 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 30 }}>📖</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16 }}>{story.title}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }} numberOfLines={2}>{story.description}</Text>
                  <Text style={{ color: theme.primary, fontSize: 11, marginTop: 4, fontWeight: '700' }}>{DIALECTS[story.dialectId].name}</Text>
                </View>
                <Text style={{ fontSize: 16 }}>{locked ? '🔒' : '▶️'}</Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
