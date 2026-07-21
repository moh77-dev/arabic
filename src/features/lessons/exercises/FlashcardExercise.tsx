import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/ThemeProvider';
import { speakArabic } from '@/lib/speech';
import type { Exercise, SRSGrade } from '@/types';

interface Props {
  exercise: Exercise;
  onGraded: (grade: SRSGrade) => void;
}

/** Flashcard with a flip animation; the learner self-reports recall quality for the SRS scheduler. */
export function FlashcardExercise({ exercise, onGraded }: Props) {
  const theme = useTheme();
  const [flipped, setFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${rotation.value}deg` }],
    opacity: rotation.value > 90 ? 0 : 1,
    backfaceVisibility: 'hidden',
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${rotation.value + 180}deg` }],
    opacity: rotation.value > 90 ? 1 : 0,
    backfaceVisibility: 'hidden',
    position: 'absolute',
  }));

  const flip = () => {
    rotation.value = withTiming(flipped ? 0 : 180, { duration: 400 });
    setFlipped((f) => !f);
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <AnimatedPressable onPress={flip} withHaptic={false} style={{ width: '100%' }}>
        <View style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={[{ position: 'absolute', width: '100%', height: 220, borderRadius: 24, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', padding: 20 }, frontStyle]}>
            <Text style={{ fontSize: 40, color: '#fff', fontWeight: '900', textAlign: 'center' }}>{exercise.promptArabic}</Text>
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>{exercise.prompt}</Text>
          </Animated.View>
          <Animated.View style={[{ width: '100%', height: 220, borderRadius: 24, backgroundColor: theme.surfaceElevated, borderWidth: 2, borderColor: theme.primary, alignItems: 'center', justifyContent: 'center', padding: 20 }, backStyle]}>
            <Text style={{ fontSize: 24, color: theme.textPrimary, fontWeight: '800', textAlign: 'center' }}>{exercise.correctAnswer as string}</Text>
          </Animated.View>
        </View>
      </AnimatedPressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Tap card to flip</Text>
        <AnimatedPressable onPress={() => speakArabic(exercise.promptArabic)} withHaptic={false}>
          <Text style={{ fontSize: 18 }}>🔊</Text>
        </AnimatedPressable>
      </View>

      {flipped && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 20, width: '100%' }}>
          <View style={{ flex: 1 }}>
            <Button label="Again" variant="danger" size="md" onPress={() => onGraded('again')} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Hard" variant="secondary" size="md" onPress={() => onGraded('hard')} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Good" variant="primary" size="md" onPress={() => onGraded('good')} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Easy" variant="gold" size="md" onPress={() => onGraded('easy')} />
          </View>
        </View>
      )}
    </View>
  );
}
