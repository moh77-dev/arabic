import { supabase } from './supabase';
import type { League, LeaderboardEntry } from '@/types';

/**
 * Fetches the global weekly leaderboard for a league from the `get_weekly_leaderboard` RPC
 * (a SECURITY DEFINER function that exposes only public columns). If the backend isn't reachable
 * or the migration hasn't been applied yet, we fall back to a plausible set of rivals so the
 * league is never empty. The caller merges in the local "You" row and assigns final ranks.
 */

const RIVAL_NAMES = [
  'Yacine', 'Fatiha', 'Bilal', 'Salma', 'Mourad', 'Rania', 'Hamza',
  'Amine', 'Nour', 'Karim', 'Yasmine', 'Sofiane', 'Lina', 'Zohra', 'Sami',
];
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

export async function fetchLeaderboard(league: League): Promise<LeaderboardEntry[]> {
  try {
    // Cast: the RPC isn't in the generated Database types (added in migration 0004).
    const rpc = supabase.rpc as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: unknown }>;
    const { data, error } = await rpc('get_weekly_leaderboard', { p_league: league, p_limit: 30 });
    if (error) throw error;
    if (Array.isArray(data) && data.length > 0) {
      return data.map((r: { display_name?: string; avatar?: string; weekly_xp?: number; league?: string }, i: number) => ({
        userId: `lb_${league}_${i}`,
        displayName: r.display_name ?? 'Learner',
        avatar: r.avatar ?? 'default_1',
        weeklyXp: r.weekly_xp ?? 0,
        league: (r.league as League) ?? league,
        rank: 0,
      }));
    }
    // RPC reachable but nothing seeded yet — keep the UI populated.
    return fallbackRivals(league);
  } catch {
    return fallbackRivals(league);
  }
}
