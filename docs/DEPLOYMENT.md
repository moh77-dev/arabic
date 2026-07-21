# Deployment

## Backend (Supabase)

1. `supabase link --project-ref <ref>`
2. `supabase db push` — applies `supabase/migrations/*.sql`
3. `supabase secrets set OPENAI_API_KEY=sk-...`
4. `supabase functions deploy <name>` for each function under `supabase/functions/` (or loop
   over all of them — see the list in `docs/API.md`)
5. Configure Storage bucket CORS if you plan to play TTS audio directly from the client.

## Mobile app (EAS)

1. `npm install -g eas-cli && eas login`
2. Fill in `.env` (Supabase URL/anon key, RevenueCat keys, PostHog, Sentry DSN).
3. `eas build:configure` (already scaffolded via `eas.json` — adjust `projectId` in
   `app.json` → `extra.eas.projectId` to your own).
4. Builds:
   - `eas build --platform android --profile preview` — internal testing (APK/AAB)
   - `eas build --platform ios --profile preview` — internal testing (TestFlight-ready)
   - `eas build --platform <ios|android> --profile production` — store submission build
5. Submit: `eas submit --platform ios` / `eas submit --platform android`

## CI/CD

`.github/workflows/ci.yml` runs lint + typecheck + Jest on every push/PR to `main`, and
kicks off non-blocking EAS preview builds for both platforms on pushes to `main` (requires an
`EXPO_TOKEN` repository secret from `expo.dev` → Access Tokens).

## Environment checklist before shipping

- [ ] Supabase project linked, migrations applied, `OPENAI_API_KEY` secret set, all 9 edge
      functions deployed
- [ ] RevenueCat products/entitlements (`premium`, `family`) configured and matched in
      `src/lib/purchases.ts`
- [ ] PostHog + Sentry DSNs set in `.env` for the production build profile
- [ ] App icons/splash screens replaced (placeholders referenced in `app.json` under
      `assets/images/` need real production assets)
- [ ] Native TTS/recorded audio for at least the El Oued track reviewed by native speakers
      (see the linguistic note in the README)
- [ ] Store listings, privacy policy, and App Tracking Transparency copy (for iOS, given
      microphone + analytics usage) prepared
