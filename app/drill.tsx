import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Icon } from '@/components/ui/Icon';
import { ELOUED_CONVERSATIONS } from '@/content/dialects';
import { SpeakingExercise } from '@/features/lessons/exercises/SpeakingExercise';
import { fonts } from '@/lib/fonts';
import { useTheme } from '@/lib/ThemeProvider';
import { speakArabic } from '@/lib/speech';
import { useGamificationStore } from '@/stores/useGamificationStore';
import type { Exercise } from '@/types';

// Uses the market conversation as the "video" transcript; the last user-facing line is the drill.
const CONV = ELOUED_CONVERSATIONS[0];

export default function Drill() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const addXp = useGamificationStore((s) => s.addXp);
  const recordActivity = useGamificationStore((s) => s.recordActivity);
  const [activeLine, setActiveLine] = useState(0);
  const [done, setDone] = useState(false);

  const target = CONV.lines[activeLine] ?? CONV.lines[0];
  const drillExercise: Exercise = {
    id: `drill_${activeLine}`,
    type: 'speaking',
    dialectId: 'algerian_eloued',
    prompt: `Say: "${target.transliteration}"`,
    promptArabic: target.arabic,
    correctAnswer: target.transliteration,
    xpReward: 20,
  };

  const onAnswered = (correct: boolean) => {
    addXp(correct ? 20 : 8);
    recordActivity({ speakingDone: 1 });
    setDone(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={theme.backdropGradient} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Video placeholder */}
        <View style={{ height: 230 + insets.top, backgroundColor: '#0a0c11', paddingTop: insets.top }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8 }}>
            <AnimatedPressable onPress={() => router.back()} withHaptic={false} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chevronLeft" size={22} color="#fff" />
            </AnimatedPressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <AnimatedPressable
              onPress={() => speakArabic(CONV.lines.map((l) => l.arabic).join('، '))}
              style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="play" size={30} color="#0a0c11" />
            </AnimatedPressable>
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <View style={{ height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
              <View style={{ height: '100%', width: '32%', backgroundColor: theme.primary }} />
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '900' }}>{CONV.title}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>With a native Souf speaker</Text>

          {/* Transcript */}
          <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 22 }}>TRANSCRIPT</Text>
          <View style={{ gap: 8, marginTop: 12 }}>
            {CONV.lines.map((line, i) => {
              const active = i === activeLine;
              return (
                <AnimatedPressable
                  key={i}
                  onPress={() => {
                    setActiveLine(i);
                    setDone(false);
                    speakArabic(line.arabic);
                  }}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: active ? `${theme.primary}14` : theme.surfaceElevated,
                    borderWidth: 1,
                    borderColor: active ? theme.primary : theme.border,
                  }}
                >
                  <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '700' }}>{line.speaker}</Text>
                  <Text style={{ color: theme.textPrimary, fontFamily: fonts.arabicBody, fontSize: 19, marginTop: 4, textAlign: 'right' }}>{line.arabic}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{line.english}</Text>
                </AnimatedPressable>
              );
            })}
          </View>

          {/* Say it back */}
          <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 24 }}>YOUR TURN — SAY IT BACK</Text>
          <View style={{ marginTop: 12, backgroundColor: theme.surfaceElevated, borderRadius: 20, borderWidth: 1, borderColor: theme.border, padding: 20 }}>
            {done ? (
              <View style={{ alignItems: 'center' }}>
                <Icon name="check" size={40} color={theme.primary} />
                <Text style={{ color: theme.textPrimary, fontWeight: '800', marginTop: 10 }}>Nice work!</Text>
                <View style={{ marginTop: 16, flexDirection: 'row', gap: 10 }}>
                  {activeLine + 1 < CONV.lines.length && (
                    <AnimatedPressable onPress={() => { setActiveLine((i) => i + 1); setDone(false); }} style={{ backgroundColor: theme.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 }}>
                      <Text style={{ color: theme.primaryText, fontWeight: '800' }}>Next line</Text>
                    </AnimatedPressable>
                  )}
                  <AnimatedPressable onPress={() => router.back()} style={{ borderRadius: 14, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 20, paddingVertical: 12 }}>
                    <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>Finish</Text>
                  </AnimatedPressable>
                </View>
              </View>
            ) : (
              <SpeakingExercise key={drillExercise.id} exercise={drillExercise} onAnswered={onAnswered} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
