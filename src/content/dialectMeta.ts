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
  algerian_eloued: {
    id: 'algerian_eloued',
    name: 'Algerian Arabic',
    nativeName: 'الدارجة الجزائرية',
    flag: '🇩🇿',
    region: 'Algeria',
    blurb:
      'Algerian Darja — the everyday spoken Arabic of Algeria, rich with Amazigh and French influence. Lisan\'s flagship dialect.',
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
  libyan: {
    id: 'libyan',
    name: 'Libyan Arabic',
    nativeName: 'الليبي',
    flag: '🇱🇾',
    region: 'Libya',
    blurb: 'Maghrebi–Bedouin blend spoken from Tripoli to Benghazi, with rich desert vocabulary.',
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
    flag: '🌿',
    region: 'Syria, Lebanon, Jordan, Palestine',
    blurb: 'The shared melodic Levantine register — a great umbrella before you pick a country below.',
    isAlgerianRegional: false,
  },
  palestinian: {
    id: 'palestinian',
    name: 'Palestinian Arabic',
    nativeName: 'الفلسطيني',
    flag: '🇵🇸',
    region: 'Palestine',
    blurb: 'Levantine dialect of Palestine — rural and urban varieties, rich in proverbs and heritage.',
    isAlgerianRegional: false,
  },
  lebanese: {
    id: 'lebanese',
    name: 'Lebanese Arabic',
    nativeName: 'اللبناني',
    flag: '🇱🇧',
    region: 'Lebanon',
    blurb: 'The famously musical Beirut dialect, heavy with French and English code-switching.',
    isAlgerianRegional: false,
  },
  syrian: {
    id: 'syrian',
    name: 'Syrian Arabic',
    nativeName: 'السوري',
    flag: '🇸🇾',
    region: 'Syria',
    blurb: 'Damascene Levantine Arabic, warm and widely understood thanks to Syrian TV drama.',
    isAlgerianRegional: false,
  },
  jordanian: {
    id: 'jordanian',
    name: 'Jordanian Arabic',
    nativeName: 'الأردني',
    flag: '🇯🇴',
    region: 'Jordan',
    blurb: 'Levantine–Bedouin blend spoken across Jordan, from Amman city speech to the badia.',
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

// `algerian_algiers` is retired as a separate dialect (merged into the single "Algerian Arabic").
// Its meta entry stays so cross-dialect comparison data still resolves, but it's never offered.
const HIDDEN_DIALECTS: DialectId[] = ['algerian_algiers'];
export const DIALECT_LIST = Object.values(DIALECTS).filter((d) => !HIDDEN_DIALECTS.includes(d.id));
