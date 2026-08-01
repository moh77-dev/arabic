/**
 * Arabic type roles.
 *
 * The custom Arabic display/body faces (Reem Kufi + Noto Naskh Arabic) were part of the "majlis"
 * look, which has been rolled back. These now resolve to `undefined` so every `fontFamily: fonts.*`
 * reference falls back to the system font — undoing the display-font sweep app-wide without touching
 * each screen. Re-point these to loaded font-family names to bring custom Arabic type back.
 */
export const fonts = {
  arabicDisplay: undefined,
  arabicDisplayBold: undefined,
  arabicBody: undefined,
  arabicBodyBold: undefined,
} as const;
