import { handleOptions, jsonResponse } from '../_shared/cors.ts';

// The "AI voice" is a separate provider from the chat LLM, because Groq (and most free chat APIs)
// have no text-to-speech endpoint. Configure it independently so chat can stay on Groq while the
// voice comes from OpenAI, ElevenLabs, or any OpenAI-compatible /audio/speech service.
//
//   supabase secrets set TTS_PROVIDER=elevenlabs            # 'elevenlabs' | 'openai' (default)
//   ElevenLabs (free tier):  TTS_PROVIDER=elevenlabs + ELEVENLABS_API_KEY=...  (best Arabic voices)
//   OpenAI:                  TTS_API_KEY=sk-... (falls back to OPENAI_API_KEY) + optional TTS_MODEL
//   Other OpenAI-compatible: also set TTS_BASE_URL=https://.../v1
const TTS_PROVIDER = (Deno.env.get('TTS_PROVIDER') ?? 'openai').toLowerCase();
const TTS_API_KEY = Deno.env.get('TTS_API_KEY') ?? Deno.env.get('OPENAI_API_KEY') ?? '';
const TTS_BASE_URL = Deno.env.get('TTS_BASE_URL') ?? 'https://api.openai.com/v1';
const TTS_MODEL = Deno.env.get('TTS_MODEL') ?? 'tts-1';
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY') ?? '';
// Defaults to "Rachel" (a stock multilingual voice). Override with your own via ELEVENLABS_VOICE_ID.
const ELEVENLABS_VOICE_ID = Deno.env.get('ELEVENLABS_VOICE_ID') ?? '21m00Tcm4TlvDq8ikWAM';
const ELEVENLABS_MODEL = Deno.env.get('ELEVENLABS_MODEL') ?? 'eleven_multilingual_v2';

// OpenAI's stock voices aren't dialect-specific, so this is a best-effort mapping for that provider.
const OPENAI_VOICE_MAP: Record<string, string> = {
  algerian_eloued: 'onyx',
  algerian_algiers: 'echo',
  msa: 'alloy',
};

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

async function elevenLabsSpeech(text: string): Promise<string> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
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
    const { text, dialectId, voice } = await req.json();
    if (!text) return jsonResponse({ error: 'No text provided' }, 400);

    let audioBase64: string;
    if (TTS_PROVIDER === 'elevenlabs') {
      if (!ELEVENLABS_API_KEY) return jsonResponse({ error: 'ELEVENLABS_API_KEY is not set — add it or use TTS_PROVIDER=openai.' }, 400);
      audioBase64 = await elevenLabsSpeech(text);
    } else {
      if (!TTS_API_KEY) return jsonResponse({ error: 'No TTS key set (TTS_API_KEY / OPENAI_API_KEY).' }, 400);
      audioBase64 = await openaiSpeech(text, voice ?? OPENAI_VOICE_MAP[dialectId] ?? 'alloy');
    }
    return jsonResponse({ audioBase64, mimeType: 'audio/mpeg' });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
