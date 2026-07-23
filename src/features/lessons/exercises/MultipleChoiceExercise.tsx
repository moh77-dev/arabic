import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useTheme } from '@/lib/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { speakArabic, stopSpeaking } from '@/lib/speech';
import type { Exercise } from '@/types';

interface Props {
  exercise: Exercise;
  onAnswered: (correct: boolean) => void;
}

export function MultipleChoiceExercise({ exercise, onAnswered }: Props) {
  const theme = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const shake = useSharedValue(0);
  const isListening = exercise.type === 'listening';

  useEffect(() => {
    if (isListening) speakArabic(exercise.promptArabic);
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const handleSelect = (option: string) => {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    const isCorrect = option === exercise.correctAnswer;
    if (isCorrect) {
      haptic.success();
    } else {
      haptic.error();
      shake.value = withSequence(withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(0, { duration: 50 }));
    }
    setTimeout(() => onAnswered(isCorrect), 700);
  };

  return (
    <View>
      {isListening ? (
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <AnimatedPressable
            onPress={() => speakArabic(exercise.promptArabic)}
            style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 34 }}>🔊</Text>
          </AnimatedPressable>
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 8 }}>Tap to listen again</Text>
        </View>
      ) : (
        exercise.promptArabic && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 34, textAlign: 'center', color: theme.textPrimary, fontWeight: '700' }}>
              {exercise.promptArabic}
            </Text>
            <AnimatedPressable onPress={() => speakArabic(exercise.promptArabic)} withHaptic={false}>
              <Text style={{ fontSize: 22 }}>🔊</Text>
            </AnimatedPressable>
          </View>
        )
      )}
      <Text style={{ fontSize: 18, color: theme.textPrimary, marginBottom: 20, textAlign: 'center' }}>{exercise.prompt}</Text>
      <View style={{ gap: 10 }}>
        {exercise.options?.map((option) => {
          const isSelected = selected === option;
          const isCorrectOption = option === exercise.correctAnswer;
          let bg = theme.surfaceElevated;
          let border = theme.border;
          if (revealed && isCorrectOption) {
            bg = `${theme.primary}22`;
            border = theme.primary;
          } else if (revealed && isSelected && !isCorrectOption) {
            bg = `${theme.danger}22`;
            border = theme.danger;
          }
          return (
            <Animated.View key={option} style={isSelected ? shakeStyle : undefined}>
              <AnimatedPressable
                onPress={() => handleSelect(option)}
                disabled={revealed}
                style={{ padding: 16, borderRadius: 14, borderWidth: 2, borderColor: border, backgroundColor: bg }}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 16 }}>{option}</Text>
              </AnimatedPressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Safety net: if an exercise somehow has no options, don't trap the learner. */}
      {!exercise.options?.length && (
        <AnimatedPressable
          onPress={() => onAnswered(true)}
          style={{ marginTop: 20, padding: 16, borderRadius: 14, backgroundColor: theme.primary, alignItems: 'center' }}
        >
          <Text style={{ color: theme.primaryText, fontWeight: '800', fontSize: 16 }}>Continue</Text>
        </AnimatedPressable>
      )}
    </View>
  );
}
