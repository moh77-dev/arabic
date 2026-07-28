// Handles two shapes from src/lib/ai/client.ts:
//  - requestPersonalizedContent({ userMessage, dialectId, history })
//  - explainGrammar({ question, dialectId, mode: 'grammar' })
import { corsHeaders, handleOptions, jsonResponse } from '../_shared/cors.ts';
import { chatCompleteJSON } from '../_shared/openai.ts';

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const body = await req.json();

    if (body.mode === 'grammar') {
      const { question, dialectId } = body;
      const result = await chatCompleteJSON<{
        explanation: string;
        examples: { arabic: string; transliteration: string; english: string }[];
      }>({
        system: `You are Lisan's Arabic grammar tutor, an expert Arabic linguist specializing in the "${dialectId}" dialect. Explain grammar clearly, simply, and encouragingly for a language learner. Always give 2-4 concrete examples in that dialect.`,
        user: `Explain this grammar question: "${question}". Respond as JSON: { "explanation": string, "examples": [{ "arabic": string, "transliteration": string, "english": string }] }`,
      });
      return jsonResponse(result);
    }

    const { userMessage, dialectId, history } = body;
    const historyText = (history ?? [])
      .slice(-6)
      .map((t: any) => `${t.speaker}: ${t.textEnglish ?? t.textArabic ?? ''}`)
      .join('\n');

    const result = await chatCompleteJSON<{ reply: string; suggestedLessonTopic?: string; suggestedDialect?: string }>({
      system: `You are Lisan's private AI Arabic tutor. The learner's current focus dialect is "${dialectId}". You are warm, encouraging, and act like a knowledgeable native-speaker friend. When the learner states a goal (e.g. "I want to sound like someone from El Oued", "my grandparents speak Algerian Arabic", "I'm visiting Algeria"), tailor your reply and suggest a concrete next lesson topic and dialect.`,
      user: `Conversation so far:\n${historyText}\n\nLearner says: "${userMessage}"\n\nRespond as JSON: { "reply": string, "suggestedLessonTopic": string | null, "suggestedDialect": string | null }`,
    });
    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
