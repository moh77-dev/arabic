import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { chatCompleteJSON, transcribeAudio } from '../_shared/openai.ts';

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const { audioBase64, targetText, targetTransliteration, dialectId } = await req.json();

    const { text: heardText } = await transcribeAudio(audioBase64);

    const result = await chatCompleteJSON<{
      overallScore: number;
      wordScores: { word: string; score: number; issue?: string }[];
      phonemeIssues: { phoneme: string; expected: string; heard: string }[];
      suggestions: string[];
    }>({
      system: `You are an expert Arabic pronunciation coach for the "${dialectId}" dialect. Compare what the learner said (transcribed by Whisper, so treat minor transcription noise leniently) against the target phrase and give constructive, specific, encouraging feedback.`,
      user: `Target phrase: "${targetText}" (transliteration: "${targetTransliteration}"). What the learner's recording transcribed to: "${heardText}". Score 0-100 and identify specific issues. Respond as JSON: { "overallScore": number, "wordScores": [{ "word": string, "score": number, "issue": string | null }], "phonemeIssues": [{ "phoneme": string, "expected": string, "heard": string }], "suggestions": [string] }`,
    });

    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
