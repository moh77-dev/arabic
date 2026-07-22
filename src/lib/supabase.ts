import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import type { Database } from '@/types/database';

// Env vars win (set them in your host, e.g. Vercel, for overrides); otherwise fall back to the
// public project config baked into app.json → extra, so builds work without extra configuration.
// The anon key is a publishable key: it's meant to live in the client and is protected by RLS.
const extra = (Constants.expoConfig?.extra ?? {}) as { supabaseUrl?: string; supabaseAnonKey?: string };
const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || extra.supabaseUrl;
const rawKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || extra.supabaseAnonKey;

// createClient() calls `new URL(supabaseUrl)` internally and throws synchronously if it's
// missing or malformed — which would take down the entire app at module-load time (a blank
// screen with no chance to render even an error boundary). Validate defensively and fall back
// to a syntactically-valid placeholder so the app always finishes loading; Supabase calls will
// simply fail at request time instead, which every call site already handles.
function isValidUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = rawKey && rawKey.length > 0 ? rawKey : 'placeholder-anon-key';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-anon-key') {
  // Fail loudly in dev rather than silently hitting a fake project.
  console.warn(
    '[lahja] Missing or invalid EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — using a placeholder so the app can still load. Copy .env.example to .env (or set them in your host\'s environment variables) and redeploy.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
