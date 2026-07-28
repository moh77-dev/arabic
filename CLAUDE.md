# Lisan — project guide & error-fixing protocol

Lisan is an Expo (React Native + web) app for learning spoken Arabic dialects, with a Supabase
backend (Postgres + Edge Functions). The web build deploys to Vercel.

- **App code:** `app/` (expo-router screens), `src/` (components, stores, content, lib).
- **Backend:** `supabase/functions/*` (Deno edge functions). Shared code in `supabase/functions/_shared/`.
- **AI provider:** OpenAI-compatible, configured via Edge Function secrets (`OPENAI_API_KEY`,
  `OPENAI_BASE_URL`, `OPENAI_MODEL`, `OPENAI_WHISPER_MODEL`). Currently Groq (free). Text-to-speech is
  a separate provider (`TTS_PROVIDER`, ElevenLabs/OpenAI) since Groq has no TTS.

## Commands
- `npm run typecheck` — `tsc --noEmit` (run after `npm ci` so `expo/tsconfig.base` resolves).
- `npm run lint` — ESLint.
- `npm test` — Jest.

## ✅ Error-fixing protocol (follow this every time)
1. **Before pushing any change, verify it:** run `npm run typecheck` (and `npm run lint` / `npm test`
   when they're set up in the environment). Do not push code that fails typecheck.
2. **After editing an edge function**, redeploy it — edge functions deploy **directly to Supabase**,
   NOT via the Vercel/PR flow. A merged PR does not update them.
3. **When a PR's CI is red**, treat it as the task: read the failing job's logs, reproduce locally
   (`npm run typecheck` / `npm test`), fix the cause, and push until green. Don't merge red.
4. **When the app shows a runtime error** (the ErrorBoundary "Something went wrong" screen, or a
   console error), map it to a cause and fix it. React minified errors: look up the number at
   react.dev/errors/<n> (e.g. #185 = "Maximum update depth exceeded" → an infinite render loop,
   usually a Zustand v5 selector returning a fresh object/array — select the raw value and default
   outside the selector).

## Deployment gotchas (these have bitten us)
- **Default branch is `claude/lahja-arabic-dialect-app-8a962t`**, not `main`. CI and Vercel key off
  this branch. Vercel rebuilds the web app when this branch updates.
- **Merge the latest PR.** If you push more commits to a branch after opening a PR, make sure the
  merge includes them — merging an older state silently strands the newer work (this has happened
  repeatedly). Re-check `git log origin/<default>..HEAD` before telling the user something is live.
- **Confirming a deploy landed:** the web bundle filename changes on each build
  (`_expo/static/js/web/entry-<hash>.js`). Same hash after a merge = Vercel hasn't rebuilt / cache.
- **Zustand v5:** selectors must return stable references. `useStore(s => s.x ?? [])` loops (#185);
  do `useStore(s => s.x) ?? EMPTY` with a module-level constant.

## Style
Match surrounding code. Keep changes minimal and typed. Prefer fixing root causes over patches.
