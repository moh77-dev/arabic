import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { textToSpeech } from '../_shared/openai.ts';

// Maps dialect + desired gender/register to an OpenAI TTS voice. OpenAI's stock
// voices aren't dialect-specific, so this is the best current approximation —
// swap in a dedicated Arabic-dialect TTS provider here once available.
const VOICE_MAP: Record<string, string> = {
  algerian_eloued: 'onyx',
  algerian_algiers: 'echo',
  msa: 'alloy',
};

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const { text, dialectId, voice } = await req.json();
    const chosenVoice = voice ?? VOICE_MAP[dialectId] ?? 'alloy';
    const audioBase64 = await textToSpeech(text, chosenVoice);
    return jsonResponse({ audioBase64, mimeType: 'audio/mpeg' });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
