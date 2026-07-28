# Lisan — Speak Arabic Like a Local

Lisan is a mobile app for learning spoken Arabic dialects, with Algerian Arabic — and
especially the **El Oued (Souf)** dialect of the Algerian Sahara — as its flagship track.
It combines a Duolingo-style lesson/gamification loop with an AI tutor, AI conversation
partners, and spaced-repetition vocabulary review.

## Features

- **17 dialects**: MSA, six Algerian regional dialects (Algiers, Oran, Constantine, Annaba,
  Tlemcen, Kabyle-influenced, and the deeply-detailed **El Oued/Souf** track), plus Moroccan,
  Tunisian, Egyptian, Levantine, Saudi, Gulf, Iraqi, Sudanese, and Yemeni.
- **Lesson engine** with 10 exercise types (vocabulary, listening, matching, translation,
  typing, word ordering, picture matching, speed rounds, speaking, flashcards) auto-generated
  from the vocabulary database, plus AI-generated lessons via `generate-lesson`.
- **AI conversation mode** with 13 characters (grandmother, taxi driver, market vendor, etc.),
  each with a distinct personality, dialect, and difficulty, scored after every conversation
  on pronunciation, grammar, vocabulary, confidence, naturalness, and fluency.
- **AI pronunciation analysis** — record yourself, get a phoneme-level score against the
  target phrase via Whisper transcription + GPT scoring.
- **Spaced repetition** (SM-2 derived, see `src/lib/srs.ts`) drives the Practice tab.
- **Interactive stories** with branching dialogue and vocabulary recap.
- **Full gamification loop**: XP, levels, coins, diamonds, streaks (+ streak freezes), daily/
  weekly/monthly quests, achievements, a 20-tier season pass, leagues, and a shop.
- **Onboarding** that builds a personalized `OnboardingProfile` (goals, dialect, difficulty,
  daily goal, reminder time, speech confidence).
- Light/dark theme, haptics, reduced-motion and color-blindness accessibility settings.

## Tech stack

| Layer | Choice |
|---|---|
| App | Expo (SDK 52) + React Native 0.76 + TypeScript, Expo Router, NativeWind, Reanimated |
| State | Zustand (MMKV-persisted) + TanStack Query |
| Backend | Supabase (Postgres, RLS, Auth, Storage, Edge Functions) |
| AI | OpenAI GPT (chat + JSON generation), Whisper (STT), OpenAI TTS |
| Payments | RevenueCat (+ Stripe web checkout for the Family plan) |
| Analytics | PostHog, Sentry |

## Project structure

```
app/                     Expo Router screens (file-based routing)
  (auth)/                 Sign in / sign up
  (tabs)/                 Home, Learn, Practice, Leaderboard, Profile
  onboarding/              Multi-step onboarding flow
  lesson/[id].tsx          Lesson runner
  conversation/            AI character picker + chat
  story/                   Interactive stories
  review.tsx               Spaced-repetition review session
  settings.tsx, shop.tsx, paywall.tsx, achievements.tsx, season-pass.tsx

src/
  components/ui/          Design-system primitives (Button, Card, XPBar, ...)
  features/lessons/       Exercise renderers + lesson runner logic
  content/                Dialect vocabulary, lesson generation, characters, stories,
                           achievements, quests — see content/dialects/eloued.ts
  stores/                 Zustand stores (user, gamification, lessons, settings, social, ...)
  lib/                    Supabase client, AI client, SRS algorithm, theme, auth, purchases
  types/                  Shared TypeScript types + generated Supabase Database type

supabase/
  migrations/              SQL schema + RLS policies
  functions/                Edge Functions (OpenAI integration)
```

See `docs/ARCHITECTURE.md` for more detail.

## Getting started

```bash
npm install
cp .env.example .env      # fill in Supabase/RevenueCat/PostHog/Sentry keys
npm run start              # Expo dev server — press i / a / w
```

### Backend setup (Supabase)

```bash
supabase init               # if you haven't already linked a project
supabase link --project-ref <your-project-ref>
supabase db push             # applies supabase/migrations/*.sql
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions deploy ai-tutor generate-lesson generate-vocabulary \
  grammar-correction transcribe-speech text-to-speech pronunciation-analysis \
  score-conversation character-chat
```

Without a linked Supabase project + `OPENAI_API_KEY`, every AI feature (speaking exercises,
conversation mode, AI lesson generation) fails gracefully in the app — you'll see a friendly
inline message instead of a crash, since these calls are wrapped in try/catch. Everything
else (lessons, gamification, SRS, stories) works fully offline with the local content set.

### Payments (RevenueCat)

Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` in `.env`, and
configure matching product/entitlement identifiers (`premium`, `family`) in the RevenueCat
dashboard — see `src/lib/purchases.ts` and `app/paywall.tsx`. Purchases require a native
(EAS) build; they will not work inside Expo Go.

## Scripts

```bash
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Jest unit tests
npm run format       # Prettier
npm run build:android / npm run build:ios   # EAS builds
```

## A note on the El Oued (Souf) content

El Oued Arabic is the app's flagship, most-detailed dialect (see `src/content/dialects/eloued.ts`
for ~70 vocabulary entries across greetings, family, market, religion, Ramadan, football,
school, business, marriage, slang, and idioms, plus grammar notes and sample conversations in
`elouedConversations.ts`). The vocabulary reflects well-attested Saharan/Bedouin Algerian
Arabic features (e.g. ق→g, ma-...-sh negation, ntaε possession). Before shipping to production,
have native Soufi speakers record real audio and review the more hyper-local slang entries —
regional variation exists even between El Oued town and surrounding Souf villages, and this
content was authored without native-speaker audio verification.

## Testing

`__tests__/` covers the SRS scheduler, gamification math (XP/level/streak curves), content
integrity (no duplicate vocab IDs, every lesson has exercises, El Oued is the most detailed
track), and a UI component smoke test. Run with `npm test`.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — app architecture & data flow
- [`docs/DATABASE.md`](docs/DATABASE.md) — Supabase schema & RLS
- [`docs/API.md`](docs/API.md) — Edge Functions reference
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — EAS build & store submission
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — contribution guide
