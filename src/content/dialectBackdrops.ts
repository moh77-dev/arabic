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
export const DIALECT_BACKDROPS: Record<DialectId, DialectBackdrop> = {
  msa: {
    landmark: 'The Grand Mosque',
    silhouette: 'minaret',
    heroGradient: ['#123a5e', '#0a2138'],
    pageWash: ['#eef4fb', '#f4f0ff', '#fef8ec'],
  },
  algerian_algiers: {
    landmark: "Maqam E'chahid — Martyrs' Memorial, Algiers",
    silhouette: 'martyrs_memorial',
    heroGradient: ['#0f6e46', '#08331f'],
    pageWash: ['#e8fbf0', '#eef7ff', '#fdf6e9'],
  },
  algerian_eloued: {
    landmark: 'El Oued — City of a Thousand Domes',
    silhouette: 'domes',
    heroGradient: ['#b9772a', '#5c3410'],
    pageWash: ['#fdf3e2', '#fbeede', '#f7f1e4'],
  },
  moroccan: {
    landmark: 'Koutoubia Minaret, Marrakech',
    silhouette: 'koutoubia',
    heroGradient: ['#b23a2e', '#5e1a13'],
    pageWash: ['#fdeee9', '#fbeede', '#faf2ea'],
  },
  tunisian: {
    landmark: 'Sidi Bou Said',
    silhouette: 'sidibou',
    heroGradient: ['#1560a8', '#0a2f56'],
    pageWash: ['#eaf3fc', '#f0f6ff', '#fbfdff'],
  },
  libyan: {
    landmark: 'Arch of Marcus Aurelius, Tripoli',
    silhouette: 'roman_arch',
    heroGradient: ['#9a5326', '#452310'],
    pageWash: ['#fbefe1', '#f8efe2', '#f6ede0'],
  },
  egyptian: {
    landmark: 'Cairo, Egypt',
    silhouette: 'cairo',
    heroGradient: ['#c2762b', '#5a2f12'],
    pageWash: ['#fdf1e2', '#faeede', '#f7ede0'],
  },
  levantine: {
    landmark: 'The Levant',
    silhouette: 'umayyad',
    heroGradient: ['#4f7a4a', '#26361f'],
    pageWash: ['#eef6ec', '#f2f6ee', '#fbf7ee'],
  },
  palestinian: {
    landmark: 'Dome of the Rock, Jerusalem',
    silhouette: 'dome_of_rock',
    heroGradient: ['#1a6b4a', '#08301f'],
    pageWash: ['#e9f6ef', '#eef6f6', '#fbf6ec'],
  },
  lebanese: {
    landmark: 'The Cedars of Lebanon',
    silhouette: 'cedar',
    heroGradient: ['#0f6a55', '#062f28'],
    pageWash: ['#e8f6f1', '#eef6ff', '#fbf8ee'],
  },
  syrian: {
    landmark: 'Umayyad Mosque, Damascus',
    silhouette: 'umayyad',
    heroGradient: ['#8a6a3a', '#3f2d16'],
    pageWash: ['#f8f2e8', '#f4f1ea', '#fbf6ee'],
  },
  jordanian: {
    landmark: 'Petra — The Treasury',
    silhouette: 'petra',
    heroGradient: ['#a85f34', '#482813'],
    pageWash: ['#fbefe2', '#f8efe4', '#f7ede2'],
  },
  saudi: {
    landmark: 'Makkah & the Clock Tower',
    silhouette: 'kaaba_tower',
    heroGradient: ['#12603f', '#062a1a'],
    pageWash: ['#e9f6ef', '#f2f7f1', '#fbf7ec'],
  },
  gulf: {
    landmark: 'Gulf Skyline',
    silhouette: 'burj',
    heroGradient: ['#0e6e74', '#062f33'],
    pageWash: ['#e8f7f8', '#eef6ff', '#fbf8ee'],
  },
  iraqi: {
    landmark: 'Malwiya Minaret, Samarra',
    silhouette: 'malwiya',
    heroGradient: ['#9a6a2e', '#472f12'],
    pageWash: ['#faf2e4', '#f7f0e4', '#fbf5ea'],
  },
  sudanese: {
    landmark: 'Pyramids of Meroë',
    silhouette: 'meroe',
    heroGradient: ['#a85a2a', '#4a2510'],
    pageWash: ['#fbefe2', '#f9efe0', '#f6ede2'],
  },
  yemeni: {
    landmark: 'Old City of Sana’a',
    silhouette: 'sanaa',
    heroGradient: ['#8a4a2c', '#3f2011'],
    pageWash: ['#faeee5', '#f7efe6', '#faf3ea'],
  },
};

export function getBackdrop(dialectId: DialectId): DialectBackdrop {
  return DIALECT_BACKDROPS[dialectId] ?? DIALECT_BACKDROPS.msa;
}
