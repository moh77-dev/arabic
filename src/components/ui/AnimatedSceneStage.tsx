import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { LandmarkSilhouette } from './LandmarkSilhouette';
import { getBackdrop } from '@/content/dialectBackdrops';
import type { DialectId } from '@/types';

export type SceneSetting = 'market' | 'home' | 'ramadan' | 'city';

/** Pick an illustrated set from the scene id (hand-authored scenes) or fall back to the city skyline. */
export function sceneSetting(sceneId: string): SceneSetting {
  if (sceneId.includes('market')) return 'market';
  if (sceneId.includes('family') || sceneId.includes('home')) return 'home';
  if (sceneId.includes('ramadan') || sceneId.includes('iftar')) return 'ramadan';
  return 'city';
}

interface Palette {
  garment: string;
  garment2: string;
  skin: string;
  hair: string;
}
const LEFT: Palette = { garment: '#1f7a8c', garment2: '#155e6b', skin: '#e8b98c', hair: '#2b2118' };
const RIGHT: Palette = { garment: '#b8542f', garment2: '#8f3f22', skin: '#e6b184', hair: '#1f1a14' };

interface Props {
  setting: SceneSetting;
  dialectId: DialectId;
  width: number;
  height: number;
  /** Which character is currently speaking (so it bobs + talks); null before playback starts. */
  activeSide: 'left' | 'right' | null;
  speaking: boolean;
}

/**
 * The animated illustrated "set" a scene plays out on. Everything is drawn (SVG + views) and animated
 * with the Animated API — no footage — so it renders on web and native and adapts to each dialect.
 */
export function AnimatedSceneStage({ setting, dialectId, width, height, activeSide, speaking }: Props) {
  const backdrop = getBackdrop(dialectId);
  const groundY = Math.round(height * 0.82);

  // Gentle ambient drift for the sky/celestial layer.
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const sky = SKIES[setting] ?? ([backdrop.heroGradient[0], backdrop.heroGradient[1]] as const);
  const ground = GROUND[setting] ?? '#123';

  return (
    <View style={{ width, height, overflow: 'hidden', backgroundColor: sky[1] }}>
      <LinearGradient colors={sky} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: groundY + 40 }} />

      {/* Celestial + midground set pieces */}
      {setting === 'ramadan' ? (
        <>
          <Animated.View style={{ position: 'absolute', top: height * 0.1, right: width * 0.14, transform: [{ translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
            <Svg width={70} height={70} viewBox="0 0 70 70">
              <Path d="M50 12 A26 26 0 1 0 50 58 A20 20 0 1 1 50 12 Z" fill="#ffe9a8" />
            </Svg>
          </Animated.View>
          <Stars width={width} height={height} twinkle={drift} />
          <Lanterns width={width} height={height} sway={drift} />
        </>
      ) : (
        <Animated.View style={{ position: 'absolute', top: height * 0.09, right: width * 0.16, opacity: setting === 'home' ? 0 : 1, transform: [{ scale: drift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }}>
          <Svg width={64} height={64} viewBox="0 0 64 64">
            <Circle cx={32} cy={32} r={16} fill="#ffe08a" />
            <Circle cx={32} cy={32} r={22} fill="#ffe08a" opacity={0.25} />
          </Svg>
        </Animated.View>
      )}

      {setting === 'market' && <MarketSet width={width} groundY={groundY} />}
      {setting === 'home' && <HomeSet width={width} height={height} groundY={groundY} />}
      {setting === 'city' && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: height - groundY - 6 }} pointerEvents="none">
          <LandmarkSilhouette kind={backdrop.silhouette} color="#0b1a12" opacity={0.35} height={Math.min(150, height * 0.42)} />
        </View>
      )}

      {/* Ground */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: groundY, bottom: 0, backgroundColor: ground }} />
      <View style={{ position: 'absolute', left: 0, right: 0, top: groundY, height: 3, backgroundColor: 'rgba(255,255,255,0.12)' }} />

      {/* Characters */}
      <Character x={width * 0.17} baseY={groundY} palette={LEFT} facing={1} active={activeSide === 'left'} speaking={speaking} />
      <Character x={width * 0.83} baseY={groundY} palette={RIGHT} facing={-1} active={activeSide === 'right'} speaking={speaking} />
    </View>
  );
}

const SKIES: Record<SceneSetting, readonly [string, string]> = {
  market: ['#8fd0e8', '#f6e2a8'],
  home: ['#f3d9b1', '#e3b489'],
  ramadan: ['#243a72', '#0a1330'],
  city: ['#7fb8d6', '#dfeaf2'],
};
const GROUND: Record<SceneSetting, string> = {
  market: '#caa46a',
  home: '#a9743f',
  ramadan: '#20305c',
  city: '#3a5c3f',
};

// ---- Characters ---------------------------------------------------------------------------------

function Character({ x, baseY, palette, facing, active, speaking }: { x: number; baseY: number; palette: Palette; facing: 1 | -1; active: boolean; speaking: boolean }) {
  const bob = useRef(new Animated.Value(0)).current;
  const mouth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      bob.stopAnimation();
      Animated.timing(bob, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 620, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 620, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, bob]);

  useEffect(() => {
    if (!(active && speaking)) {
      mouth.stopAnimation();
      mouth.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(mouth, { toValue: 1, duration: 160, useNativeDriver: false }),
        Animated.timing(mouth, { toValue: 0, duration: 160, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, speaking, mouth]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const mouthH = mouth.interpolate({ inputRange: [0, 1], outputRange: [2, 9] });
  const bodyW = 64;
  const bodyH = 78;
  const headR = 24;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x - bodyW / 2,
        top: baseY - bodyH - headR * 2 + 12,
        width: bodyW,
        alignItems: 'center',
        transform: [{ translateY }, { scaleX: facing }],
        opacity: active ? 1 : 0.85,
      }}
    >
      {/* Head */}
      <View style={{ width: headR * 2, height: headR * 2, borderRadius: headR, backgroundColor: palette.skin, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 }}>
        {/* Hair cap */}
        <View style={{ position: 'absolute', top: -2, width: headR * 2 + 2, height: headR + 6, borderTopLeftRadius: headR, borderTopRightRadius: headR, backgroundColor: palette.hair }} />
        {/* Eyes */}
        <View style={{ position: 'absolute', top: headR - 4, flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#2a2018' }} />
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#2a2018' }} />
        </View>
        {/* Mouth (animates while speaking) */}
        <Animated.View style={{ width: 14, height: mouthH, borderRadius: 5, backgroundColor: '#7a3b34' }} />
      </View>
      {/* Body */}
      <View style={{ width: bodyW, height: bodyH, marginTop: -8, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: palette.garment, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', bottom: 0, width: bodyW, height: bodyH * 0.5, backgroundColor: palette.garment2, opacity: 0.5 }} />
      </View>
    </Animated.View>
  );
}

// ---- Set pieces ---------------------------------------------------------------------------------

function MarketSet({ width, groundY }: { width: number; groundY: number }) {
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: groundY - 92 }} pointerEvents="none">
      {/* Palm trees */}
      <Svg width={width} height={110} viewBox={`0 0 ${width} 110`}>
        {[width * 0.08, width * 0.92].map((cx, i) => (
          <React.Fragment key={i}>
            <Rect x={cx - 4} y={20} width={8} height={80} fill="#6b4a25" rx={3} />
            <Path d={`M${cx} 22 q-30 -14 -40 4 q26 -6 40 6`} fill="#2f7d43" />
            <Path d={`M${cx} 22 q30 -14 40 4 q-26 -6 -40 6`} fill="#2f7d43" />
            <Path d={`M${cx} 20 q-12 -26 -6 -34 q14 12 6 34`} fill="#369149" />
            <Path d={`M${cx} 20 q12 -26 6 -34 q-14 12 -6 34`} fill="#369149" />
          </React.Fragment>
        ))}
      </Svg>
      {/* A date stall with a striped awning + baskets of dates in the middle-back */}
      <View style={{ position: 'absolute', left: width / 2 - 70, top: 34, width: 140, alignItems: 'center' }}>
        <View style={{ width: 140, height: 16, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#c9433a' }} />
        <View style={{ width: 140, height: 8, flexDirection: 'row' }}>
          {[...Array(7)].map((_, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: i % 2 ? '#f2e6cf' : '#c9433a' }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          {[0, 1, 2].map((b) => (
            <View key={b} style={{ width: 34, height: 18, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, backgroundColor: '#7a4a22', alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={30} height={12} viewBox="0 0 30 12">
                {[4, 10, 16, 22, 8, 14, 20].map((cx, i) => (
                  <Ellipse key={i} cx={cx} cy={i < 4 ? 4 : 8} rx={2.4} ry={3.4} fill="#4a2b12" />
                ))}
              </Svg>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function HomeSet({ width, height, groundY }: { width: number; height: number; groundY: number }) {
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} pointerEvents="none">
      {/* Back wall already the gradient; add a window with a bit of sky + a hanging picture. */}
      <View style={{ position: 'absolute', left: width * 0.1, top: height * 0.16, width: 78, height: 88, borderRadius: 6, backgroundColor: '#3f5b7a', borderWidth: 5, borderColor: '#e8d2ad' }}>
        <View style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 4, marginLeft: -2, backgroundColor: '#e8d2ad' }} />
        <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 4, marginTop: -2, backgroundColor: '#e8d2ad' }} />
      </View>
      <View style={{ position: 'absolute', right: width * 0.12, top: height * 0.2, width: 52, height: 40, borderRadius: 4, backgroundColor: '#caa15f', borderWidth: 4, borderColor: '#7a5326' }} />
      {/* Rug on the floor */}
      <View style={{ position: 'absolute', left: width * 0.2, right: width * 0.2, top: groundY + 8, height: 14, borderRadius: 7, backgroundColor: '#b5462f', opacity: 0.85 }} />
    </View>
  );
}

function Stars({ width, height, twinkle }: { width: number; height: number; twinkle: Animated.Value }) {
  const pts = [
    [0.2, 0.12],
    [0.35, 0.22],
    [0.55, 0.1],
    [0.7, 0.26],
    [0.85, 0.16],
    [0.28, 0.32],
    [0.62, 0.34],
  ];
  return (
    <>
      {pts.map(([fx, fy], i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: width * fx,
            top: height * fy,
            width: 3,
            height: 3,
            borderRadius: 2,
            backgroundColor: '#fff',
            opacity: twinkle.interpolate({ inputRange: [0, 1], outputRange: [i % 2 ? 0.4 : 0.9, i % 2 ? 0.9 : 0.4] }),
          }}
        />
      ))}
    </>
  );
}

function Lanterns({ width, height, sway }: { width: number; height: number; sway: Animated.Value }) {
  const xs = [0.28, 0.5, 0.72];
  return (
    <>
      {xs.map((fx, i) => {
        const rot = sway.interpolate({ inputRange: [0, 1], outputRange: [i % 2 ? '-4deg' : '4deg', i % 2 ? '4deg' : '-4deg'] });
        return (
          <Animated.View key={i} style={{ position: 'absolute', left: width * fx - 10, top: height * 0.04, alignItems: 'center', transform: [{ rotate: rot }] }}>
            <View style={{ width: 1.5, height: 20, backgroundColor: 'rgba(255,255,255,0.4)' }} />
            <Svg width={22} height={30} viewBox="0 0 22 30">
              <Rect x={8} y={0} width={6} height={3} fill="#e5b24a" />
              <Path d="M4 6 Q11 -2 18 6 L18 20 Q11 28 4 20 Z" fill="#f2c14e" />
              <Path d="M4 6 Q11 -2 18 6 L18 20 Q11 28 4 20 Z" fill="#c98a2a" opacity={0.35} />
              <Circle cx={11} cy={13} r={4} fill="#fff3c4" />
              <Rect x={8} y={24} width={6} height={4} fill="#e5b24a" />
            </Svg>
          </Animated.View>
        );
      })}
    </>
  );
}
