const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
// Point at any OpenAI-compatible provider via `supabase secrets set OPENAI_BASE_URL=...`.
//   OpenAI:  https://api.openai.com/v1        (default)
//   Groq:    https://api.groq.com/openai/v1   (free — chat + whisper)
//   Gemini:  https://generativelanguage.googleapis.com/v1beta/openai (free)
//   OpenRouter: https://openrouter.ai/api/v1  (free `:free` models)
const OPENAI_BASE_URL = Deno.env.get('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1';
// Overridable via `supabase secrets set OPENAI_MODEL=...`; defaults to a broadly-available model.
// e.g. Groq: llama-3.3-70b-versatile · Gemini: gemini-1.5-flash · OpenRouter: a `:free` model.
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
  console.warn('[lahja-functions] OPENAI_API_KEY is not set — AI calls will fail until it is configured with `supabase secrets set`.');
}

async function openaiFetch(path: string, body: unknown) {
  const res = await fetch(`${OPENAI_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

/** Chat completion returning raw text (used for grammar explanations, tutor chat, character chat). */
export async function chatComplete(opts: {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  temperature?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const data = await openaiFetch('/chat/completions', {
    model: OPENAI_MODEL,
    temperature: opts.temperature ?? 0.7,
    response_format: opts.jsonMode ? { type: 'json_object' } : undefined,
    messages: [{ role: 'system', content: opts.system }, ...opts.messages],
  });
  return data.choices[0].message.content as string;
}

/** Structured JSON generation helper — asks the model to respond as strict JSON and parses it. */
export async function chatCompleteJSON<T>(opts: { system: string; user: string; temperature?: number }): Promise<T> {
  const text = await chatComplete({
    system: `${opts.system}\n\nRespond with ONLY valid JSON, no markdown fences, no commentary.`,
    messages: [{ role: 'user', content: opts.user }],
    temperature: opts.temperature,
    jsonMode: true,
  });
  return JSON.parse(text) as T;
}

// Whisper picks the decoder from the file extension, so the filename must match the real format.
const MIME_EXT: Record<string, string> = {
  'audio/m4a': 'm4a',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
};

/** Whisper speech-to-text transcription from a base64-encoded audio blob. */
export async function transcribeAudio(audioBase64: string, mimeType = 'audio/m4a'): Promise<{ text: string }> {
  const bytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
  const ext = MIME_EXT[(mimeType ?? '').toLowerCase()] ?? 'm4a';
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mimeType }), `audio.${ext}`);
  // OpenAI: whisper-1 · Groq: whisper-large-v3. Override with OPENAI_WHISPER_MODEL.
  form.append('model', Deno.env.get('OPENAI_WHISPER_MODEL') ?? 'whisper-1');

  const res = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Whisper transcription failed (${res.status}): ${await res.text()}`);
  return res.json();
}

/** OpenAI TTS — returns raw audio bytes as base64. */
export async function textToSpeech(text: string, voice = 'alloy'): Promise<string> {
  const res = await fetch(`${OPENAI_BASE_URL}/audio/speech`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'tts-1', voice, input: text, response_format: 'mp3' }),
  });
  if (!res.ok) throw new Error(`TTS failed (${res.status}): ${await res.text()}`);
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
