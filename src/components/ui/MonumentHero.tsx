import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { LandmarkSilhouette } from './LandmarkSilhouette';
import { getBackdrop } from '@/content/dialectBackdrops';
import { getLandmarkImage } from '@/content/landmarkImages';
import type { DialectId } from '@/types';

interface Props {
  dialectId: DialectId;
  height: number;
  children: React.ReactNode;
  /** Rounded bottom corners (default 30). */
  radius?: number;
}

/**
 * Full-bleed monument header. Uses a real landmark photo when one is registered
 * (src/content/landmarkImages.ts), otherwise the dialect-tinted gradient + vector silhouette.
 * A bottom scrim in the dialect's deep color keeps overlaid white text legible either way.
 * Callers render their own content (avatar, greeting, ask bar…) as children.
 */
export function MonumentHero({ dialectId, height, children, radius = 30 }: Props) {
  const backdrop = getBackdrop(dialectId);
  const photo = getLandmarkImage(backdrop.silhouette);
  // Keep the top of the photo clear so the monument reads as a photo; ramp to the dialect color
  // only across the lower portion, where the text sits.
  const scrimBottom = `${backdrop.heroGradient[1]}f0`;

  const body = (
    <View style={{ height, justifyContent: 'flex-end' }}>
      <LinearGradient
        colors={['rgba(0,0,0,0.12)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.15)', scrimBottom]}
        locations={[0, 0.28, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );

  return (
    <View style={{ borderBottomLeftRadius: radius, borderBottomRightRadius: radius, overflow: 'hidden' }}>
      {photo ? (
        <ImageBackground source={photo} resizeMode="cover" style={{ backgroundColor: backdrop.heroGradient[1] }}>
          {body}
        </ImageBackground>
      ) : (
        <LinearGradient colors={backdrop.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 130 }}>
            <LandmarkSilhouette kind={backdrop.silhouette} color="#ffffff" opacity={0.16} height={130} />
          </View>
          {body}
        </LinearGradient>
      )}
    </View>
  );
}
