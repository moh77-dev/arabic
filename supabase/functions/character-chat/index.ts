import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { chatComplete, transcribeAudio } from '../_shared/openai.ts';

// Keep this in sync with src/content/characters.ts (Deno edge functions can't
// import the app's aliased TypeScript modules, so the seed prompts are mirrored here).
const CHARACTER_PROMPTS: Record<string, { seed: string; dialectId: string }> = {
  char_grandmother: { seed: 'You are Yemma Zohra, a loving grandmother from El Oued, Algeria. You speak El Oued (Souf) Algerian Arabic dialect, slowly and warmly, often blessing the listener ("allah yaʿtik es-saha"). Keep sentences short for beginners.', dialectId: 'algerian_eloued' },
  char_taxi_driver: { seed: 'You are Si Mourad, a talkative taxi driver in El Oued. You speak fast colloquial Souf Arabic, ask where the passenger is going, discuss the fare, and love talking football.', dialectId: 'algerian_eloued' },
  char_waiter: { seed: 'You are Karim, a waiter at a Souf restaurant. Recommend local dishes, take the order, ask about spice level.', dialectId: 'algerian_eloued' },
  char_coffee_owner: { seed: 'You are Ammi Belgacem, an old coffee shop owner in El Oued. You like philosophical small talk and dominoes.', dialectId: 'algerian_eloued' },
  char_police_officer: { seed: 'You are a polite Algerian police officer speaking Algiers Arabic, helping tourists with directions.', dialectId: 'algerian_algiers' },
  char_football_fan: { seed: 'You are Amine, an over-excited football fan from El Oued.', dialectId: 'algerian_eloued' },
  char_neighbor: { seed: 'You are Khalti Fatiha, a friendly and curious neighbor in El Oued.', dialectId: 'algerian_eloued' },
  char_friend: { seed: 'You are Yacine, a casual young friend from El Oued who uses lots of slang.', dialectId: 'algerian_eloued' },
  char_university_student: { seed: 'You are Nour, a Palestinian university student in Ramallah who speaks warm Palestinian Levantine Arabic.', dialectId: 'palestinian' },
  char_market_vendor: { seed: 'You are Ammi Saleh, a loud and persuasive date/spice vendor in the Souf market.', dialectId: 'algerian_eloued' },
  char_wedding_guest: { seed: 'You are Samira, a joyful guest at a Souf wedding.', dialectId: 'algerian_eloued' },
  char_airport_employee: { seed: 'You are an airport check-in employee mixing Modern Standard Arabic with light dialect.', dialectId: 'msa' },
  char_hotel_receptionist: { seed: 'You are Lina, a friendly hotel receptionist in Beirut who speaks melodic Lebanese Arabic.', dialectId: 'lebanese' },
};

// Human-readable dialect names for generated characters (ids like "egyptian_grandmother").
const DIALECT_NAMES: Record<string, string> = {
  msa: 'Modern Standard Arabic',
  algerian_algiers: 'Algiers Arabic',
  algerian_eloued: 'El Oued (Souf) Algerian Arabic',
  moroccan: 'Moroccan Darija',
  tunisian: 'Tunisian Arabic',
  libyan: 'Libyan Arabic',
  egyptian: 'Egyptian Arabic',
  levantine: 'Levantine Arabic',
  palestinian: 'Palestinian Arabic',
  lebanese: 'Lebanese Arabic',
  syrian: 'Syrian Arabic',
  jordanian: 'Jordanian Arabic',
  saudi: 'Saudi Arabic',
  gulf: 'Gulf Arabic',
  iraqi: 'Iraqi Arabic',
  sudanese: 'Sudanese Arabic',
  yemeni: 'Yemeni Arabic',
};

const ROLE_SEEDS: Record<string, string> = {
  grandmother: 'a loving grandmother who speaks slowly and warmly, blessing the listener and asking about family',
  friend: 'a casual young friend who uses everyday slang, jokes around, and is patient with learners',
  vendor: 'a lively market vendor who expects customers to haggle over prices',
  waiter: 'a friendly café waiter who recommends local dishes and takes your order',
  neighbor: 'a friendly, curious neighbor who loves chatting at the door',
};

/** Resolves a character id to a chat seed, handling both authored (char_*) and generated (dialect_role) ids. */
function resolveCharacter(characterId: string): { seed: string; dialectId: string } | null {
  const authored = CHARACTER_PROMPTS[characterId];
  if (authored) return authored;
  // Generated id shape: `${dialectId}_${roleKey}` — dialectId may itself contain an underscore.
  const dialectId = Object.keys(DIALECT_NAMES).find((d) => characterId.startsWith(`${d}_`));
  if (!dialectId) return null;
  const roleKey = characterId.slice(dialectId.length + 1);
  const roleDesc = ROLE_SEEDS[roleKey];
  if (!roleDesc) return null;
  return {
    seed: `You are ${roleDesc}, from a place where people speak ${DIALECT_NAMES[dialectId]}. Speak that dialect naturally and stay in character.`,
    dialectId,
  };
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  try {
    const { characterId, history, userMessageAudioBase64, userMessageText } = await req.json();
    const character = resolveCharacter(characterId);
    if (!character) return jsonResponse({ error: `Unknown character "${characterId}"` }, 400);

    let userText = userMessageText;
    if (!userText && userMessageAudioBase64) {
      const { text } = await transcribeAudio(userMessageAudioBase64);
      userText = text;
    }
    if (!userText) return jsonResponse({ error: 'No user message provided' }, 400);

    const messages = (history ?? []).slice(-10).map((t: any) => ({
      role: t.speaker === 'user' ? 'user' : 'assistant',
      content: t.textEnglish ?? t.textArabic ?? '',
    }));
    messages.push({ role: 'user', content: userText });

    const replyText = await chatComplete({
      system: `${character.seed}\n\nStay in character at all times. Reply in the ${character.dialectId} dialect using Arabic script, then give a transliteration and English translation, formatted exactly as:\nARABIC: <arabic script>\nTRANSLIT: <transliteration>\nENGLISH: <english>`,
      messages,
      temperature: 0.85,
    });

    const arabicMatch = replyText.match(/ARABIC:\s*(.*)/);
    const translitMatch = replyText.match(/TRANSLIT:\s*(.*)/);
    const englishMatch = replyText.match(/ENGLISH:\s*(.*)/);

    return jsonResponse({
      reply: {
        id: `ai_${Date.now()}`,
        speaker: 'ai',
        textArabic: arabicMatch?.[1]?.trim() ?? '',
        textTransliteration: translitMatch?.[1]?.trim() ?? '',
        textEnglish: englishMatch?.[1]?.trim() ?? replyText,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});
