import type { VocabWord } from '@/types';

/** Lighter reference vocabulary for non-Algerian dialects, used for cross-dialect comparison and their own starter tracks. */

const make = (
  dialectId: VocabWord['dialectId'],
  prefix: string,
  entries: Omit<VocabWord, 'dialectId' | 'id'>[],
): VocabWord[] => entries.map((e, i) => ({ ...e, dialectId, id: `${prefix}_${i + 1}` }));

export const MSA_VOCAB = make('msa', 'msa', [
  { arabic: 'مرحباً', transliteration: 'marhaban', ipa: '/mar.ħa.ban/', english: 'Hello', category: 'greetings', difficulty: 1 },
  { arabic: 'كيف حالك؟', transliteration: 'kayfa haluka?', ipa: '/kaj.fa ħaː.lu.ka/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'شكراً', transliteration: 'shukran', ipa: '/ʃuk.ran/', english: 'Thank you', category: 'expressions', difficulty: 1 },
  { arabic: 'من فضلك', transliteration: 'min fadlik', ipa: '/min fadˤ.lik/', english: 'Please', category: 'expressions', difficulty: 1 },
  { arabic: 'نعم / لا', transliteration: 'naʿam / la', ipa: '/na.ʕam, laː/', english: 'Yes / No', category: 'daily_life', difficulty: 1 },
]);

export const MOROCCAN_VOCAB = make('moroccan', 'moroccan', [
  { arabic: 'لا باس؟', transliteration: 'la bas?', ipa: '/la baːs/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'بزّاف', transliteration: 'bezzaf', ipa: '/bez.zaf/', english: 'A lot', category: 'daily_life', difficulty: 1 },
  { arabic: 'واخا', transliteration: 'wakha', ipa: '/wa.xa/', english: 'Okay / alright', category: 'daily_life', difficulty: 1 },
  { arabic: 'شحال؟', transliteration: 'shhal?', ipa: '/ʃħal/', english: 'How much?', category: 'market', difficulty: 1 },
  { arabic: 'دابا', transliteration: 'daba', ipa: '/da.ba/', english: 'Now', category: 'time', difficulty: 1 },
]);

export const TUNISIAN_VOCAB = make('tunisian', 'tunisian', [
  { arabic: 'شنية أحوالك؟', transliteration: 'shniya ahwalek?', ipa: '/ʃni.ja aħ.wa.lek/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'برشة', transliteration: 'barsha', ipa: '/bar.ʃa/', english: 'A lot', category: 'daily_life', difficulty: 1 },
  { arabic: 'يعطيك الصحة', transliteration: 'yaʿtik saha', ipa: '/jaʕ.tiːk sˤaħ.ħa/', english: 'Thank you', category: 'expressions', difficulty: 1 },
  { arabic: 'قداش؟', transliteration: 'qeddesh?', ipa: '/qed.deʃ/', english: 'How much?', category: 'market', difficulty: 1 },
]);

export const EGYPTIAN_VOCAB = make('egyptian', 'egyptian', [
  { arabic: 'إزيك؟', transliteration: 'ezzayak?', ipa: '/ez.za.jak/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'كويس', transliteration: 'kwayyes', ipa: '/kwaj.jes/', english: 'Good', category: 'daily_life', difficulty: 1 },
  { arabic: 'إزّاي', transliteration: 'ezzay', ipa: '/ez.zaj/', english: 'How', category: 'daily_life', difficulty: 1 },
  { arabic: 'بكام؟', transliteration: 'bikam?', ipa: '/bi.kam/', english: 'How much?', category: 'market', difficulty: 1 },
]);

export const LEVANTINE_VOCAB = make('levantine', 'levantine', [
  { arabic: 'كيفك؟', transliteration: 'kifak?', ipa: '/ki.fak/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'منيح', transliteration: 'mnih', ipa: '/mniːħ/', english: 'Good', category: 'daily_life', difficulty: 1 },
  { arabic: 'يسلمو', transliteration: 'yislamo', ipa: '/jis.la.mo/', english: 'Thank you / well said', category: 'expressions', difficulty: 1 },
  { arabic: 'قديش؟', transliteration: 'addesh?', ipa: '/ad.deʃ/', english: 'How much?', category: 'market', difficulty: 1 },
]);

export const PALESTINIAN_VOCAB = make('palestinian', 'palestinian', [
  { arabic: 'كيفك؟', transliteration: 'kifak?', ipa: '/ki.fak/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'منيح', transliteration: 'mnih', ipa: '/mniːħ/', english: 'Good / fine', category: 'daily_life', difficulty: 1 },
  { arabic: 'يعطيك العافية', transliteration: 'yaʿtik el-ʿafye', ipa: '/jaʕ.tiːk el.ʕaː.fje/', english: 'Thank you (may God give you strength)', category: 'expressions', difficulty: 1 },
  { arabic: 'قديش؟', transliteration: 'addesh?', ipa: '/ad.deʃ/', english: 'How much?', category: 'market', difficulty: 1 },
  { arabic: 'زلمة', transliteration: 'zalameh', ipa: '/za.la.me/', english: 'Man / guy', category: 'slang', difficulty: 2 },
  { arabic: 'على راسي', transliteration: 'ʿala rasi', ipa: '/ʕa.la raː.si/', english: '“On my head” — with pleasure / gladly', category: 'expressions', difficulty: 2 },
  { arabic: 'يا زلمة', transliteration: 'ya zalameh', ipa: '/ja za.la.me/', english: 'Hey man! (friendly exclamation)', category: 'slang', difficulty: 1 },
  { arabic: 'الزعتر', transliteration: 'ez-zaʿtar', ipa: '/ez.zaʕ.tar/', english: 'Zaʿtar (thyme blend, a Palestinian staple)', category: 'food', difficulty: 1 },
]);

export const LEBANESE_VOCAB = make('lebanese', 'lebanese', [
  { arabic: 'كيفك؟', transliteration: 'kifak?', ipa: '/ki.fak/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'كتير منيح', transliteration: 'ktir mnih', ipa: '/ktiːr mniːħ/', english: 'Very good', category: 'daily_life', difficulty: 1 },
  { arabic: 'يعطيك', transliteration: 'yaʿtik', ipa: '/jaʕ.tiːk/', english: 'Thanks (short for yaʿtik el-ʿafye)', category: 'expressions', difficulty: 1 },
  { arabic: 'حبيبي', transliteration: 'habibe', ipa: '/ħa.biː.be/', english: 'My dear (used constantly)', category: 'slang', difficulty: 1 },
  { arabic: 'يلا', transliteration: 'yalla', ipa: '/jal.la/', english: "Come on / let's go", category: 'daily_life', difficulty: 1 },
  { arabic: 'كيف الأحوال؟', transliteration: 'kif el-ahwal?', ipa: '/kiːf el.aħ.waːl/', english: 'How are things?', category: 'greetings', difficulty: 1 },
]);

export const SYRIAN_VOCAB = make('syrian', 'syrian', [
  { arabic: 'كيفك؟', transliteration: 'kifak?', ipa: '/ki.fak/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'منيح', transliteration: 'mnih', ipa: '/mniːħ/', english: 'Good', category: 'daily_life', difficulty: 1 },
  { arabic: 'تكرم عينك', transliteration: 'tikram ʿaynak', ipa: '/tik.ram ʕaj.nak/', english: '“Honor to your eye” — sure, gladly', category: 'expressions', difficulty: 2 },
  { arabic: 'شو عم تعمل؟', transliteration: 'shu ʿam taʿmel?', ipa: '/ʃu ʕam taʕ.mel/', english: 'What are you doing?', category: 'daily_life', difficulty: 2 },
  { arabic: 'كتير', transliteration: 'ktir', ipa: '/ktiːr/', english: 'A lot / very', category: 'daily_life', difficulty: 1 },
]);

export const JORDANIAN_VOCAB = make('jordanian', 'jordanian', [
  { arabic: 'كيفك؟', transliteration: 'kifak?', ipa: '/ki.fak/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'تمام', transliteration: 'tamam', ipa: '/ta.maːm/', english: 'All good', category: 'daily_life', difficulty: 1 },
  { arabic: 'يسلمو', transliteration: 'yislamo', ipa: '/jis.la.mo/', english: 'Thank you', category: 'expressions', difficulty: 1 },
  { arabic: 'زلمة', transliteration: 'zalameh', ipa: '/za.la.me/', english: 'Man / guy', category: 'slang', difficulty: 2 },
  { arabic: 'يا زلمة', transliteration: 'ya zalameh', ipa: '/ja za.la.me/', english: 'Hey man!', category: 'slang', difficulty: 1 },
  { arabic: 'المنسف', transliteration: 'el-mansaf', ipa: '/el.man.saf/', english: 'Mansaf — the Jordanian national dish', category: 'food', difficulty: 1 },
]);

export const LIBYAN_VOCAB = make('libyan', 'libyan', [
  { arabic: 'شن حالك؟', transliteration: 'shen halek?', ipa: '/ʃen ħaː.lek/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'باهي', transliteration: 'bahi', ipa: '/baː.hi/', english: 'Good / okay', category: 'daily_life', difficulty: 1 },
  { arabic: 'برشة', transliteration: 'barsha', ipa: '/bar.ʃa/', english: 'A lot (shared with Tunisian)', category: 'daily_life', difficulty: 1 },
  { arabic: 'شنو؟', transliteration: 'shnu?', ipa: '/ʃnu/', english: 'What?', category: 'daily_life', difficulty: 1 },
  { arabic: 'توا', transliteration: 'tawwa', ipa: '/taw.wa/', english: 'Now', category: 'time', difficulty: 1 },
  { arabic: 'البازين', transliteration: 'el-bazin', ipa: '/el.baː.ziːn/', english: 'Bazin — a Libyan barley dish', category: 'food', difficulty: 2 },
]);

export const SAUDI_VOCAB = make('saudi', 'saudi', [
  { arabic: 'كيف حالك؟', transliteration: 'kaif halak?', ipa: '/kajf ħa.lak/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'زين', transliteration: 'zain', ipa: '/zajn/', english: 'Good', category: 'daily_life', difficulty: 1 },
  { arabic: 'وش أخبارك؟', transliteration: 'wesh akhbarak?', ipa: '/weʃ ax.baː.rak/', english: "What's your news? (what's up)", category: 'greetings', difficulty: 1 },
]);

export const GULF_VOCAB = make('gulf', 'gulf', [
  { arabic: 'شلونك؟', transliteration: 'shlonak?', ipa: '/ʃlo.nak/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'زين', transliteration: 'zain', ipa: '/zajn/', english: 'Good', category: 'daily_life', difficulty: 1 },
  { arabic: 'بكم؟', transliteration: 'bikam?', ipa: '/bi.kam/', english: 'How much?', category: 'market', difficulty: 1 },
]);

export const IRAQI_VOCAB = make('iraqi', 'iraqi', [
  { arabic: 'شلونك؟', transliteration: 'shlonak?', ipa: '/ʃlo.nak/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'زين', transliteration: 'zein', ipa: '/zejn/', english: 'Good', category: 'daily_life', difficulty: 1 },
  { arabic: 'گال', transliteration: 'gal', ipa: '/gaːl/', english: 'He said (qaf -> g)', category: 'daily_life', difficulty: 2 },
]);

export const SUDANESE_VOCAB = make('sudanese', 'sudanese', [
  { arabic: 'كيفك؟', transliteration: 'kefak?', ipa: '/ke.fak/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'تمام', transliteration: 'tamam', ipa: '/ta.mam/', english: 'Good / fine', category: 'daily_life', difficulty: 1 },
]);

export const YEMENI_VOCAB = make('yemeni', 'yemeni', [
  { arabic: 'كيف حالك؟', transliteration: 'kaif halak?', ipa: '/kajf ħa.lak/', english: 'How are you?', category: 'greetings', difficulty: 1 },
  { arabic: 'كويس', transliteration: 'kwayyes', ipa: '/kwaj.jes/', english: 'Good', category: 'daily_life', difficulty: 1 },
]);

export const OTHER_ARABIC_VOCAB: VocabWord[] = [
  ...MSA_VOCAB,
  ...MOROCCAN_VOCAB,
  ...TUNISIAN_VOCAB,
  ...LIBYAN_VOCAB,
  ...EGYPTIAN_VOCAB,
  ...LEVANTINE_VOCAB,
  ...PALESTINIAN_VOCAB,
  ...LEBANESE_VOCAB,
  ...SYRIAN_VOCAB,
  ...JORDANIAN_VOCAB,
  ...SAUDI_VOCAB,
  ...GULF_VOCAB,
  ...IRAQI_VOCAB,
  ...SUDANESE_VOCAB,
  ...YEMENI_VOCAB,
];
