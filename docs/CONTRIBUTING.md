# Contributing

## Setup

```bash
npm install
cp .env.example .env
npm run start
```

## Before opening a PR

```bash
npm run lint
npm run typecheck
npm test
```

All three must pass — this is what CI checks.

## Code style

- TypeScript everywhere, `strict` mode on. No `any` unless genuinely unavoidable.
- Prettier handles formatting (`npm run format`); don't hand-format.
- Path aliases: `@/*` → `src/*`. Don't use relative `../../..` imports across feature
  boundaries.
- UI primitives go in `src/components/ui/`; feature-specific components go in
  `src/features/<feature>/`.
- Pure logic (math, scheduling algorithms) should be extracted into `src/lib/*.ts` and unit
  tested — see `src/lib/srs.ts` / `src/lib/gamificationMath.ts` as the pattern to follow.

## Adding vocabulary / a new dialect

1. Add entries to a file under `src/content/dialects/` following the `VocabWord` shape in
   `src/types/index.ts`.
2. Register the dialect in `src/content/dialectMeta.ts` (`DIALECTS` map) if it's new.
3. Export the vocab array from `src/content/dialects/index.ts`.
4. Lessons/units are generated automatically from vocabulary by
   `src/content/lessonPaths.ts` — no manual exercise authoring needed for a standard
   vocabulary lesson.
5. Run `npm test` — `__tests__/content.test.ts` checks for duplicate IDs and that El Oued
   remains the most-detailed track; keep that invariant if you're expanding another dialect.

## Adding an AI feature

1. Add the Edge Function under `supabase/functions/<name>/index.ts`, reusing
   `_shared/openai.ts` and `_shared/cors.ts`.
2. Add a typed wrapper method in `src/lib/ai/client.ts`.
3. Call it from a component, wrapped in try/catch with a graceful fallback UI — see
   `SpeakingExercise.tsx` for the pattern (AI features must never hard-crash the app if the
   backend isn't configured).
4. Document the new function in `docs/API.md`.

## Commit style

Small, focused commits. Describe *why*, not just *what*, when the reasoning isn't obvious from
the diff.
