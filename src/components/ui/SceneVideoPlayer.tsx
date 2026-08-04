import { Asset } from 'expo-asset';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';

interface Props {
  /** Bundled clip, e.g. require('../../assets/videos/x.mp4'). */
  source: number;
  /** Frame size — sized by the caller to the clip's aspect ratio so nothing is cropped. */
  width: number;
  height: number;
  /** "Tap to play" label (already localized by the caller). */
  label: string;
}

/**
 * Plays a bundled scene clip and fills the given box on every platform.
 *
 * Web renders a plain <video> element: expo-av's web wrapper leaves the underlying <video> at its
 * intrinsic 150px height, so it never fills a portrait frame. A real element with explicit
 * width/height (and the browser's own controls) sizes correctly and is fully visible.
 *
 * iOS/Android use expo-av's Video with a tap-to-play poster overlay so the player is clearly
 * visible before the first frame decodes.
 */
export function SceneVideoPlayer({ source, width, height, label }: Props) {
  const videoRef = useRef<Video>(null);
  const [playing, setPlaying] = useState(false);

  if (Platform.OS === 'web') {
    const uri = Asset.fromModule(source).uri;
    // On web the React renderer is react-dom, so this is a real HTML <video>. Native browser
    // controls + first-frame preview make it visible and integrated with zero extra chrome.
    return React.createElement('video', {
      src: uri,
      controls: true,
      playsInline: true,
      preload: 'metadata',
      style: {
        width,
        height,
        objectFit: 'contain',
        backgroundColor: '#000',
        display: 'block',
      },
    });
  }

  return (
    <>
      <Video
        ref={videoRef}
        source={source}
        style={{ width, height }}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls={playing}
        shouldPlay={playing}
        isLooping={false}
      />
      {!playing && (
        <Pressable
          onPress={() => {
            setPlaying(true);
            videoRef.current?.playAsync().catch(() => {});
          }}
          style={StyleSheet.absoluteFill}
        >
          <LinearGradient colors={['rgba(5,7,12,0.15)', 'rgba(5,7,12,0.75)']} style={StyleSheet.absoluteFill} />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="play" size={30} color="#05070c" />
            </View>
          </View>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 14, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{label}</Text>
          </View>
        </Pressable>
      )}
    </>
  );
}
