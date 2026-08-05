import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { AnimatedSceneStage, sceneSetting } from './AnimatedSceneStage';
import { Icon } from './Icon';
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
  sceneId: string;
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
export function AnimatedScenePlayer({ sceneId, lines, dialectId, width, height, insetTop }: Props) {
  const t = useT();
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const backdrop = getBackdrop(dialectId);
  const setting = useMemo(() => sceneSetting(sceneId), [sceneId]);
  const ink = backdrop.heroGradient[1];
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
  const activeSide = phase === 'playing' && line ? side : null;

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      {/* The illustrated, animated set (backdrop + characters that bob and talk). */}
      <AnimatedSceneStage
        setting={setting}
        dialectId={dialectId}
        width={width}
        height={height}
        activeSide={activeSide}
        speaking={phase === 'playing'}
      />

      {/* Scrims keep the white UI readable over any sky. */}
      <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insetTop + 130 }} pointerEvents="none" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.45)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 110 }} pointerEvents="none" />

      {/* Foreground: progress + dialogue */}
      <View style={[StyleSheet.absoluteFill, { paddingTop: insetTop + 8, paddingHorizontal: 20 }]} pointerEvents="box-none">
        <View style={{ flexDirection: 'row', gap: 5, marginTop: 4, marginBottom: 10 }}>
          {lines.map((_, i) => (
            <View key={i} style={{ flex: 1, height: 3, borderRadius: 999, backgroundColor: i < shownCount ? '#ffffff' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </View>

        {showTranscript && line ? (
          <Animated.View
            style={{
              opacity: anim,
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
              alignItems: side === 'right' ? 'flex-end' : 'flex-start',
            }}
          >
            <View style={{ flexDirection: side === 'right' ? 'row-reverse' : 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: ink, fontWeight: '900', fontSize: 12 }}>{line.speaker.charAt(0)}</Text>
              </View>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }}>{line.speaker}</Text>
            </View>
            <View
              style={{
                maxWidth: '94%',
                backgroundColor: 'rgba(10,16,26,0.62)',
                borderRadius: 18,
                borderTopLeftRadius: side === 'left' ? 4 : 18,
                borderTopRightRadius: side === 'right' ? 4 : 18,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.14)',
                paddingVertical: 12,
                paddingHorizontal: 15,
              }}
            >
              <Text style={{ color: '#ffffff', fontFamily: fonts.arabicDisplay, fontSize: 24, textAlign: 'right', lineHeight: 38 }}>{line.arabic}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12.5, marginTop: 5, fontStyle: 'italic' }}>{line.transliteration}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13.5, marginTop: 3 }}>{line.english}</Text>
            </View>
          </Animated.View>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 6 }}>
            <View style={{ backgroundColor: 'rgba(10,16,26,0.55)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>{t('drill.watchScene')}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Controls pinned to the bottom, centered between the two characters. */}
      <View style={{ position: 'absolute', bottom: 14, left: 0, right: 0, alignItems: 'center' }} pointerEvents="box-none">
        {phase === 'idle' && (
          <ControlButton onPress={start} big>
            <Icon name="play" size={28} color={ink} />
          </ControlButton>
        )}
        {phase === 'playing' && (
          <ControlButton onPress={pause}>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <View style={{ width: 6, height: 20, borderRadius: 2, backgroundColor: ink }} />
              <View style={{ width: 6, height: 20, borderRadius: 2, backgroundColor: ink }} />
            </View>
          </ControlButton>
        )}
        {phase === 'paused' && (
          <ControlButton onPress={resume} big>
            <Icon name="play" size={28} color={ink} />
          </ControlButton>
        )}
        {phase === 'done' && (
          <Pressable
            onPress={replay}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11 }}
          >
            <Icon name="review" size={18} color={ink} />
            <Text style={{ color: ink, fontWeight: '800', fontSize: 14 }}>{t('drill.replay')}</Text>
          </Pressable>
        )}
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
