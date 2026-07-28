# Architecture

## Overview

Lisan is an Expo Router app. Routing is file-based (`app/`), UI state lives in Zustand stores
persisted to MMKV (`src/stores/`), server state (Supabase queries, when used directly instead
of local content) goes through TanStack Query, and all AI features are proxied through
Supabase Edge Functions so the OpenAI key never ships in the client bundle.

```
┌─────────────┐      ┌────────────────────┐      ┌─────────────────┐
│  Expo app   │─────▶│ Supabase Edge Funcs │─────▶│   OpenAI API     │
│ (this repo) │      │ (supabase/functions)│      │ (GPT/Whisper/TTS)│
└─────┬───────┘      └─────────┬──────────┘      └──────────────────┘
      │                        │
      ▼                        ▼
┌─────────────┐      ┌────────────────────┐
│ MMKV (local │      │ Postgres + RLS      │
│ persistence)│      │ (supabase/migrations)│
└─────────────┘      └────────────────────┘
```

## Local-first content

Lesson content (vocabulary, units, lessons, characters, stories, achievements, quests) is
authored as static TypeScript data under `src/content/`, not fetched from the backend. This
means the app is fully playable offline with zero backend configuration — only the *AI*
features (speaking analysis, AI-generated lessons, AI conversation, AI tutor chat) require a
configured Supabase project + OpenAI key, and those all fail gracefully with an inline message
if unavailable.

`src/content/lessonGenerator.ts` turns a list of `VocabWord`s into a full set of `Exercise`s
(vocabulary, listening, matching, translation, typing, word-order, speed-round) using a seeded
shuffle so the generated lesson is stable across renders/sessions rather than re-randomizing
every time.

## State layer

- `useUserStore` — auth identity + onboarding profile + subscription tier.
- `useGamificationStore` — XP, level, coins, diamonds, streaks, season pass, league, and a
  `dailyActivity` log (xp/lessons/perfect-lessons/speaking/words-reviewed/conversations per
  day) that backs daily-quest progress on the Home screen.
- `useLessonStore` — completed lesson IDs, per-lesson best accuracy, and the SRS card map
  (`wordId -> SRSCard`).
- `useSettingsStore` — theme, accessibility, notification, and active-dialect preferences.
- `useSocialStore` — friends + leaderboard cache.
- `useConversationStore` — per-character conversation history + last score ("memory").

All stores use `zustand/middleware`'s `persist` with an MMKV-backed storage adapter
(`src/lib/storage.ts`), so progress survives app restarts without any backend round-trip.

## Lesson runner

`src/features/lessons/LessonRunner.tsx` is the state machine for a single lesson session:
tracks hearts (lives), progress, and correctness; dispatches each `Exercise` to the matching
component via `ExerciseRenderer.tsx`; and on completion computes XP/coins via
`src/lib/gamificationMath.ts` and updates the SRS card for every exercise's related word.

## Spaced repetition

`src/lib/srs.ts` implements an SM-2 derived scheduler (see file docstring for the two
deliberate deviations from textbook SM-2). It's pure and fully unit-tested
(`__tests__/srs.test.ts`) independent of the store/UI layer.

## AI integration

`src/lib/ai/client.ts` is the only place the app calls `supabase.functions.invoke`. Every AI
edge function lives under `supabase/functions/<name>/index.ts`, is Deno-based, and shares
`supabase/functions/_shared/openai.ts` for chat/JSON/Whisper/TTS calls. See `docs/API.md`.

## Navigation

Expo Router with a root `Stack` (`app/_layout.tsx`) wrapping a `(tabs)` group for the five
main tabs (Home, Learn, Practice, Leaderboard, Profile), plus full-screen-modal routes for
lessons, reviews, conversations, and stories, and regular modals for settings/paywall/
achievements/season-pass.
