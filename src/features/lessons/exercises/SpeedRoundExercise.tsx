import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';
import { useTheme } from '@/lib/ThemeProvider';
import type { Exercise } from '@/types';

interface Props {
  exercise: Exercise;
  onAnswered: (correct: boolean) => void;
  seconds?: number;
}

export function SpeedRoundExercise({ exercise, onAnswered, seconds = 8 }: Props) {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [expired, setExpired] = useState(false);

  // The parent re-creates onAnswered on every render, so it's read via a ref
  // rather than a hook dependency — otherwise the countdown would reset each render.
  const onAnsweredRef = useRef(onAnswered);
  onAnsweredRef.current = onAnswered;

  useEffect(() => {
    if (expired) return;
    if (timeLeft <= 0) {
      setExpired(true);
      onAnsweredRef.current(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, expired]);

  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 3,
            borderColor: timeLeft <= 3 ? theme.danger : theme.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontWeight: '900', color: timeLeft <= 3 ? theme.danger : theme.primary }}>{timeLeft}</Text>
        </View>
      </View>
      <MultipleChoiceExercise exercise={exercise} onAnswered={onAnswered} />
    </View>
  );
}
