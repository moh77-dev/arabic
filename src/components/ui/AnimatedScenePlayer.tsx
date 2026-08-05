import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { LandmarkSilhouette } from './LandmarkSilhouette';
import { getBackdrop } from '@/content/dialectBackdrops';
import { fonts } from '@/lib/fonts';
import { useT } from '@/lib/i18n';
import { speakArabic, stopSpeaking } from '@/lib/speech';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { DialectId } from '@/types';

export interface SceneLine {
  speaker: string;
  arabic: string;
  transliteration: string;
  english: string;
}

interface Props {
  lines: SceneLine[];
  dialectId: DialectId;
  width: number;
  height: number;
  /** Safe-area top padding so content clears the status bar / back button. */
  insetTop: number;
}

/**
 * An in-app "video": it plays a conversation like a scene — each line animates in over the dialect's
 * own backdrop, is spoken aloud, and advances automatically. No footage needed, so it works for every
 * scene and every dialect. The Arabic is voiced with the free device/browser TTS (silent, but still
 * animated, on devices without an Arabic voice); a timer drives the pacing so it always progresses.
 */
export function AnimatedScenePlayer({ lines, dialectId, width, height, insetTop }: Props) {
  const t = useT();
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const backdrop = getBackdrop(dialectId);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'paused' | 'done'>('idle');
  const [index, setIndex] = useState(0);
  const anim = useRef(new Animated.Value(1)).current;

  // Alternate speakers left/right so it reads like a real dialogue.
  const speakerSide = useMemo(() => {
    const order = Array.from(new Set(lines.map((l) => l.speaker)));
    return (speaker: string): 'left' | 'right' => (order.indexOf(speaker) % 2 === 0 ? 'left' : 'right');
  }, [lines]);

  // Drive playback: speak + animate the active line, then advance on a timer sized to its length.
  useEffect(() => {
    if (phase !== 'playing') return;
    if (index >= lines.length) {
      setPhase('done');
      return;
    }
    const line = lines[index];
    speakArabic(line.arabic);
    if (reduceMotion) {
      anim.setValue(1);
    } else {
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 340, useNativeDriver: true }).start();
    }
    const words = line.arabic.trim().split(/\s+/).filter(Boolean).length;
    const duration = Math.min(7000, Math.max(2800, words * 640));
    const timer = setTimeout(() => setIndex((i) => i + 1), duration);
    return () => clearTimeout(timer);
  }, [phase, index, lines, reduceMotion, anim]);

  // Always stop the voice when this player goes away.
  useEffect(() => () => stopSpeaking(), []);

  const start = () => {
    setIndex(0);
    setPhase('playing');
  };
  const pause = () => {
    stopSpeaking();
    setPhase('paused');
  };
  const resume = () => setPhase('playing');
  const replay = () => {
    setIndex(0);
    setPhase('playing');
  };

  const line = lines[Math.min(index, lines.length - 1)];
  const side = line ? speakerSide(line.speaker) : 'left';
  const shownCount = phase === 'done' ? lines.length : Math.min(index + 1, lines.length);
  const showTranscript = phase === 'playing' || phase === 'paused' || phase === 'done';

  return (
    <View style={{ width, height, overflow: 'hidden', backgroundColor: backdrop.heroGradient[1] }}>
      <LinearGradient colors={backdrop.heroGradient} style={StyleSheet.absoluteFill} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <LandmarkSilhouette kind={backdrop.silhouette} color="#ffffff" opacity={0.12} height={Math.min(150, height * 0.5)} />
      </View>

      <View style={{ flex: 1, paddingTop: insetTop + 8, paddingHorizontal: 20, paddingBottom: 16 }}>
        {/* Progress dots row */}
        <View style={{ flexDirection: 'row', gap: 5, marginTop: 4, marginBottom: 10 }}>
          {lines.map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 999,
                backgroundColor: i < shownCount ? '#ffffff' : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </View>

        {/* Stage */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {showTranscript && line ? (
            <Animated.View
              style={{
                opacity: anim,
                transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
                alignItems: side === 'right' ? 'flex-end' : 'flex-start',
              }}
            >
              <View style={{ flexDirection: side === 'right' ? 'row-reverse' : 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: backdrop.heroGradient[1], fontWeight: '900', fontSize: 13 }}>{line.speaker.charAt(0)}</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 12 }}>{line.speaker}</Text>
              </View>
              <View
                style={{
                  maxWidth: '92%',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: 18,
                  borderTopLeftRadius: side === 'left' ? 4 : 18,
                  borderTopRightRadius: side === 'right' ? 4 : 18,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                }}
              >
                <Text style={{ color: '#ffffff', fontFamily: fonts.arabicDisplay, fontSize: 26, textAlign: 'right', lineHeight: 40 }}>{line.arabic}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>{line.transliteration}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 14, marginTop: 4 }}>{line.english}</Text>
              </View>
            </Animated.View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700', letterSpacing: 1 }}>{t('drill.watchScene')}</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
          {phase === 'idle' && (
            <ControlButton onPress={start} big>
              <Icon name="play" size={30} color={backdrop.heroGradient[1]} />
            </ControlButton>
          )}
          {phase === 'playing' && (
            <ControlButton onPress={pause}>
              {/* Pause glyph (no pause icon in the set) */}
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <View style={{ width: 6, height: 22, borderRadius: 2, backgroundColor: backdrop.heroGradient[1] }} />
                <View style={{ width: 6, height: 22, borderRadius: 2, backgroundColor: backdrop.heroGradient[1] }} />
              </View>
            </ControlButton>
          )}
          {phase === 'paused' && (
            <ControlButton onPress={resume} big>
              <Icon name="play" size={30} color={backdrop.heroGradient[1]} />
            </ControlButton>
          )}
          {phase === 'done' && (
            <Pressable
              onPress={replay}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11 }}
            >
              <Icon name="review" size={18} color={backdrop.heroGradient[1]} />
              <Text style={{ color: backdrop.heroGradient[1], fontWeight: '800', fontSize: 14 }}>{t('drill.replay')}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function ControlButton({ onPress, children, big }: { onPress: () => void; children: React.ReactNode; big?: boolean }) {
  const size = big ? 62 : 52;
  return (
    <Pressable
      onPress={onPress}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' }}
    >
      {children}
    </Pressable>
  );
}
