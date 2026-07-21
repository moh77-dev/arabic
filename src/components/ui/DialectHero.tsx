import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from './AnimatedPressable';
import { Avatar } from './Avatar';
import { LandmarkSilhouette } from './LandmarkSilhouette';
import { StreakFlame } from './StreakFlame';
import { getBackdrop } from '@/content/dialectBackdrops';
import { DIALECTS } from '@/content/dialectMeta';
import { getLandmarkImage } from '@/content/landmarkImages';
import type { DialectId } from '@/types';

interface Props {
  dialectId: DialectId;
  name: string;
  avatarId: string;
  streak: number;
  onProfile: () => void;
  onSettings: () => void;
}

/**
 * The Home hero: a dialect-tinted gradient header with the region's landmark silhouette faded in
 * at the bottom, plus the avatar / greeting / settings row. Swapping dialects swaps the whole
 * backdrop (Cairo skyline for Egyptian, Martyrs' Memorial for Algerian, domes for El Oued, …).
 */
export function DialectHero({ dialectId, name, avatarId, streak, onProfile, onSettings }: Props) {
  const backdrop = getBackdrop(dialectId);
  const meta = DIALECTS[dialectId] ?? DIALECTS.msa;
  const insets = useSafeAreaInsets();
  const photo = getLandmarkImage(backdrop.silhouette);

  const content = (
    <View style={{ paddingHorizontal: 20, paddingTop: Math.max(insets.top, 12) + 8, paddingBottom: 26 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AnimatedPressable onPress={onProfile} withHaptic={false}>
          <Avatar id={avatarId} size={46} ring />
        </AnimatedPressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <StreakFlame streak={streak} />
          <AnimatedPressable
            onPress={onSettings}
            withHaptic={false}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.14)',
            }}
          >
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </AnimatedPressable>
        </View>
      </View>

      <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, marginTop: 22 }}>Assalamu alaykum,</Text>
      <Text style={{ color: '#ffffff', fontSize: 30, fontWeight: '900', letterSpacing: -0.4 }}>{name} 👋</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
        <Text style={{ fontSize: 15 }}>{meta.flag}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: '600' }}>{backdrop.landmark}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' }}>
      {photo ? (
        // Real photo supplied — fill the hero with it under a dark scrim so text stays readable.
        <ImageBackground source={photo} resizeMode="cover">
          <LinearGradient
            colors={['rgba(0,0,0,0.25)', `${backdrop.heroGradient[1]}dd`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {content}
        </ImageBackground>
      ) : (
        <LinearGradient colors={backdrop.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {/* No photo yet — dialect-tinted gradient with the vector landmark faded in at the bottom. */}
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 }}>
            <LandmarkSilhouette kind={backdrop.silhouette} color="#ffffff" opacity={0.16} />
          </View>
          {content}
        </LinearGradient>
      )}
    </View>
  );
}
