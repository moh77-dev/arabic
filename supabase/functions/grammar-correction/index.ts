import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { chatCompleteJSON } from '../_shared/openai.ts';

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const { text, dialectId } = await req.json();

    const result = await chatCompleteJSON<{
      corrected: string;
      explanation: string;
      mistakes: { original: string; fix: string; rule: string }[];
    }>({
      system: `You are a patient, encouraging Arabic grammar corrector specializing in the "${dialectId}" dialect. Correct the learner's text while preserving their intended meaning and the dialect's natural register (don't "correct" it into Modern Standard Arabic unless they wrote MSA).`,
      user: `Correct this text: "${text}". Respond as JSON: { "corrected": string, "explanation": string, "mistakes": [{ "original": string, "fix": string, "rule": string }] }`,
    });

    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
