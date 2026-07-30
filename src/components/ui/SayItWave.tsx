import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { speakArabic } from '@/lib/speech';

// A fixed utterance shape (not random noise) so the waveform reads as a real spoken phrase.
const SHAPE = [20, 34, 52, 70, 58, 40, 66, 88, 72, 50, 34, 46, 62, 80, 64, 44, 30, 42, 58, 74, 90, 70, 48, 34, 50, 66, 54, 38, 28, 40];
const BRASS = '#C79A3E';
const BRASS_DEEP = '#9c7422';
const BAR = '#2a1e0a';

/**
 * The signature control: a brass bar you tap to hear (and repeat) an Arabic phrase — voice made
 * visible. Speaking is the product, so this is the loudest element on the screen.
 */
export function SayItWave({ text, label = 'Say it' }: { text: string; label?: string }) {
  return (
    <AnimatedPressable
      onPress={() => speakArabic(text)}
      accessibilityRole="button"
      accessibilityLabel={`${label} — hear and repeat`}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: BRASS,
        shadowOpacity: 0.5,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      <LinearGradient
        colors={[BRASS, BRASS_DEEP]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, paddingHorizontal: 16 }}
      >
        <Text style={{ color: BAR, fontWeight: '800', fontSize: 14 }}>{label}</Text>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3, height: 32 }}>
          {SHAPE.map((h, i) => (
            <View key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: BAR, borderRadius: 2, opacity: 0.85 }} />
          ))}
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}
