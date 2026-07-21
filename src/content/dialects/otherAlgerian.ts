import type { VocabWord } from '@/types';

/** Starter vocabulary for Algiers Arabic (El Oued has its own deep set in eloued.ts). */

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

export const OTHER_ALGERIAN_VOCAB: VocabWord[] = [...ALGIERS_VOCAB];
