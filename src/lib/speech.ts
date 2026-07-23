import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

/**
 * Speech playback for the app. Two engines:
 *  - `speakArabic` — free on-device/browser TTS (Web Speech API / native). No dialect accent, and
 *    silent on devices with no Arabic voice installed.
 *  - `speakReply` — plays real "AI voice" audio (mp3 bytes) returned by the text-to-speech edge
 *    function when a TTS provider is configured, and automatically falls back to `speakArabic`
 *    when it isn't (or fails), caching that decision so we don't retry a missing provider each turn.
 */

// ---- Free on-device / browser voice --------------------------------------------------------------

// undefined = not looked up yet, null = looked up and none available, string = the voice id.
let arabicVoiceId: string | null | undefined;

async function resolveArabicVoice(): Promise<string | undefined> {
  if (arabicVoiceId !== undefined) return arabicVoiceId ?? undefined;
  try {
    let voices = await Speech.getAvailableVoicesAsync();
    // The browser often returns an empty list until voices finish loading — retry briefly.
    for (let tries = 0; voices.length === 0 && tries < 6; tries++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      voices = await Speech.getAvailableVoicesAsync();
    }
    const arabic = voices.find((v) => (v.language ?? '').toLowerCase().startsWith('ar'));
    arabicVoiceId = arabic?.identifier ?? null;
    return arabic?.identifier;
  } catch {
    arabicVoiceId = null;
    return undefined;
  }
}

export function speakArabic(text: string | undefined, rate = 0.85) {
  if (!text) return;
  try {
    Speech.stop();
    resolveArabicVoice()
      .then((voice) => {
        try {
          Speech.speak(text, { language: 'ar', rate, voice });
        } catch {
          // Some browsers/devices have no Arabic voice installed — fail silently rather than crash.
        }
      })
      .catch(() => {});
  } catch {
    // ignore
  }
}

/** True when the device/browser actually has an Arabic voice — lets the UI warn when it doesn't. */
export async function hasArabicVoice(): Promise<boolean> {
  return (await resolveArabicVoice()) !== undefined;
}

// ---- AI voice (mp3 bytes from the backend) -------------------------------------------------------

let currentSound: Audio.Sound | null = null;
// undefined = untried, true = AI voice works, false = no TTS provider configured (use browser voice).
let aiVoiceWorks: boolean | undefined;

async function stopCurrentSound() {
  const sound = currentSound;
  currentSound = null;
  if (sound) {
    try {
      await sound.stopAsync();
    } catch {
      /* ignore */
    }
    try {
      await sound.unloadAsync();
    } catch {
      /* ignore */
    }
  }
}

async function playBase64Audio(base64: string, mime: string) {
  await stopCurrentSound();
  const { sound } = await Audio.Sound.createAsync({ uri: `data:${mime};base64,${base64}` }, { shouldPlay: true });
  currentSound = sound;
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync().catch(() => {});
      if (currentSound === sound) currentSound = null;
    }
  });
}

/**
 * Speak a reply with the AI voice when available, else the free browser voice. `requestAudio` should
 * call the text-to-speech backend and resolve to `{ audioBase64, mimeType }`.
 */
export async function speakReply(
  text: string | undefined,
  requestAudio: () => Promise<{ audioBase64?: string; mimeType?: string }>,
) {
  if (!text) return;
  stopSpeaking();
  if (aiVoiceWorks !== false) {
    try {
      const { audioBase64, mimeType } = await requestAudio();
      if (audioBase64) {
        await playBase64Audio(audioBase64, mimeType ?? 'audio/mpeg');
        aiVoiceWorks = true;
        return;
      }
    } catch {
      aiVoiceWorks = false; // no TTS provider configured — don't keep retrying this session.
    }
  }
  speakArabic(text);
}

export function stopSpeaking() {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
  void stopCurrentSound();
}
