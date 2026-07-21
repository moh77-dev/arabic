import type { DialectId } from '@/types';

export interface DialectMeta {
  id: DialectId;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  blurb: string;
  isAlgerianRegional: boolean;
}

export const DIALECTS: Record<DialectId, DialectMeta> = {
  msa: {
    id: 'msa',
    name: 'Modern Standard Arabic',
    nativeName: 'الفصحى',
    flag: '📖',
    region: 'Pan-Arab / formal',
    blurb: 'The formal register used in news, books, and official speech across the Arab world.',
    isAlgerianRegional: false,
  },
  algerian_algiers: {
    id: 'algerian_algiers',
    name: 'Algiers Arabic',
    nativeName: 'الدارجة الجزايرية',
    flag: '🇩🇿',
    region: 'Algiers, northern Algeria',
    blurb: 'The urban capital dialect — fast, French-influenced, the "media" Darja most Algerians understand.',
    isAlgerianRegional: true,
  },
  algerian_oran: {
    id: 'algerian_oran',
    name: 'Oran Arabic',
    nativeName: 'دارجة وهران',
    flag: '🇩🇿',
    region: 'Oran, western Algeria',
    blurb: 'Western Algerian dialect, closer to Moroccan Darija, home of Raï music slang.',
    isAlgerianRegional: true,
  },
  algerian_constantine: {
    id: 'algerian_constantine',
    name: 'Constantine Arabic',
    nativeName: 'دارجة قسنطينة',
    flag: '🇩🇿',
    region: 'Constantine, eastern Algeria',
    blurb: 'Eastern Algerian city dialect known for its distinctive "qaf" pronunciation and old urban vocabulary.',
    isAlgerianRegional: true,
  },
  algerian_annaba: {
    id: 'algerian_annaba',
    name: 'Annaba Arabic',
    nativeName: 'دارجة عنابة',
    flag: '🇩🇿',
    region: 'Annaba, northeast Algeria',
    blurb: 'Coastal eastern dialect close to Tunisian border speech.',
    isAlgerianRegional: true,
  },
  algerian_tlemcen: {
    id: 'algerian_tlemcen',
    name: 'Tlemcen Arabic',
    nativeName: 'دارجة تلمسان',
    flag: '🇩🇿',
    region: 'Tlemcen, northwest Algeria',
    blurb: 'A prestigious old-city dialect with distinctive urban Andalusi-influenced vocabulary.',
    isAlgerianRegional: true,
  },
  algerian_eloued: {
    id: 'algerian_eloued',
    name: 'El Oued (Souf) Arabic',
    nativeName: 'دارجة الوادي (سوف)',
    flag: '🏜️',
    region: 'El Oued, the Algerian Sahara',
    blurb:
      'The Bedouin-Saharan dialect of the "city of a thousand domes." Distinct pronunciation, vocabulary, and rhythm shaped by desert life, oasis agriculture, and trans-Saharan trade — Lahja\'s flagship dialect.',
    isAlgerianRegional: true,
  },
  algerian_kabyle: {
    id: 'algerian_kabyle',
    name: 'Kabyle-influenced Arabic',
    nativeName: 'الدارجة بتأثير القبايلية',
    flag: '🇩🇿',
    region: 'Kabylie, northern Algeria',
    blurb: 'Algerian Arabic as spoken in and around Kabyle (Amazigh) regions, with Tamazight loanwords.',
    isAlgerianRegional: true,
  },
  moroccan: {
    id: 'moroccan',
    name: 'Moroccan Darija',
    nativeName: 'الدارجة المغربية',
    flag: '🇲🇦',
    region: 'Morocco',
    blurb: 'Fast, heavily-reduced dialect with strong Amazigh and French influence.',
    isAlgerianRegional: false,
  },
  tunisian: {
    id: 'tunisian',
    name: 'Tunisian Arabic',
    nativeName: 'التونسي',
    flag: '🇹🇳',
    region: 'Tunisia',
    blurb: 'Maghrebi dialect bridging Algerian and Libyan speech, with distinct intonation.',
    isAlgerianRegional: false,
  },
  egyptian: {
    id: 'egyptian',
    name: 'Egyptian Arabic',
    nativeName: 'المصري',
    flag: '🇪🇬',
    region: 'Egypt',
    blurb: 'The most widely understood dialect thanks to Egyptian film and TV.',
    isAlgerianRegional: false,
  },
  levantine: {
    id: 'levantine',
    name: 'Levantine Arabic',
    nativeName: 'الشامي',
    flag: '🇱🇧',
    region: 'Syria, Lebanon, Jordan, Palestine',
    blurb: 'Melodic dialect group used across the Levant, popular in music and drama.',
    isAlgerianRegional: false,
  },
  saudi: {
    id: 'saudi',
    name: 'Saudi Arabic',
    nativeName: 'السعودي',
    flag: '🇸🇦',
    region: 'Saudi Arabia',
    blurb: 'Najdi and Hejazi speech, close to Gulf Arabic with Bedouin roots.',
    isAlgerianRegional: false,
  },
  gulf: {
    id: 'gulf',
    name: 'Gulf Arabic',
    nativeName: 'الخليجي',
    flag: '🇦🇪',
    region: 'UAE, Kuwait, Qatar, Bahrain',
    blurb: 'Khaleeji dialects sharing heavy Bedouin vocabulary and distinctive vowel shifts.',
    isAlgerianRegional: false,
  },
  iraqi: {
    id: 'iraqi',
    name: 'Iraqi Arabic',
    nativeName: 'العراقي',
    flag: '🇮🇶',
    region: 'Iraq',
    blurb: 'Mesopotamian Arabic, distinct "g" for qaf and unique verb morphology.',
    isAlgerianRegional: false,
  },
  sudanese: {
    id: 'sudanese',
    name: 'Sudanese Arabic',
    nativeName: 'السوداني',
    flag: '🇸🇩',
    region: 'Sudan',
    blurb: 'African-influenced Arabic dialect with unique rhythm and vocabulary.',
    isAlgerianRegional: false,
  },
  yemeni: {
    id: 'yemeni',
    name: 'Yemeni Arabic',
    nativeName: 'اليمني',
    flag: '🇾🇪',
    region: 'Yemen',
    blurb: 'One of the most conservative dialects, retaining many Classical Arabic features.',
    isAlgerianRegional: false,
  },
};

export const DIALECT_LIST = Object.values(DIALECTS);
