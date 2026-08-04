import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Icon } from '@/components/ui/Icon';
import { getConversationsForDialect } from '@/content/conversations';
import { DIALECTS } from '@/content/dialectMeta';
import { SpeakingExercise } from '@/features/lessons/exercises/SpeakingExercise';
import { useTheme } from '@/lib/ThemeProvider';
import { fonts } from '@/lib/fonts';
import { useT } from '@/lib/i18n';
import { speakArabic } from '@/lib/speech';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { Exercise } from '@/types';

// Real filmed clips for hand-authored scenes. Anything not listed falls back to the
// audio-only (text-to-speech) player below. `require` returns an asset module id.
const SCENE_VIDEOS: Record<string, number> = {
  eloued_conv_market: require('../assets/videos/algeria-date-market.mp4'),
};

export default function Drill() {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const addXp = useGamificationStore((s) => s.addXp);
  const recordActivity = useGamificationStore((s) => s.recordActivity);
  // Scenes come from the ACTIVE dialect (authored for El Oued, generated from that dialect's own
  // vocab otherwise), so the drill is never the same Algerian clip for everyone.
  const meta = DIALECTS[activeDialect] ?? DIALECTS.msa;
  const conversations = useMemo(() => getConversationsForDialect(activeDialect), [activeDialect]);
  // Start on a random scene, and let the learner shuffle to another.
  const [convIndex, setConvIndex] = useState(() =>
    conversations.length ? Math.floor(Math.random() * conversations.length) : 0,
  );
  const [activeLine, setActiveLine] = useState(0);
  const [done, setDone] = useState(false);
  const videoRef = useRef<Video>(null);

  const CONV = conversations[Math.min(convIndex, Math.max(0, conversations.length - 1))];
  const sceneVideo = CONV ? SCENE_VIDEOS[CONV.id] : undefined;
  const nextScene = () => {
    setConvIndex((i) => (conversations.length > 1 ? (i + 1) % conversations.length : i));
    setActiveLine(0);
    setDone(false);
  };

  if (!CONV) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Icon name="freetalk" size={40} color={theme.textSecondary} />
        <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16, marginTop: 12, textAlign: 'center' }}>{t('drill.noScenes')}</Text>
        <AnimatedPressable onPress={() => router.back()} style={{ marginTop: 20, backgroundColor: theme.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 }}>
          <Text style={{ color: theme.primaryText, fontWeight: '800' }}>{t('common.back')}</Text>
        </AnimatedPressable>
      </View>
    );
  }

  const target = CONV.lines[activeLine] ?? CONV.lines[0];
  const drillExercise: Exercise = {
    id: `drill_${convIndex}_${activeLine}`,
    type: 'speaking',
    dialectId: activeDialect,
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
        {/* Video header — a real filmed clip when the scene has one, otherwise an audio player. */}
        <View style={{ height: 230 + insets.top, backgroundColor: '#0a0c11', paddingTop: insets.top }}>
          {sceneVideo ? (
            <>
              <Video
                ref={videoRef}
                source={sceneVideo}
                style={StyleSheet.absoluteFill}
                resizeMode={ResizeMode.COVER}
                useNativeControls
                isLooping={false}
              />
              {/* Back button floats over the video. */}
              <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8 }}>
                <AnimatedPressable onPress={() => router.back()} withHaptic={false} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="chevronLeft" size={22} color="#fff" />
                </AnimatedPressable>
              </View>
            </>
          ) : (
            <>
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
            </>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '900' }}>{CONV.title}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>{t('drill.withNative', { dialect: meta.name })}</Text>
            </View>
            {conversations.length > 1 && (
              <AnimatedPressable
                onPress={nextScene}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}
              >
                <Icon name="review" size={16} color={theme.primary} />
                <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12 }}>{t('drill.newScene')}</Text>
              </AnimatedPressable>
            )}
          </View>

          {/* Transcript */}
          <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 22 }}>{t('drill.transcript')}</Text>
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
          <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 24 }}>{t('drill.yourTurn')}</Text>
          <View style={{ marginTop: 12, backgroundColor: theme.surfaceElevated, borderRadius: 20, borderWidth: 1, borderColor: theme.border, padding: 20 }}>
            {done ? (
              <View style={{ alignItems: 'center' }}>
                <Icon name="check" size={40} color={theme.primary} />
                <Text style={{ color: theme.textPrimary, fontWeight: '800', marginTop: 10 }}>{t('drill.niceWork')}</Text>
                <View style={{ marginTop: 16, flexDirection: 'row', gap: 10 }}>
                  {activeLine + 1 < CONV.lines.length && (
                    <AnimatedPressable onPress={() => { setActiveLine((i) => i + 1); setDone(false); }} style={{ backgroundColor: theme.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 }}>
                      <Text style={{ color: theme.primaryText, fontWeight: '800' }}>{t('drill.nextLine')}</Text>
                    </AnimatedPressable>
                  )}
                  <AnimatedPressable onPress={() => router.back()} style={{ borderRadius: 14, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 20, paddingVertical: 12 }}>
                    <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{t('drill.finish')}</Text>
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
