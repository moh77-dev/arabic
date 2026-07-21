import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/ThemeProvider';
import { haptic } from '@/lib/haptics';
import type { Exercise } from '@/types';

interface Props {
  exercise: Exercise;
  onAnswered: (correct: boolean) => void;
}

export function WordOrderExercise({ exercise, onAnswered }: Props) {
  const theme = useTheme();
  const [bank, setBank] = useState(exercise.wordBank ?? []);
  const [chosen, setChosen] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);

  const target = Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer : [exercise.correctAnswer];

  const pick = (word: string, index: number) => {
    if (revealed) return;
    setBank((b) => b.filter((_, i) => i !== index));
    setChosen((c) => [...c, word]);
  };

  const unpick = (index: number) => {
    if (revealed) return;
    const word = chosen[index];
    setChosen((c) => c.filter((_, i) => i !== index));
    setBank((b) => [...b, word]);
  };

  const submit = () => {
    const isCorrect = chosen.join(' ').toLowerCase() === target.join(' ').toLowerCase();
    setCorrect(isCorrect);
    setRevealed(true);
    if (isCorrect) haptic.success();
    else haptic.error();
    setTimeout(() => onAnswered(isCorrect), 900);
  };

  return (
    <View>
      <Text style={{ fontSize: 18, color: theme.textPrimary, marginBottom: 20, textAlign: 'center' }}>{exercise.prompt}</Text>

      <View
        style={{
          minHeight: 60,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          borderWidth: 2,
          borderColor: theme.border,
          borderRadius: 14,
          padding: 12,
          marginBottom: 20,
        }}
      >
        {chosen.map((word, i) => (
          <AnimatedPressable
            key={`${word}-${i}`}
            onPress={() => unpick(i)}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: `${theme.primary}22` }}
          >
            <Text style={{ color: theme.primary, fontWeight: '700' }}>{word}</Text>
          </AnimatedPressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {bank.map((word, i) => (
          <AnimatedPressable
            key={`${word}-${i}`}
            onPress={() => pick(word, i)}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border }}
          >
            <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{word}</Text>
          </AnimatedPressable>
        ))}
      </View>

      {revealed && (
        <Text style={{ marginTop: 16, color: correct ? theme.primary : theme.danger, fontWeight: '700' }}>
          {correct ? 'Correct!' : `Correct order: ${target.join(' ')}`}
        </Text>
      )}
      {!revealed && (
        <View style={{ marginTop: 20 }}>
          <Button label="Check" onPress={submit} disabled={chosen.length === 0} />
        </View>
      )}
    </View>
  );
}
