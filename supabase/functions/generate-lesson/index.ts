import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { chatCompleteJSON } from '../_shared/openai.ts';

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const { dialectId, topic, difficulty, weakWordIds, userGoal } = await req.json();

    const result = await chatCompleteJSON<{
      title: string;
      titleArabic: string;
      exercises: {
        id: string;
        type: string;
        prompt: string;
        promptArabic?: string;
        options?: string[];
        correctAnswer: string;
        explanation?: string;
        xpReward: number;
      }[];
    }>({
      system: `You are Lahja's AI lesson generator, an expert in Arabic dialectology (especially Algerian Saharan/Souf Arabic). Generate a short, engaging lesson of 6-8 exercises for the "${dialectId}" dialect at difficulty ${difficulty}/5. Mix exercise types: vocabulary, listening, matching, translation, typing, word_order. Every exercise needs a unique "id", a "type", a "prompt", a "correctAnswer", and "xpReward" (10-20). Multiple choice types need 4 "options" including the correct answer.`,
      user: `Topic: "${topic}". Learner's stated goal: "${userGoal}". Words the learner has struggled with recently: ${JSON.stringify(weakWordIds ?? [])}. Weave in review of those weak words where natural. Respond as JSON: { "title": string, "titleArabic": string, "exercises": [...] }`,
      temperature: 0.8,
    });

    const exercises = result.exercises.map((e) => ({ ...e, dialectId }));
    return jsonResponse({ title: result.title, titleArabic: result.titleArabic, exercises });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
