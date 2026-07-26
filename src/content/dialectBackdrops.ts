import type { DialectId } from '@/types';

export type LandmarkKind =
  | 'minaret'
  | 'martyrs_memorial'
  | 'domes'
  | 'cairo'
  | 'koutoubia'
  | 'sidibou'
  | 'roman_arch'
  | 'umayyad'
  | 'dome_of_rock'
  | 'cedar'
  | 'petra'
  | 'kaaba_tower'
  | 'burj'
  | 'malwiya'
  | 'meroe'
  | 'sanaa';

export interface DialectBackdrop {
  /** Human-readable landmark name shown under the hero. */
  landmark: string;
  silhouette: LandmarkKind;
  /** Dark duotone gradient for the hero header (text sits on top, so keep it deep). */
  heroGradient: readonly [string, string];
  /** Soft light wash for the page background in light mode. */
  pageWash: readonly [string, string, string];
}

/**
 * Each dialect gets its own landmark + color story so the app visibly changes as you switch
 * dialects. Landmarks are drawn as vector silhouettes (src/components/ui/LandmarkSilhouette.tsx)
 * rather than photos — no licensing issues, crisp at any size, and works offline.
 *
 * Per the product direction: every Algerian regional dialect shows the Martyrs' Memorial
 * (Maqam E'chahid) except El Oued, which gets its signature "city of a thousand domes" skyline.
 */
// Each dialect owns a distinct, vivid hero color (like El Oued's gold), spread across the hue
// range so neighbouring countries never look alike, with a bright top stop that reads clearly
// behind the greeting and a deep bottom stop that keeps white text legible.
export const DIALECT_BACKDROPS: Record<DialectId, DialectBackdrop> = {
  msa: {
    landmark: 'The Grand Mosque',
    silhouette: 'minaret',
    heroGradient: ['#1f7a8c', '#0b2f39'], // teal — classic, pan-Arab
    pageWash: ['#e9f5f8', '#eef4fb', '#fef8ec'],
  },
  algerian_algiers: {
    landmark: "Maqam E'chahid — Martyrs' Memorial, Algiers",
    silhouette: 'martyrs_memorial',
    heroGradient: ['#118a52', '#063d24'], // Algerian emerald green
    pageWash: ['#e8fbf0', '#eef7ff', '#fdf6e9'],
  },
  algerian_eloued: {
    landmark: 'El Oued — City of a Thousand Domes',
    silhouette: 'domes',
    heroGradient: ['#d99a2e', '#5c3410'], // desert gold
    pageWash: ['#fdf3e2', '#fbeede', '#f7f1e4'],
  },
  moroccan: {
    landmark: 'Koutoubia Minaret, Marrakech',
    silhouette: 'koutoubia',
    heroGradient: ['#cf3f2d', '#5e1a13'], // Marrakech red
    pageWash: ['#fdeee9', '#fbeede', '#faf2ea'],
  },
  tunisian: {
    landmark: 'Sidi Bou Said',
    silhouette: 'sidibou',
    heroGradient: ['#2090d4', '#0a3560'], // Sidi Bou Said blue
    pageWash: ['#eaf3fc', '#f0f6ff', '#fbfdff'],
  },
  libyan: {
    landmark: 'Arch of Marcus Aurelius, Tripoli',
    silhouette: 'roman_arch',
    heroGradient: ['#c56a2b', '#452310'], // Roman terracotta
    pageWash: ['#fbefe1', '#f8efe2', '#f6ede0'],
  },
  egyptian: {
    landmark: 'Cairo, Egypt',
    silhouette: 'cairo',
    heroGradient: ['#e07a26', '#5a2f12'], // Nile-valley sunset orange
    pageWash: ['#fdf1e2', '#faeede', '#f7ede0'],
  },
  levantine: {
    landmark: 'The Levant',
    silhouette: 'umayyad',
    heroGradient: ['#6f9c3f', '#28381d'], // olive green
    pageWash: ['#f1f6e9', '#f2f6ee', '#fbf7ee'],
  },
  palestinian: {
    landmark: 'Dome of the Rock, Jerusalem',
    silhouette: 'dome_of_rock',
    heroGradient: ['#1f8a5a', '#08301f'], // deep Palestinian green
    pageWash: ['#e9f6ef', '#eef6f6', '#fbf6ec'],
  },
  lebanese: {
    landmark: 'The Cedars of Lebanon',
    silhouette: 'cedar',
    heroGradient: ['#12937a', '#062f28'], // cedar jade
    pageWash: ['#e8f6f1', '#eef6ff', '#fbf8ee'],
  },
  syrian: {
    landmark: 'Umayyad Mosque, Damascus',
    silhouette: 'umayyad',
    heroGradient: ['#a8823f', '#3f2d16'], // Umayyad stone gold
    pageWash: ['#f8f2e8', '#f4f1ea', '#fbf6ee'],
  },
  jordanian: {
    landmark: 'Petra — The Treasury',
    silhouette: 'petra',
    heroGradient: ['#c56b42', '#482813'], // Petra rose sandstone
    pageWash: ['#fbefe2', '#f8efe4', '#f7ede2'],
  },
  saudi: {
    landmark: 'Makkah & the Clock Tower',
    silhouette: 'kaaba_tower',
    heroGradient: ['#0f8a4a', '#062a1a'], // Saudi flag green
    pageWash: ['#e9f6ef', '#f2f7f1', '#fbf7ec'],
  },
  gulf: {
    landmark: 'Gulf Skyline',
    silhouette: 'burj',
    heroGradient: ['#10969e', '#062f33'], // Gulf turquoise
    pageWash: ['#e8f7f8', '#eef6ff', '#fbf8ee'],
  },
  iraqi: {
    landmark: 'Malwiya Minaret, Samarra',
    silhouette: 'malwiya',
    heroGradient: ['#b98a34', '#472f12'], // Samarra ochre / mustard
    pageWash: ['#faf2e4', '#f7f0e4', '#fbf5ea'],
  },
  sudanese: {
    landmark: 'Pyramids of Meroë',
    silhouette: 'meroe',
    heroGradient: ['#c05f2c', '#4a2510'], // Nile clay red
    pageWash: ['#fbefe2', '#f9efe0', '#f6ede2'],
  },
  yemeni: {
    landmark: 'Old City of Sana’a',
    silhouette: 'sanaa',
    heroGradient: ['#a5562f', '#3f2011'], // Sana'a rust brown
    pageWash: ['#faeee5', '#f7efe6', '#faf3ea'],
  },
};

export function getBackdrop(dialectId: DialectId): DialectBackdrop {
  return DIALECT_BACKDROPS[dialectId] ?? DIALECT_BACKDROPS.msa;
}
