import { supabase } from './supabase';
import type { League, LeaderboardEntry } from '@/types';

/**
 * Fetches the global weekly leaderboard for a league from the `get_weekly_leaderboard` RPC
 * (a SECURITY DEFINER function that exposes only public columns). If the backend isn't reachable
 * or the migration hasn't been applied yet, we fall back to a plausible set of rivals so the
 * league is never empty. The caller merges in the local "You" row and assigns final ranks.
 */

// A small set of placeholder rivals so a brand-new league isn't a lonely list of one. Real
// players always sort in alongside them and push them down as the community grows.
const RIVAL_NAMES = ['Yacine', 'Amina', 'Karim', 'Salma'];
const AVATARS = ['default_1', 'default_2', 'camel', 'falcon', 'oasis', 'crescent', 'tea', 'desert_fox'];

// Roughly where each league's weekly XP sits, so fallback rivals look league-appropriate.
const LEAGUE_BASE: Record<League, number> = {
  bronze: 220,
  silver: 560,
  gold: 1100,
  sapphire: 1800,
  ruby: 2600,
  emerald: 3500,
  amethyst: 4600,
  diamond: 6000,
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic rivals for a league — same every session so the board feels stable. */
function fallbackRivals(league: League): LeaderboardEntry[] {
  const base = LEAGUE_BASE[league] ?? 220;
  return RIVAL_NAMES.map((name, i) => {
    const h = hash(name + league);
    return {
      userId: `rival_${league}_${i}`,
      displayName: name,
      avatar: AVATARS[h % AVATARS.length],
      weeklyXp: base + (h % Math.max(120, Math.round(base * 0.7))),
      league,
      rank: 0,
    };
  });
}

// A league feels dead below this many people, so we pad with labelled practice rivals up to here.
const MIN_BOARD = 5;

/** Pads a list of real players with practice rivals (keeping the real ones) up to MIN_BOARD. */
function padWithRivals(real: LeaderboardEntry[], league: League): LeaderboardEntry[] {
  if (real.length >= MIN_BOARD) return real;
  const rivals = fallbackRivals(league).slice(0, MIN_BOARD - real.length);
  return [...real, ...rivals];
}

export async function fetchLeaderboard(league: League): Promise<LeaderboardEntry[]> {
  try {
    // Cast: the RPC isn't in the generated Database types (added in migration 0004).
    const rpc = supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: unknown }>;
    const { data, error } = await rpc('get_weekly_leaderboard', { p_league: league, p_limit: 30 });
    if (error) throw error;
    const real: LeaderboardEntry[] = Array.isArray(data)
      ? data.map((r: { display_name?: string; avatar?: string; weekly_xp?: number; league?: string }, i: number) => ({
          userId: `lb_${league}_${i}`,
          displayName: r.display_name ?? 'Learner',
          avatar: r.avatar ?? 'default_1',
          weeklyXp: r.weekly_xp ?? 0,
          league: (r.league as League) ?? league,
          rank: 0,
        }))
      : [];
    // Real players always show; practice rivals only fill remaining empty seats.
    return padWithRivals(real, league);
  } catch {
    // Backend unreachable (or migration not applied yet) — show labelled practice rivals.
    return fallbackRivals(league);
  }
}
