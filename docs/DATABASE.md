# Database

Schema lives in `supabase/migrations/0001_init.sql` (tables + RLS) and
`supabase/migrations/0002_storage.sql` (storage buckets + policies). Apply with
`supabase db push` against a linked project, or paste into the Supabase SQL editor.

## Tables

| Table | Purpose | RLS |
|---|---|---|
| `profiles` | Onboarding profile + subscription tier, 1:1 with `auth.users` | owner-only |
| `gamification` | XP, level, coins, diamonds, streak, league, season pass | owner-only |
| `daily_activity` | Per-day XP/lessons/perfect-lessons/speaking/reviews/conversations — backs quest progress | owner-only |
| `srs_cards` | Spaced-repetition state per `(user, word)` | owner-only |
| `lesson_completions` | History of completed lessons + accuracy | owner-only |
| `user_achievements` | Unlocked achievement IDs | owner-only |
| `friendships` | Friend requests/relationships | participants only |
| `conversation_history` | AI conversation turn-by-turn log | owner-only |
| `conversation_scores` | Post-conversation AI scoring | owner-only |
| `ai_generated_content` | Cache of AI-generated lessons/vocab/grammar explanations | owner-only |

## Views

`weekly_leaderboard` — a read-only view joining `profiles` + `gamification` exposing only
`display_name`, `active_avatar`, `weekly_xp`, and `league`. It's intentionally granted
`select` to the whole `authenticated` role (not owner-restricted) because a leaderboard is
inherently cross-user; no other sensitive profile column is exposed through it.

## Triggers

- `on_auth_user_created` — fires on `auth.users` insert, creates the matching `profiles` and
  `gamification` rows so the client never has to do a manual "create my profile" round trip
  after sign-up.
- `profiles_set_updated_at` / `gamification_set_updated_at` — maintain `updated_at`.

## Storage buckets

- `pronunciation-recordings` (private) — user audio, scoped to `{uid}/...` folders via RLS.
- `tts-cache` (public read) — server-generated TTS audio, written by the edge functions using
  the service role key.
- `avatars` (public read, owner write) — profile pictures.

## Regenerating TypeScript types

`src/types/database.ts` is currently hand-written to match the SQL above. Once a real
Supabase project is linked, regenerate it with:

```bash
npm run supabase:gen-types
```
