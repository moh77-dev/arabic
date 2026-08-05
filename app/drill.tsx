import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AnimatedScenePlayer } from '@/components/ui/AnimatedScenePlayer';
import { Icon } from '@/components/ui/Icon';
import { SceneVideoPlayer } from '@/components/ui/SceneVideoPlayer';
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

// Real filmed clips for hand-authored scenes. Anything not listed falls back to the audio-only
// (text-to-speech) player below. `aspect` = width / height, so the player frame matches the clip
// (this one is a 1080×1920 vertical video) instead of cropping it. Drop new scenes in here.
interface SceneVideo {
  source: number;
  aspect: number;
}
const SCENE_VIDEOS: Record<string, SceneVideo> = {
  eloued_conv_market: { source: require('../assets/videos/algeria-date-market.mp4'), aspect: 1080 / 1920 },
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
  const { width: winW, height: winH } = useWindowDimensions();

  const CONV = conversations[Math.min(convIndex, Math.max(0, conversations.length - 1))];
  const sceneVideo = CONV ? SCENE_VIDEOS[CONV.id] : undefined;
  // Fit the WHOLE clip on screen (no cropping): size the frame to the video's own aspect ratio,
  // capped so a tall vertical clip doesn't eat the entire screen. Works on phone and wide desktop.
  const frameH = sceneVideo ? Math.min(winH * 0.56, (winW - 32) / sceneVideo.aspect, 520) : 0;
  const frameW = sceneVideo ? frameH * sceneVideo.aspect : 0;
  // Height for the in-app animated scene (used when there's no filmed clip): a comfortable stage
  // that includes the safe-area top so the back button and first line clear the status bar.
  const sceneH = Math.min(winH * 0.5, 420) + insets.top;
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
        {sceneVideo ? (
          <View style={{ backgroundColor: '#05070c', paddingTop: insets.top + 8, paddingBottom: 16, alignItems: 'center' }}>
            {/* Back button floats over the video area. */}
            <View style={{ position: 'absolute', top: insets.top + 8, left: 16, zIndex: 3 }}>
              <AnimatedPressable onPress={() => router.back()} withHaptic={false} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="chevronLeft" size={22} color="#fff" />
              </AnimatedPressable>
            </View>
            {/* Frame matches the clip's aspect ratio so the whole video is visible — never cropped. */}
            <View style={{ width: frameW, height: frameH, borderRadius: 18, overflow: 'hidden', backgroundColor: '#000' }}>
              <SceneVideoPlayer
                key={CONV.id}
                source={sceneVideo.source}
                width={frameW}
                height={frameH}
                label={t('drill.tapToPlay')}
              />
            </View>
          </View>
        ) : (
          // No filmed clip for this scene — play it as an in-app animated "video" instead: each line
          // animates in over the dialect's backdrop and is spoken aloud. Works for any scene/dialect.
          <View style={{ height: sceneH, backgroundColor: '#05070c' }}>
            <AnimatedScenePlayer
              key={CONV.id}
              sceneId={CONV.id}
              lines={CONV.lines}
              dialectId={activeDialect}
              width={winW}
              height={sceneH}
              insetTop={insets.top}
            />
            <View style={{ position: 'absolute', top: insets.top + 8, left: 16, zIndex: 3 }}>
              <AnimatedPressable onPress={() => router.back()} withHaptic={false} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="chevronLeft" size={22} color="#fff" />
              </AnimatedPressable>
            </View>
          </View>
        )}

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
