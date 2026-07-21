import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { LESSONS_BY_ID } from '@/content/lessonPaths';
import { LessonRunner } from '@/features/lessons/LessonRunner';
import { useTheme } from '@/lib/ThemeProvider';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const lesson = LESSONS_BY_ID[id];

  if (!lesson) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.textPrimary }}>Lesson not found.</Text>
      </View>
    );
  }

  return <LessonRunner lesson={lesson} />;
}
