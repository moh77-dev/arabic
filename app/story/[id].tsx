import { useLocalSearchParams, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { ACHIEVEMENTS } from '@/content/achievements';
import { VOCAB_BY_ID } from '@/content/dialects';
import { STORIES } from '@/content/stories';
import { fonts } from '@/lib/fonts';
import { useTheme } from '@/lib/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { useGamificationStore } from '@/stores/useGamificationStore';

export default function StoryRunner() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const story = STORIES.find((s) => s.id === id);
  const [nodeId, setNodeId] = useState(story?.startNodeId ?? '');
  const [visitedVocab, setVisitedVocab] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);

  const addXp = useGamificationStore((s) => s.addXp);
  const addCoins = useGamificationStore((s) => s.addCoins);
  const unlockAchievement = useGamificationStore((s) => s.unlockAchievement);

  if (!story) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.textPrimary }}>Story not found.</Text>
      </View>
    );
  }

  const node = story.nodes.find((n) => n.id === nodeId)!;

  const choose = (nextNodeId: string, highlights?: string[]) => {
    haptic.select();
    if (highlights) setVisitedVocab((prev) => new Set([...prev, ...highlights]));
    const next = story.nodes.find((n) => n.id === nextNodeId);
    if (next?.isEnding) {
      setNodeId(nextNodeId);
      const achievement = ACHIEVEMENTS.find((a) => a.id === 'ach_story_finished')!;
      addXp(50);
      addCoins(20);
      unlockAchievement(achievement.id, 0, 0);
      setFinished(true);
      return;
    }
    setNodeId(nextNodeId);
  };

  if (finished) {
    const words = Array.from(visitedVocab).map((wid) => VOCAB_BY_ID[wid]).filter(Boolean);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 24 }}>
        <Text style={{ fontSize: 60, textAlign: 'center' }}>🎉</Text>
        <Text style={{ fontSize: 24, fontWeight: '900', color: theme.textPrimary, textAlign: 'center', marginTop: 12 }}>
          Story Complete!
        </Text>
        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 4 }}>+50 XP · +20 coins</Text>

        {words.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ color: theme.textPrimary, fontWeight: '800', marginBottom: 8 }}>Vocabulary review</Text>
            {words.map((w) => (
              <View key={w.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ color: theme.textPrimary, fontFamily: fonts.arabicBody }}>{w.arabic}</Text>
                <Text style={{ color: theme.textSecondary }}>{w.english}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ marginTop: 32 }}>
          <Button label="Done" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
        <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 12, marginBottom: 8 }}>{node.speaker.toUpperCase()}</Text>
        <Text style={{ fontFamily: fonts.arabicDisplay, fontSize: 28, color: theme.textPrimary }}>{node.textArabic}</Text>
        <Text style={{ fontSize: 15, color: theme.textSecondary, marginTop: 6 }}>{node.textTransliteration}</Text>
        <Text style={{ fontSize: 16, color: theme.textPrimary, marginTop: 10 }}>{node.textEnglish}</Text>

        {node.choices && (
          <View style={{ gap: 10, marginTop: 32 }}>
            {node.choices.map((choice) => (
              <AnimatedPressable
                key={choice.id}
                onPress={() => choose(choice.nextNodeId, node.vocabHighlights)}
                style={{ padding: 16, borderRadius: 16, backgroundColor: theme.surfaceElevated, borderWidth: 2, borderColor: theme.border }}
              >
                <Text style={{ color: theme.textPrimary, fontFamily: fonts.arabicBody }}>{choice.textArabic}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{choice.textEnglish}</Text>
              </AnimatedPressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
