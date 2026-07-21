import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { chatCompleteJSON } from '../_shared/openai.ts';

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const { history, dialectId, characterId } = await req.json();
    const transcript = (history ?? [])
      .map((t: any) => `${t.speaker === 'user' ? 'Learner' : 'AI'}: ${t.textEnglish ?? t.textArabic ?? ''}`)
      .join('\n');

    const result = await chatCompleteJSON<{
      pronunciation: number;
      grammar: number;
      vocabulary: number;
      confidence: number;
      naturalness: number;
      fluency: number;
      overall: number;
      corrections: { original: string; corrected: string; explanation: string }[];
      strengths: string[];
      areasToImprove: string[];
    }>({
      system: `You are an expert Arabic conversation evaluator for the "${dialectId}" dialect, scoring a roleplay conversation with the character "${characterId}". Score each dimension 0-100. Be encouraging but honest, and give concrete corrections tied to specific things the learner said.`,
      user: `Conversation transcript:\n${transcript}\n\nRespond as JSON: { "pronunciation": number, "grammar": number, "vocabulary": number, "confidence": number, "naturalness": number, "fluency": number, "overall": number, "corrections": [{ "original": string, "corrected": string, "explanation": string }], "strengths": [string], "areasToImprove": [string] }`,
    });

    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
