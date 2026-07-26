import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useTheme } from '@/lib/ThemeProvider';
import { acceptedAnswersFor, isAnswerCorrect } from '@/lib/answerCheck';
import { haptic } from '@/lib/haptics';
import { playSound } from '@/lib/sound';
import type { Exercise } from '@/types';

interface Props {
  exercise: Exercise;
  onAnswered: (correct: boolean) => void;
}

export function TypedAnswerExercise({ exercise, onAnswered }: Props) {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);

  const submit = () => {
    if (revealed || !value.trim()) return;
    // Lenient: accepts spelling variants, synonyms and near-misses — not just the exact string.
    const isCorrect = isAnswerCorrect(value, acceptedAnswersFor(exercise));
    setCorrect(isCorrect);
    setRevealed(true);
    if (isCorrect) haptic.success();
    else haptic.error();
    playSound(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => onAnswered(isCorrect), 900);
  };

  const correctAnswerText = Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer.join(' ') : exercise.correctAnswer;

  return (
    <View>
      {exercise.promptArabic && (
        <Text style={{ fontSize: 34, textAlign: 'center', color: theme.textPrimary, marginBottom: 8, fontWeight: '700' }}>
          {exercise.promptArabic}
        </Text>
      )}
      <Text style={{ fontSize: 18, color: theme.textPrimary, marginBottom: 20, textAlign: 'center' }}>{exercise.prompt}</Text>
      <TextField
        placeholder="Type your answer..."
        value={value}
        onChangeText={setValue}
        editable={!revealed}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {revealed && (
        <Text style={{ marginTop: 12, color: correct ? theme.primary : theme.danger, fontWeight: '700' }}>
          {correct ? 'Correct!' : `Correct answer: ${correctAnswerText}`}
        </Text>
      )}
      {!revealed && (
        <View style={{ marginTop: 16 }}>
          <Button label="Check" onPress={submit} disabled={!value.trim()} />
        </View>
      )}
    </View>
  );
}
