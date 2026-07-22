import { supabase } from '@/lib/supabase';
import type { DialectId, ConversationScore, ConversationTurn, Exercise, PronunciationResult, VocabWord } from '@/types';

/**
 * Thin client for the AI features. Every call hits a Supabase Edge Function
 * rather than the OpenAI API directly — the API key must never ship inside
 * the mobile bundle. See supabase/functions/* for the server-side implementation.
 */
async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) throw error;
  if (!data) throw new Error(`AI function "${name}" returned no data`);
  return data;
}

export const ai = {
  /** Generates a fresh lesson tailored to the user's dialect, level, and known weak words. */
  generateLesson: (opts: {
    dialectId: DialectId;
    topic: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    weakWordIds: string[];
    userGoal: string;
  }) => invoke<{ title: string; titleArabic: string; exercises: Exercise[] }>('generate-lesson', opts),

  /** Free-form request like "I want to sound like someone from El Oued." */
  requestPersonalizedContent: (opts: { userMessage: string; dialectId: DialectId; history: ConversationTurn[] }) =>
    invoke<{ reply: string; suggestedLessonTopic?: string; suggestedDialect?: DialectId }>('ai-tutor', opts),

  explainGrammar: (opts: { question: string; dialectId: DialectId }) =>
    invoke<{ explanation: string; examples: { arabic: string; transliteration: string; english: string }[] }>(
      'ai-tutor',
      { ...opts, mode: 'grammar' },
    ),

  correctGrammar: (opts: { text: string; dialectId: DialectId }) =>
    invoke<{ corrected: string; explanation: string; mistakes: { original: string; fix: string; rule: string }[] }>(
      'grammar-correction',
      opts,
    ),

  generateVocabulary: (opts: { dialectId: DialectId; category: string; count: number }) =>
    invoke<{ words: VocabWord[] }>('generate-vocabulary', opts),

  /** Sends a recorded utterance (base64 audio) for Whisper transcription. */
  transcribeSpeech: (opts: { audioBase64: string; dialectId: DialectId; expectedText?: string }) =>
    invoke<{ transcript: string; confidence: number }>('transcribe-speech', opts),

  /** OpenAI TTS for native-accent playback of a phrase. */
  textToSpeech: (opts: { text: string; dialectId: DialectId; voice?: string }) =>
    invoke<{ audioBase64: string; mimeType: string }>('text-to-speech', opts),

  analyzePronunciation: (opts: { audioBase64: string; targetText: string; targetTransliteration: string; dialectId: DialectId }) =>
    invoke<PronunciationResult>('pronunciation-analysis', opts),

  scoreConversation: (opts: { history: ConversationTurn[]; dialectId: DialectId; characterId: string }) =>
    invoke<ConversationScore>('score-conversation', opts),

  chatWithCharacter: (opts: {
    characterId: string;
    /** Required for the dialect-agnostic "anis" tutor so the backend replies in the active dialect. */
    dialectId?: DialectId;
    history: ConversationTurn[];
    userMessageAudioBase64?: string;
    userMessageText?: string;
  }) => invoke<{ reply: ConversationTurn; audioBase64?: string }>('character-chat', opts),
};
