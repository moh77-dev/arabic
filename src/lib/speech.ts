import * as Speech from 'expo-speech';

/**
 * There are no recorded native-speaker audio files in this build (see the README's linguistic
 * note — that requires an actual recording session with native Soufi/dialect speakers). Until
 * then, "listening" and pronunciation-reference audio is synthesized on-device via TTS. It's not
 * dialect-accurate (device/browser Arabic TTS voices read Modern Standard Arabic), but it gives
 * every listening exercise real, audible Arabic instead of silently doing nothing.
 */
export function speakArabic(text: string | undefined, rate = 0.85) {
  if (!text) return;
  try {
    Speech.stop();
    Speech.speak(text, { language: 'ar', rate });
  } catch {
    // Some browsers/devices have no Arabic voice installed — fail silently rather than crash.
  }
}

export function stopSpeaking() {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}
