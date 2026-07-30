import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { fonts } from '@/lib/fonts';
import { useTheme } from '@/lib/ThemeProvider';
import { ai } from '@/lib/ai/client';
import { haptic } from '@/lib/haptics';
import { speakArabic } from '@/lib/speech';
import type { Exercise, PronunciationResult } from '@/types';

interface Props {
  exercise: Exercise;
  onAnswered: (correct: boolean) => void;
}

type RecState = 'idle' | 'recording' | 'analyzing' | 'result' | 'error';

export function SpeakingExercise({ exercise, onAnswered }: Props) {
  const theme = useTheme();
  const [state, setState] = useState<RecState>('idle');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setErrorMessage('Microphone permission is required to practice speaking.');
        setState('error');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
      setState('recording');
      haptic.tap();
    } catch {
      setErrorMessage('Could not start the microphone.');
      setState('error');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setState('analyzing');
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('No recording URI');
      const audioBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

      const analysis = await ai.analyzePronunciation({
        audioBase64,
        targetText: exercise.promptArabic ?? exercise.prompt,
        targetTransliteration: exercise.correctAnswer as string,
        dialectId: exercise.dialectId,
      });
      setResult(analysis);
      setState('result');
      if (analysis.overallScore >= 60) haptic.success();
      else haptic.warning();
    } catch {
      // Edge function may not be deployed yet in this environment (no OPENAI_API_KEY configured) —
      // let the learner continue instead of getting stuck.
      setErrorMessage('Pronunciation analysis is unavailable right now. Marking as practiced.');
      setState('error');
    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
      {exercise.promptArabic && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
          <Text style={{ fontFamily: fonts.arabicBody, fontSize: 34, textAlign: 'center', color: theme.textPrimary }}>
            {exercise.promptArabic}
          </Text>
          <AnimatedPressable onPress={() => speakArabic(exercise.promptArabic)} withHaptic={false}>
            <Text style={{ fontSize: 22 }}>🔊</Text>
          </AnimatedPressable>
        </View>
      )}
      <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 8, textAlign: 'center' }}>
        Tap 🔊 to hear it, then record yourself saying it.
      </Text>
      <Text style={{ fontSize: 18, color: theme.textPrimary, marginBottom: 24, textAlign: 'center' }}>{exercise.prompt}</Text>

      {(state === 'idle' || state === 'recording') && (
        <AnimatedPressable
          onPress={state === 'idle' ? startRecording : stopRecording}
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: state === 'recording' ? theme.danger : theme.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 36 }}>{state === 'recording' ? '⏹️' : '🎙️'}</Text>
        </AnimatedPressable>
      )}
      {state === 'recording' && <Text style={{ marginTop: 12, color: theme.textSecondary }}>Recording... tap to stop</Text>}
      {state === 'analyzing' && <Text style={{ marginTop: 12, color: theme.textSecondary }}>Analyzing your pronunciation...</Text>}

      {state === 'result' && result && (
        <View style={{ width: '100%', marginTop: 8 }}>
          <Text style={{ fontSize: 40, fontWeight: '900', textAlign: 'center', color: result.overallScore >= 60 ? theme.primary : theme.accentGold }}>
            {result.overallScore}%
          </Text>
          {result.suggestions.map((s, i) => (
            <Text key={i} style={{ color: theme.textSecondary, marginTop: 6, textAlign: 'center' }}>
              • {s}
            </Text>
          ))}
          <View style={{ marginTop: 20 }}>
            <Button label="Continue" onPress={() => onAnswered(result.overallScore >= 60)} />
          </View>
        </View>
      )}

      {state === 'error' && (
        <View style={{ width: '100%', marginTop: 12 }}>
          <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>{errorMessage}</Text>
          <View style={{ marginTop: 16 }}>
            <Button label="Continue" onPress={() => onAnswered(true)} />
          </View>
        </View>
      )}
    </View>
  );
}
