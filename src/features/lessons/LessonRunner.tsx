import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseRenderer } from './ExerciseRenderer';
import { LessonResults } from './LessonResults';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useTheme } from '@/lib/ThemeProvider';
import { playSound } from '@/lib/sound';
import { lessonXpReward, coinsForLesson } from '@/lib/gamificationMath';
import { confirmAsync } from '@/lib/platformAlert';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useLessonStore } from '@/stores/useLessonStore';
import { TEACHING_EXERCISE_TYPES, type Lesson, type SRSGrade } from '@/types';

const START_LIVES = 5;

/** Teaching cards (new word / grammar) are read, not answered — they never cost hearts or count toward accuracy. */
const isTeaching = (type: Lesson['exercises'][number]['type']) => TEACHING_EXERCISE_TYPES.includes(type);

export function LessonRunner({ lesson }: { lesson: Lesson }) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [failedOut, setFailedOut] = useState(false);

  const markLessonComplete = useLessonStore((s) => s.markLessonComplete);
  const reviewWord = useLessonStore((s) => s.reviewWord);
  const ensureSRSCard = useLessonStore((s) => s.ensureSRSCard);
  const addXp = useGamificationStore((s) => s.addXp);
  const addCoins = useGamificationStore((s) => s.addCoins);
  const recordActivity = useGamificationStore((s) => s.recordActivity);

  const exercise = lesson.exercises[index];
  const total = lesson.exercises.length;
  // Accuracy is measured only over graded exercises, so teaching cards don't dilute the score.
  const gradedTotal = lesson.exercises.filter((e) => !isTeaching(e.type)).length || 1;
  const progress = index / total;

  const handleExit = async () => {
    const shouldLeave = await confirmAsync({
      title: 'Leave lesson?',
      message: "Your progress in this lesson won't be saved.",
      confirmLabel: 'Leave',
      cancelLabel: 'Keep learning',
      destructive: true,
    });
    if (shouldLeave) router.back();
  };

  const goNext = (newCorrect: number) => {
    if (index + 1 >= total) {
      completeLesson(newCorrect / gradedTotal);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const advance = (wasCorrect: boolean) => {
    // Teaching cards are informational: just move on, no scoring, no hearts.
    if (isTeaching(exercise.type)) {
      goNext(correctCount);
      return;
    }

    const newCorrect = wasCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (exercise.relatedWordId) {
      ensureSRSCard(exercise.relatedWordId);
      reviewWord(exercise.relatedWordId, wasCorrect ? 'good' : 'again');
    }
    if (exercise.type === 'speaking' || exercise.type === 'shadowing' || exercise.type === 'pronunciation') {
      recordActivity({ speakingDone: 1 });
    }

    if (!wasCorrect) {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      if (remainingLives <= 0) {
        setFailedOut(true);
        setFinished(true);
        return;
      }
    }

    goNext(newCorrect);
  };

  const handleFlashcardGraded = (grade: SRSGrade) => {
    if (exercise.relatedWordId) {
      ensureSRSCard(exercise.relatedWordId);
      reviewWord(exercise.relatedWordId, grade);
    }
    advance(grade !== 'again');
  };

  const completeLesson = (accuracy: number) => {
    const isPerfect = accuracy >= 0.99;
    const xpEarned = lessonXpReward({ baseXp: lesson.xpReward, accuracy, perfectBonus: isPerfect });
    const coinsEarned = coinsForLesson(accuracy);
    markLessonComplete(lesson.id, accuracy);
    addXp(xpEarned, { minutesStudied: lesson.estimatedMinutes });
    addCoins(coinsEarned);
    recordActivity({ lessonsCompleted: 1, perfectLessons: isPerfect ? 1 : 0 });
    playSound(isPerfect ? 'levelup' : 'complete');
    setFinished(true);
  };

  if (finished) {
    if (failedOut) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64 }}>💔</Text>
          <Text style={{ fontSize: 24, fontWeight: '900', color: theme.textPrimary, marginTop: 16 }}>Out of hearts</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 8, textAlign: 'center' }}>
            Review the lesson and try again — mistakes are how the brain learns a new dialect.
          </Text>
          <AnimatedPressable onPress={() => router.back()} style={{ marginTop: 32, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, backgroundColor: theme.primary }}>
            <Text style={{ color: theme.primaryText, fontWeight: '800' }}>Back to lessons</Text>
          </AnimatedPressable>
        </SafeAreaView>
      );
    }
    const accuracy = correctCount / gradedTotal;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <LessonResults
          accuracy={accuracy}
          xpEarned={lessonXpReward({ baseXp: lesson.xpReward, accuracy, perfectBonus: accuracy >= 0.99 })}
          coinsEarned={coinsForLesson(accuracy)}
          isPerfect={accuracy >= 0.99}
          onContinue={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8 }}>
        <AnimatedPressable onPress={handleExit} withHaptic={false}>
          <Text style={{ fontSize: 22, color: theme.textSecondary }}>✕</Text>
        </AnimatedPressable>
        <View style={{ flex: 1, height: 10, borderRadius: 999, backgroundColor: theme.border, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: theme.primary, borderRadius: 999 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text>❤️</Text>
          <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{lives}</Text>
        </View>
      </View>

      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
        <ExerciseRenderer key={exercise.id} exercise={exercise} onAnswered={advance} onFlashcardGraded={handleFlashcardGraded} />
      </View>
    </SafeAreaView>
  );
}
