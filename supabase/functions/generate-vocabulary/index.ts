import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { chatCompleteJSON } from '../_shared/openai.ts';

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const { dialectId, category, count } = await req.json();

    const result = await chatCompleteJSON<{
      words: {
        arabic: string;
        transliteration: string;
        ipa: string;
        english: string;
        exampleSentenceArabic: string;
        exampleSentenceTranslit: string;
        exampleSentenceEnglish: string;
      }[];
    }>({
      system: `You are an expert Arabic dialectologist generating authentic vocabulary for the "${dialectId}" dialect. Every word must be genuinely used by native speakers of that specific dialect (not generic MSA). Include accurate transliteration and a simple IPA approximation.`,
      user: `Generate ${count} vocabulary words in the "${category}" category for the "${dialectId}" dialect. Respond as JSON: { "words": [{ "arabic": string, "transliteration": string, "ipa": string, "english": string, "exampleSentenceArabic": string, "exampleSentenceTranslit": string, "exampleSentenceEnglish": string }] }`,
      temperature: 0.6,
    });

    const words = result.words.map((w, i) => ({
      ...w,
      id: `${dialectId}_${category}_ai_${Date.now()}_${i}`,
      dialectId,
      category,
      difficulty: 2,
    }));

    return jsonResponse({ words });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
