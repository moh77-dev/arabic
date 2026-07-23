import { handleOptions, jsonResponse } from '../_shared/cors.ts';

// The "AI voice" is a separate provider from the chat LLM, because Groq (and most free chat APIs)
// have no text-to-speech endpoint. Configure it independently so chat can stay on Groq while the
// voice comes from OpenAI, ElevenLabs, or any OpenAI-compatible /audio/speech service.
//
//   supabase secrets set TTS_PROVIDER=elevenlabs            # 'elevenlabs' | 'openai' (default)
//   ElevenLabs (free tier):  TTS_PROVIDER=elevenlabs + ELEVENLABS_API_KEY=...  (best Arabic voices)
//   OpenAI:                  TTS_API_KEY=sk-... (falls back to OPENAI_API_KEY) + optional TTS_MODEL
//   Other OpenAI-compatible: also set TTS_BASE_URL=https://.../v1
//
// MULTIPLE VOICES: the app sends `voiceKey` (a character's voiceId, e.g. "eloued_female_elder").
// Each gender+age slot resolves to a voice, with per-slot env overrides so you can assign your own:
//   ELEVENLABS_VOICE_FEMALE_ELDER, ELEVENLABS_VOICE_MALE_YOUNG, ELEVENLABS_VOICE_MALE, ... and
//   ELEVENLABS_VOICE_ID as a global fallback. Same pattern for OpenAI via OPENAI_VOICE_* if desired.
const TTS_PROVIDER = (Deno.env.get('TTS_PROVIDER') ?? 'openai').toLowerCase();
const TTS_API_KEY = Deno.env.get('TTS_API_KEY') ?? Deno.env.get('OPENAI_API_KEY') ?? '';
const TTS_BASE_URL = Deno.env.get('TTS_BASE_URL') ?? 'https://api.openai.com/v1';
const TTS_MODEL = Deno.env.get('TTS_MODEL') ?? 'tts-1';
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY') ?? '';
const ELEVENLABS_MODEL = Deno.env.get('ELEVENLABS_MODEL') ?? 'eleven_multilingual_v2';

// Classify a character's voiceId into a gender + age bucket.
function classify(voiceKey?: string): { gender: 'male' | 'female'; age: 'young' | 'adult' | 'elder' } {
  const k = (voiceKey ?? '').toLowerCase();
  const gender = k.includes('female') ? 'female' : 'male';
  const age = k.includes('elder') ? 'elder' : k.includes('young') ? 'young' : 'adult';
  return { gender, age };
}

// Built-in ElevenLabs premade voice ids (stable, multilingual) so multiple voices work out of the box.
const ELEVEN_DEFAULTS: Record<string, string> = {
  female_young: 'MF3mGyEYCl7XYWbV9V6O', // Elli
  female_adult: '21m00Tcm4TlvDq8ikWAM', // Rachel
  female_elder: 'AZnzlk1XvdvUeBnXmlld', // Domi
  male_young: 'TxGEqnHWrfWFTfGW9XjX', // Josh
  male_adult: 'ErXwobaYiN019PkySvjV', // Antoni
  male_elder: 'VR6AewLTigWG4xSOukaG', // Arnold
};

// Per-character voice defaults, so specific characters sound distinct from their gender/age peers.
// Override any of these at runtime with ELEVENLABS_VOICE_<CHARACTER_ID> (e.g. ELEVENLABS_VOICE_CHAR_FOOTBALL_FAN).
const CHAR_ELEVEN_DEFAULTS: Record<string, string> = {
  char_football_fan: 'yoZ06aMxZJJ28mfd3POQ', // Sam — raspy/energetic, fits Amine the excited fan
};
const CHAR_OPENAI_DEFAULTS: Record<string, string> = {
  char_football_fan: 'echo',
};

const envVoice = (prefix: string, id?: string) => (id ? Deno.env.get(`${prefix}_${id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`) : undefined);

function elevenVoiceFor(voiceKey?: string, characterId?: string): string {
  const { gender, age } = classify(voiceKey);
  const G = gender.toUpperCase();
  const A = age.toUpperCase();
  const configured =
    envVoice('ELEVENLABS_VOICE', characterId) ?? // per-character override (highest priority)
    Deno.env.get(`ELEVENLABS_VOICE_${G}_${A}`) ??
    Deno.env.get(`ELEVENLABS_VOICE_${G}`) ??
    Deno.env.get('ELEVENLABS_VOICE_ID');
  if (configured) return configured;
  if (characterId && CHAR_ELEVEN_DEFAULTS[characterId]) return CHAR_ELEVEN_DEFAULTS[characterId];
  return ELEVEN_DEFAULTS[`${gender}_${age}`] ?? ELEVEN_DEFAULTS.female_adult;
}

// OpenAI stock voices by gender/age (best-effort; stock voices aren't dialect- or age-specific).
function openaiVoiceFor(voiceKey?: string, dialectId?: string, characterId?: string, explicit?: string): string {
  if (explicit) return explicit;
  const { gender, age } = classify(voiceKey);
  const configured = envVoice('OPENAI_VOICE', characterId) ?? Deno.env.get(`OPENAI_VOICE_${gender.toUpperCase()}_${age.toUpperCase()}`);
  if (configured) return configured;
  if (characterId && CHAR_OPENAI_DEFAULTS[characterId]) return CHAR_OPENAI_DEFAULTS[characterId];
  if (gender === 'female') return age === 'young' ? 'nova' : age === 'elder' ? 'shimmer' : 'nova';
  return age === 'young' ? 'fable' : age === 'elder' ? 'onyx' : 'echo';
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function openaiSpeech(text: string, voice: string): Promise<string> {
  const res = await fetch(`${TTS_BASE_URL}/audio/speech`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TTS_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: TTS_MODEL, voice, input: text, response_format: 'mp3' }),
  });
  if (!res.ok) throw new Error(`TTS failed (${res.status}): ${await res.text()}`);
  return toBase64(await res.arrayBuffer());
}

async function elevenLabsSpeech(text: string, voiceId: string): Promise<string> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: ELEVENLABS_MODEL }),
  });
  if (!res.ok) throw new Error(`ElevenLabs TTS failed (${res.status}): ${await res.text()}`);
  return toBase64(await res.arrayBuffer());
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const { text, dialectId, voiceKey, characterId, voice } = await req.json();
    if (!text) return jsonResponse({ error: 'No text provided' }, 400);

    let audioBase64: string;
    if (TTS_PROVIDER === 'elevenlabs') {
      if (!ELEVENLABS_API_KEY) return jsonResponse({ error: 'ELEVENLABS_API_KEY is not set — add it or use TTS_PROVIDER=openai.' }, 400);
      audioBase64 = await elevenLabsSpeech(text, elevenVoiceFor(voiceKey, characterId));
    } else {
      if (!TTS_API_KEY) return jsonResponse({ error: 'No TTS key set (TTS_API_KEY / OPENAI_API_KEY).' }, 400);
      audioBase64 = await openaiSpeech(text, openaiVoiceFor(voiceKey, dialectId, characterId, voice));
    }
    return jsonResponse({ audioBase64, mimeType: 'audio/mpeg' });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
