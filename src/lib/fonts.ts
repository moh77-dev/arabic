/**
 * Arabic type roles. Reem Kufi (geometric, architectural — echoes tilework and monuments) is the
 * display face for the wordmark, greetings and hero phrases; Noto Naskh Arabic is the readable body
 * face for running Arabic (conversation, exercise prompts).
 *
 * NOTE: when a specific fontFamily is set, React Native ignores `fontWeight` — pick the weighted
 * family directly (e.g. `fonts.arabicDisplayBold`) instead of setting fontWeight.
 */
export const fonts = {
  arabicDisplay: 'ReemKufi_600SemiBold',
  arabicDisplayBold: 'ReemKufi_700Bold',
  arabicBody: 'NotoNaskhArabic_400Regular',
  arabicBodyBold: 'NotoNaskhArabic_700Bold',
} as const;
