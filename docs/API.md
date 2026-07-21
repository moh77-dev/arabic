# Edge Functions API

All functions live under `supabase/functions/<name>/index.ts`, run on Deno, and are called
from the client exclusively through `src/lib/ai/client.ts` (`supabase.functions.invoke`).
Every function requires a valid Supabase auth JWT (`verify_jwt = true` in `supabase/config.toml`)
and the `OPENAI_API_KEY` secret (`supabase secrets set OPENAI_API_KEY=sk-...`).

| Function | Request body | Response | Used for |
|---|---|---|---|
| `ai-tutor` | `{ userMessage, dialectId, history }` **or** `{ mode: 'grammar', question, dialectId }` | `{ reply, suggestedLessonTopic?, suggestedDialect? }` or `{ explanation, examples[] }` | Free-form tutor chat ("I want to sound like someone from El Oued") and grammar Q&A |
| `generate-lesson` | `{ dialectId, topic, difficulty, weakWordIds, userGoal }` | `{ title, titleArabic, exercises[] }` | AI-generated lessons personalized to weak words |
| `generate-vocabulary` | `{ dialectId, category, count }` | `{ words[] }` | Expanding the vocabulary bank on demand |
| `grammar-correction` | `{ text, dialectId }` | `{ corrected, explanation, mistakes[] }` | Free-text grammar correction |
| `transcribe-speech` | `{ audioBase64, dialectId, expectedText? }` | `{ transcript, confidence }` | Whisper STT |
| `text-to-speech` | `{ text, dialectId, voice? }` | `{ audioBase64, mimeType }` | Native-accent playback |
| `pronunciation-analysis` | `{ audioBase64, targetText, targetTransliteration, dialectId }` | `{ overallScore, wordScores[], phonemeIssues[], suggestions[] }` | Speaking exercises |
| `score-conversation` | `{ history, dialectId, characterId }` | `ConversationScore` (6 dimensions + corrections/strengths/areas) | End-of-conversation report card |
| `character-chat` | `{ characterId, history, userMessageText? or userMessageAudioBase64? }` | `{ reply: ConversationTurn }` | AI conversation partner turns |

## Design notes

- `_shared/openai.ts` centralizes all OpenAI calls (`chatComplete`, `chatCompleteJSON`,
  `transcribeAudio`, `textToSpeech`) so every function shares the same error handling and
  the `gpt-5.5` model id lives in one place.
- `chatCompleteJSON` asks the model to respond in `response_format: json_object` mode and
  parses the result — functions that need structured output (lessons, vocab, scores) use this
  instead of hand-rolled regex parsing.
- `character-chat` mirrors a subset of `src/content/characters.ts` (`CHARACTER_PROMPTS`)
  because Deno edge functions can't import the app's path-aliased TypeScript modules. Keep the
  two in sync when adding/editing characters.
- Every client-side call in `src/lib/ai/client.ts` is wrapped in try/catch by its caller (see
  `SpeakingExercise.tsx`, `conversation/[characterId].tsx`) so a missing/misconfigured backend
  degrades to a friendly message instead of a crash.

## Local development

```bash
supabase start                 # local Postgres + functions runtime
supabase functions serve ai-tutor --env-file supabase/.env.local
```
