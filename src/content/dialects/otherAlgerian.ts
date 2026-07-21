import type { VocabWord } from '@/types';

/** Lighter vocabulary sets for the other Algerian regional dialects (greetings, daily life, family). */

const make = (
  dialectId: VocabWord['dialectId'],
  prefix: string,
  entries: Omit<VocabWord, 'dialectId' | 'id'>[],
): VocabWord[] => entries.map((e, i) => ({ ...e, dialectId, id: `${prefix}_${i + 1}` }));

export const ALGIERS_VOCAB = make('algerian_algiers', 'algiers', [
  { arabic: 'واش رايك', transliteration: 'wesh rak?', ipa: '/weʃ raːk/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'صحّا', transliteration: 'sahha', ipa: '/sˤaħ.ħa/', english: 'Cool / good (Algiers slang)', category: 'slang', difficulty: 1 },
  { arabic: 'بزّاف', transliteration: 'bezzaf', ipa: '/bez.zaːf/', english: 'A lot / very', category: 'daily_life', difficulty: 1 },
  { arabic: 'كاين', transliteration: 'kayn', ipa: '/kajn/', english: 'There is', category: 'daily_life', difficulty: 1 },
  { arabic: 'دزيري', transliteration: 'dziri', ipa: '/dzi.ri/', english: 'From Algiers (nickname)', category: 'slang', difficulty: 2 },
  { arabic: 'راني نقرا', transliteration: 'rani neqra', ipa: '/raː.ni nεqra/', english: "I'm studying", category: 'school', difficulty: 2 },
  { arabic: 'يا الحبيب', transliteration: 'ya lhabib', ipa: '/ja l.ħa.biːb/', english: 'Hey my dear (friendly address)', category: 'slang', difficulty: 1 },
  { arabic: 'تروماي', transliteration: 'tramway', ipa: '/tram.waj/', english: 'Tram (Algiers has a modern tramway)', category: 'travel', difficulty: 1 },
]);

export const ORAN_VOCAB = make('algerian_oran', 'oran', [
  { arabic: 'واش الخبر', transliteration: 'wesh lekhbar?', ipa: '/weʃ lex.baːr/', english: "What's the news / what's up", category: 'greetings', difficulty: 1 },
  { arabic: 'الراي', transliteration: 'er-rai', ipa: '/er.raːj/', english: 'Raï music, born in Oran', category: 'slang', difficulty: 1 },
  { arabic: 'تبارك الله', transliteration: 'tbarkallah', ipa: '/tba.rkal.laːh/', english: 'God bless (admiration)', category: 'religion', difficulty: 1 },
  { arabic: 'مليح', transliteration: 'mlih', ipa: '/mliːħ/', english: 'Good / nice (Oran/western usage)', category: 'daily_life', difficulty: 1 },
  { arabic: 'الوهراني', transliteration: 'el-wahrani', ipa: '/el.wah.raː.ni/', english: 'Person from Oran', category: 'slang', difficulty: 2 },
  { arabic: 'دخلك', transliteration: 'dakhlek', ipa: '/dax.lek/', english: 'Please (I beg you)', category: 'expressions', difficulty: 2 },
]);

export const CONSTANTINE_VOCAB = make('algerian_constantine', 'constantine', [
  { arabic: 'قداش راك؟', transliteration: 'qeddash rak?', ipa: '/qed.daːʃ raːk/', english: 'How are you? (keeps the classical qaf)', category: 'greetings', difficulty: 1 },
  { arabic: 'مليحة برشة', transliteration: 'mliha barsha', ipa: '/mliː.ħa bar.ʃa/', english: 'Very good', category: 'daily_life', difficulty: 2 },
  { arabic: 'الجسور', transliteration: 'ej-jusur', ipa: '/edʒ.dʒu.suːr/', english: 'The bridges (Constantine is "the city of bridges")', category: 'travel', difficulty: 1 },
  { arabic: 'قسنطيني', transliteration: 'qsentini', ipa: '/qsen.tiː.ni/', english: 'Person from Constantine', category: 'slang', difficulty: 2 },
  { arabic: 'الملسوقة', transliteration: 'el-melsuqa', ipa: '/el.mel.suː.qa/', english: 'Local layered pastry dish', category: 'food', difficulty: 2 },
]);

export const ANNABA_VOCAB = make('algerian_annaba', 'annaba', [
  { arabic: 'عسلامة', transliteration: 'aslema', ipa: '/as.le.ma/', english: 'Hello (border-influenced greeting, shared with Tunisia)', category: 'greetings', difficulty: 1 },
  { arabic: 'البونة', transliteration: 'el-buna', ipa: '/el.buː.na/', english: 'Old name for Annaba', category: 'slang', difficulty: 2 },
  { arabic: 'برشة', transliteration: 'barsha', ipa: '/bar.ʃa/', english: 'A lot (shared with Tunisian border speech)', category: 'daily_life', difficulty: 1 },
  { arabic: 'الكورنيش', transliteration: 'el-corniche', ipa: '/el.kɔr.niʃ/', english: 'The seaside promenade', category: 'travel', difficulty: 1 },
]);

export const TLEMCEN_VOCAB = make('algerian_tlemcen', 'tlemcen', [
  { arabic: 'كيفاش راكم', transliteration: 'kifash rakom?', ipa: '/ki.faːʃ raː.kom/', english: 'How are you all?', category: 'greetings', difficulty: 1 },
  { arabic: 'تلمساني', transliteration: 'tlemcani', ipa: '/tlem.saː.ni/', english: 'Person from Tlemcen', category: 'slang', difficulty: 2 },
  { arabic: 'البقلاوة', transliteration: 'el-baqlawa', ipa: '/el.baq.laː.wa/', english: 'Baklava-style pastry, a Tlemcen specialty', category: 'food', difficulty: 1 },
  { arabic: 'مدينة العلم', transliteration: "madinat el-ʿilm", ipa: '/ma.diː.nat el.ʕilm/', english: '"City of knowledge" — Tlemcen\'s nickname', category: 'expressions', difficulty: 2 },
]);

export const KABYLE_VOCAB = make('algerian_kabyle', 'kabyle', [
  { arabic: 'أزول', transliteration: 'azul', ipa: '/a.zul/', english: 'Hello (Tamazight, used even when speaking Arabic)', category: 'greetings', difficulty: 1 },
  { arabic: 'تنمirت', transliteration: 'tanemmirt', ipa: '/ta.nem.mirt/', english: 'Thank you (Tamazight loanword)', category: 'expressions', difficulty: 1 },
  { arabic: 'أرومي', transliteration: 'aẓekka', ipa: '/a.zek.ka/', english: 'Tomorrow (Tamazight-influenced usage)', category: 'time', difficulty: 2 },
  { arabic: 'يا جدّي', transliteration: 'ajeddi', ipa: '/a.dʒed.di/', english: 'Grandfather (Kabyle-Arabic blend address)', category: 'family', difficulty: 1 },
]);

export const OTHER_ALGERIAN_VOCAB: VocabWord[] = [
  ...ALGIERS_VOCAB,
  ...ORAN_VOCAB,
  ...CONSTANTINE_VOCAB,
  ...ANNABA_VOCAB,
  ...TLEMCEN_VOCAB,
  ...KABYLE_VOCAB,
];
