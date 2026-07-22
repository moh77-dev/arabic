import type { DialectId } from '@/types';

/**
 * "Anis" (أنيس — "the friendly companion") is the app's AI tutor persona. He is NOT tied to one
 * dialect: he greets and teaches in whichever dialect the learner is currently studying, so the
 * Ask hub reads correctly whether you're on El Oued, Egyptian, or Levantine.
 */
export const GUIDE_NAME = 'Anis';
export const GUIDE_GLYPH = 'أ';

interface Greeting {
  arabic: string;
  english: string;
}

/** "What shall we learn today?" rendered in each dialect (grouped by the closest regional variety). */
const GUIDE_GREETINGS: Record<DialectId, Greeting> = {
  msa: { arabic: 'ماذا نتعلّم اليوم؟', english: 'What shall we learn today?' },
  algerian_algiers: { arabic: 'واش نقرّاو اليوم؟', english: 'What shall we learn today?' },
  algerian_eloued: { arabic: 'واش نعلّموك اليوم؟', english: 'What shall we learn today?' },
  moroccan: { arabic: 'شنو غادي نقراو اليوم؟', english: 'What shall we learn today?' },
  tunisian: { arabic: 'شنوّة نتعلّمو اليوم؟', english: 'What shall we learn today?' },
  libyan: { arabic: 'شن نتعلّمو اليوم؟', english: 'What shall we learn today?' },
  egyptian: { arabic: 'نتعلّم إيه النهارده؟', english: 'What shall we learn today?' },
  levantine: { arabic: 'شو بدنا نتعلّم اليوم؟', english: 'What shall we learn today?' },
  palestinian: { arabic: 'شو بدنا نتعلّم اليوم؟', english: 'What shall we learn today?' },
  lebanese: { arabic: 'شو رح نتعلّم اليوم؟', english: 'What shall we learn today?' },
  syrian: { arabic: 'شو بدنا نتعلّم اليوم؟', english: 'What shall we learn today?' },
  jordanian: { arabic: 'شو بدنا نتعلّم اليوم؟', english: 'What shall we learn today?' },
  saudi: { arabic: 'وش نتعلّم اليوم؟', english: 'What shall we learn today?' },
  gulf: { arabic: 'شنو نتعلّم اليوم؟', english: 'What shall we learn today?' },
  iraqi: { arabic: 'شنو راح نتعلّم اليوم؟', english: 'What shall we learn today?' },
  sudanese: { arabic: 'شنو نتعلّم اليوم؟', english: 'What shall we learn today?' },
  yemeni: { arabic: 'شو نتعلّم اليوم؟', english: 'What shall we learn today?' },
};

export function getGuideGreeting(dialectId: DialectId): Greeting {
  return GUIDE_GREETINGS[dialectId] ?? GUIDE_GREETINGS.msa;
}
