import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { DIALECTS } from '@/content/dialectMeta';
import { GUIDE_NAME } from '@/content/guide';
import { LessonRunner } from '@/features/lessons/LessonRunner';
import { useTheme } from '@/lib/ThemeProvider';
import { ai } from '@/lib/ai/client';
import { haptic } from '@/lib/haptics';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores/useUserStore';
import type { DifficultyLevel, Lesson } from '@/types';

// Quick-pick focus areas; the learner can also type their own topic.
const FOCUS_AREAS = ['Everyday vocabulary', 'Grammar basics', 'Greetings & small talk', 'Travel & directions', 'Food & ordering', 'Family & home', 'Shopping & haggling', 'Numbers & money'];

// Onboarding difficulty → the 1–5 scale the lesson generator expects.
const DIFFICULTY_LEVEL: Record<DifficultyLevel, 1 | 2 | 3 | 4 | 5> = { easy: 2, moderate: 3, challenging: 4, intense: 5 };

type Phase = 'pick' | 'generating' | 'run' | 'error';

export default function CustomLesson() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dialectId = useSettingsStore((s) => s.activeDialect);
  const profile = useUserStore((s) => s.onboardingProfile);
  const getWeakWordIds = useLessonStore((s) => s.getWeakWordIds);
  const meta = DIALECTS[dialectId] ?? DIALECTS.msa;

  const [phase, setPhase] = useState<Phase>('pick');
  const [topic, setTopic] = useState('');
  const [custom, setCustom] = useState('');
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const chosenTopic = (custom.trim() || topic).trim();

  const generate = async () => {
    if (!chosenTopic) return;
    haptic.tap();
    setPhase('generating');
    setErrorMessage(null);
    try {
      const difficulty = profile.difficulty ? DIFFICULTY_LEVEL[profile.difficulty] : 2;
      const userGoal = profile.goals?.[0] ?? 'speak like a local';
      const result = await ai.generateLesson({
        dialectId,
        topic: chosenTopic,
        difficulty,
        weakWordIds: getWeakWordIds(),
        userGoal,
      });
      if (!result.exercises?.length) throw new Error('No exercises came back');
      setLesson({
        id: `custom_${Date.now()}`,
        unitId: 'custom',
        dialectId,
        title: result.title,
        titleArabic: result.titleArabic,
        description: `Custom lesson: ${chosenTopic}`,
        category: 'phrases' as Lesson['category'],
        exercises: result.exercises,
        xpReward: 30,
        estimatedMinutes: 6,
        difficulty,
      });
      setPhase('run');
      haptic.success();
    } catch (error) {
      setErrorMessage((error as Error).message);
      setPhase('error');
    }
  };

  if (phase === 'run' && lesson) {
    return <LessonRunner lesson={lesson} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={theme.backdropGradient} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AnimatedPressable onPress={() => router.back()} withHaptic={false}>
            <Icon name="chevronLeft" size={24} color={theme.textPrimary} />
          </AnimatedPressable>
          <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '900' }}>Custom lesson</Text>
        </View>

        {phase === 'generating' ? (
          <View style={{ alignItems: 'center', paddingTop: 80, gap: 16 }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16 }}>{GUIDE_NAME} is building your lesson…</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>
              Tailoring “{chosenTopic}” for {meta.name}.
            </Text>
          </View>
        ) : phase === 'error' ? (
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 14 }}>
            <Text style={{ fontSize: 44 }}>😕</Text>
            <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16, textAlign: 'center' }}>Anis couldn’t build that one</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>{errorMessage}</Text>
            <View style={{ marginTop: 8, width: '100%' }}>
              <Button label="Try again" onPress={() => setPhase('pick')} />
            </View>
          </View>
        ) : (
          <>
            <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 16 }}>
              What do you want to improve in {meta.name}? {GUIDE_NAME} will build a short lesson around it.
            </Text>

            <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 24 }}>PICK A FOCUS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {FOCUS_AREAS.map((area) => {
                const selected = topic === area && !custom.trim();
                return (
                  <AnimatedPressable
                    key={area}
                    onPress={() => {
                      setTopic(area);
                      setCustom('');
                    }}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1.5,
                      borderColor: selected ? theme.primary : theme.border,
                      backgroundColor: selected ? `${theme.primary}14` : theme.surfaceElevated,
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                    }}
                  >
                    <Text style={{ color: selected ? theme.primary : theme.textPrimary, fontWeight: '700', fontSize: 13 }}>{area}</Text>
                  </AnimatedPressable>
                );
              })}
            </View>

            <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 24 }}>OR DESCRIBE IT</Text>
            <View style={{ marginTop: 12, backgroundColor: theme.surfaceElevated, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 14 }}>
              <TextInput
                value={custom}
                onChangeText={setCustom}
                placeholder="e.g. talking to my grandparents, ordering coffee…"
                placeholderTextColor={theme.textSecondary}
                style={{ color: theme.textPrimary, fontSize: 15, minHeight: 24 }}
                multiline
              />
            </View>

            <View style={{ marginTop: 28 }}>
              <Button label="Build my lesson" onPress={generate} disabled={!chosenTopic} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
