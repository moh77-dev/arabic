import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { transcribeAudio } from '../_shared/openai.ts';

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const { audioBase64, mimeType } = await req.json();
    const { text } = await transcribeAudio(audioBase64, mimeType);
    // Whisper doesn't return a confidence score directly; approximate with length heuristic.
    const confidence = Math.min(1, 0.5 + text.trim().length / 100);
    return jsonResponse({ transcript: text, confidence });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
