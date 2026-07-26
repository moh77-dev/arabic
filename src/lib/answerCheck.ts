/**
 * Lenient answer checking for typed exercises. Transliterating Arabic into Latin letters is
 * inherently inconsistent ("shukran" / "choukran" / "shukraan" / "shokran"), so a strict
 * character-for-character match punishes answers that are effectively right. This module:
 *   1. normalizes both sides through the same aggressive, *symmetric* transformations (so common
 *      spelling variants collapse to the same canonical form),
 *   2. accepts multiple listed variations (separators, parentheticals, an explicit list), and
 *   3. tolerates small typos via edit distance on longer answers.
 */

const LEADING_ARTICLES = ['the ', 'a ', 'an ', 'to '];

// Latin accents (U+0300–U+036F) + Arabic harakat (U+064B–U+0652).
const DIACRITICS = /[̀-ًͯ-ْ]/g;

/**
 * Canonicalize an answer. The transforms are intentionally lossy but applied to input AND the
 * accepted answer equally — so they only ever make two *variants of the same word* match, not two
 * genuinely different words.
 */
export function normalizeAnswer(raw: string): string {
  let s = (raw ?? '').toString().toLowerCase().trim();
  // Strip Latin accents and Arabic diacritics (harakat).
  s = s.normalize('NFD').replace(DIACRITICS, '');
  // "Arabizi" chat-alphabet numerals → nearest Latin sound.
  s = s
    .replace(/2/g, '')
    .replace(/3/g, 'a')
    .replace(/4/g, 'th')
    .replace(/5/g, 'kh')
    .replace(/6/g, 't')
    .replace(/7/g, 'h')
    .replace(/8/g, 'gh')
    .replace(/9/g, 'q');
  // Common transliteration spelling equivalences (French vs English conventions, long vowels).
  s = s.replace(/ch/g, 'sh').replace(/ou/g, 'u').replace(/oo/g, 'u').replace(/ee/g, 'i');
  // Drop punctuation, apostrophes and hyphens.
  s = s.replace(/[.,!?؟،'’`\-_/()\[\]"“”:;]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  // Drop a leading article.
  for (const a of LEADING_ARTICLES) if (s.startsWith(a)) s = s.slice(a.length);
  // Collapse runs of the same letter ("shukrann" → "shukran", "aa" → "a").
  s = s.replace(/(.)\1+/g, '$1');
  return s.replace(/\s+/g, ' ').trim();
}

/** Split one answer string into acceptable alternatives: strip parentheticals, split on separators. */
export function expandVariations(raw: string): string[] {
  if (!raw) return [];
  const noParen = raw.replace(/\([^)]*\)/g, ' ');
  return noParen
    .split(/[/,;|]|\bor\b/i)
    .map((x) => x.trim())
    .filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => i);
  for (let j = 1; j <= n; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= m; i++) {
      const tmp = dp[i];
      dp[i] = Math.min(dp[i] + 1, dp[i - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[m];
}

/** Build the full list of acceptable answer strings for an exercise. */
export function acceptedAnswersFor(exercise: { correctAnswer: string | string[]; acceptedAnswers?: string[] }): string[] {
  const raw: string[] = [];
  const push = (v: string | string[] | undefined) => {
    if (Array.isArray(v)) raw.push(v.join(' '));
    else if (v) raw.push(v);
  };
  push(exercise.correctAnswer);
  (exercise.acceptedAnswers ?? []).forEach((v) => push(v));
  // Each entry plus its split variations.
  return Array.from(new Set(raw.concat(raw.flatMap(expandVariations))));
}

/**
 * True if `input` acceptably matches any accepted answer: exact after normalization, or within a
 * small edit distance (~25%) for longer answers so a near-miss / typo still counts.
 */
export function isAnswerCorrect(input: string, accepted: string[]): boolean {
  const ni = normalizeAnswer(input);
  if (!ni) return false;
  for (const a of accepted) {
    const na = normalizeAnswer(a);
    if (!na) continue;
    if (ni === na) return true;
    if (na.length >= 5) {
      if (levenshtein(ni, na) <= Math.floor(na.length / 4)) return true;
    } else if (na.length === 4) {
      if (levenshtein(ni, na) <= 1) return true;
    }
  }
  return false;
}
