/** Pure functions for XP/level/streak math — kept separate from the Zustand store so they're trivially unit-testable. */

/** XP required to go from level N to N+1 grows quadratically, Duolingo-style. */
export function xpForLevel(level: number): number {
  return Math.round(50 * Math.pow(level, 1.35));
}

export function levelFromTotalXp(totalXp: number): { level: number; xpIntoLevel: number; xpForNextLevel: number } {
  let level = 1;
  let remaining = totalXp;
  let needed = xpForLevel(level);
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = xpForLevel(level);
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: needed };
}

export function computeStreak(lastStudyDateISO: string | null, currentStreak: number, todayISO: string): number {
  if (!lastStudyDateISO) return 1;
  const last = new Date(lastStudyDateISO);
  const today = new Date(todayISO);
  const diffDays = Math.round(
    (Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) -
      Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate())) /
      86400000,
  );
  if (diffDays === 0) return currentStreak; // already studied today
  if (diffDays === 1) return currentStreak + 1; // consecutive day
  return 1; // streak broken, restart
}

export function lessonXpReward(opts: {
  baseXp: number;
  accuracy: number; // 0..1
  perfectBonus?: boolean;
  streakMultiplier?: number;
  isDoubleXpEvent?: boolean;
}): number {
  const { baseXp, accuracy, perfectBonus, streakMultiplier = 1, isDoubleXpEvent } = opts;
  let xp = baseXp * Math.max(0.4, accuracy);
  if (perfectBonus && accuracy >= 0.99) xp += baseXp * 0.25;
  xp *= streakMultiplier;
  if (isDoubleXpEvent) xp *= 2;
  return Math.round(xp);
}

export function streakFreezeCost(): number {
  return 200; // coins
}

export function coinsForLesson(accuracy: number): number {
  return Math.round(10 * Math.max(0.3, accuracy));
}

const LEAGUE_ORDER = [
  'bronze',
  'silver',
  'gold',
  'sapphire',
  'ruby',
  'emerald',
  'amethyst',
  'diamond',
] as const;

export function nextLeague(current: (typeof LEAGUE_ORDER)[number]) {
  const idx = LEAGUE_ORDER.indexOf(current);
  return LEAGUE_ORDER[Math.min(idx + 1, LEAGUE_ORDER.length - 1)];
}

export function prevLeague(current: (typeof LEAGUE_ORDER)[number]) {
  const idx = LEAGUE_ORDER.indexOf(current);
  return LEAGUE_ORDER[Math.max(idx - 1, 0)];
}

export { LEAGUE_ORDER };
