import * as Speech from 'expo-speech';

/**
 * There are no recorded native-speaker audio files in this build (see the README's linguistic
 * note — that requires an actual recording session with native Soufi/dialect speakers). Until
 * then, "listening", pronunciation-reference, and chat audio is synthesized on-device via TTS.
 * It's not dialect-accurate (device/browser Arabic TTS voices read Modern Standard Arabic), but
 * it gives every listening exercise real, audible Arabic instead of silently doing nothing.
 *
 * On web this is the Web Speech API. Two things commonly make it "silent": the voice list loads
 * asynchronously (empty on the first call), and Arabic speech only works if the OS/browser has an
 * Arabic voice installed. We resolve and cache an Arabic voice up front so playback is reliable
 * wherever one exists, and expose `hasArabicVoice()` so the UI can be honest when one doesn't.
 */

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
    // Resolve the voice first so we pass an explicit Arabic voice when one exists; falling back to
    // language: 'ar' lets platforms that key off language (rather than a voice id) still work.
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

export function stopSpeaking() {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}

/** True when the device/browser actually has an Arabic voice — lets the UI warn when it doesn't. */
export async function hasArabicVoice(): Promise<boolean> {
  return (await resolveArabicVoice()) !== undefined;
}
