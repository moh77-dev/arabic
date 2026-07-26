import { Platform } from 'react-native';
import { useSettingsStore } from '@/stores/useSettingsStore';

/**
 * Lightweight sound effects, synthesized with the Web Audio API — no audio files to bundle, and
 * every cue is a short pleasant tone. Runs on web (where the app is deployed); on native it's a
 * silent no-op (haptics already cover feedback there). Gated on the `soundEffectsEnabled` setting.
 */
export type SoundName = 'correct' | 'wrong' | 'complete' | 'levelup' | 'coin' | 'tap';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}

/** One enveloped tone. `start` is an offset (seconds) from now, so cues can be chords/arpeggios. */
function tone(ctx: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, gain: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(ctx.destination);
  const t0 = ctx.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export function playSound(name: SoundName) {
  try {
    if (!useSettingsStore.getState().soundEffectsEnabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();

    switch (name) {
      case 'correct': // bright two-note rise (C5 → G5)
        tone(ctx, 523.25, 0, 0.13, 'sine', 0.2);
        tone(ctx, 783.99, 0.1, 0.16, 'sine', 0.2);
        break;
      case 'wrong': // gentle low descending buzz — clearly "no" without being harsh
        tone(ctx, 207.65, 0, 0.16, 'sawtooth', 0.12);
        tone(ctx, 155.56, 0.1, 0.22, 'sawtooth', 0.12);
        break;
      case 'complete': // cheerful major arpeggio
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(ctx, f, i * 0.09, 0.18, 'triangle', 0.18));
        break;
      case 'levelup': // longer fanfare
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => tone(ctx, f, i * 0.08, 0.2, 'triangle', 0.18));
        break;
      case 'coin': // quick sparkle
        tone(ctx, 987.77, 0, 0.06, 'square', 0.12);
        tone(ctx, 1318.51, 0.05, 0.1, 'square', 0.12);
        break;
      case 'tap':
        tone(ctx, 440, 0, 0.05, 'sine', 0.1);
        break;
    }
  } catch {
    // Audio not available (autoplay policy, no context) — stay silent.
  }
}
