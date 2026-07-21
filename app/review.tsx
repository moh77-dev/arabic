import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { VOCAB_BY_ID } from '@/content/dialects';
import { generateFlashcards } from '@/content/lessonGenerator';
import { LessonRunner } from '@/features/lessons/LessonRunner';
import { useTheme } from '@/lib/ThemeProvider';
import type { Lesson } from '@/types';

export default function ReviewScreen() {
  const { wordIds } = useLocalSearchParams<{ wordIds: string }>();
  const theme = useTheme();

  const lesson: Lesson | null = useMemo(() => {
    const ids = (wordIds ?? '').split(',').filter(Boolean);
    const words = ids.map((id) => VOCAB_BY_ID[id]).filter(Boolean);
    if (words.length === 0) return null;
    return {
      id: `review_${Date.now()}`,
      unitId: 'review',
      dialectId: words[0].dialectId,
      title: 'Review Session',
      titleArabic: 'مراجعة',
      description: 'Spaced-repetition review',
      category: words[0].category,
      exercises: generateFlashcards(words),
      xpReward: words.length * 5,
      estimatedMinutes: Math.max(2, Math.round(words.length * 0.5)),
      difficulty: 2,
    };
  }, [wordIds]);

  if (!lesson) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.textPrimary }}>Nothing to review.</Text>
      </View>
    );
  }

  return <LessonRunner lesson={lesson} />;
}
