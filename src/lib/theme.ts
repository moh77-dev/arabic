// Warm, cultural palette — desert sand, sunset spice, saffron gold and oasis green.
// The whole app themes off these tokens, so shifting them here re-skins every screen.
export const palette = {
  // Primary identity — a warm sunset "spice" (terracotta → saffron), the color of the app.
  spice: {
    50: '#fdf3ea',
    100: '#fbe2cd',
    200: '#f6c39b',
    300: '#f0a066',
    400: '#e97e3b',
    500: '#d9631f',
    600: '#bd4f16',
    700: '#993f16',
    800: '#7c3518',
    900: '#682e18',
  },
  // Saffron gold — rewards, XP, ornament.
  gold: { 400: '#f5cc6a', 500: '#e8a417', 600: '#c9860a' },
  // Turquoise — the traditional zellige/tilework accent (gems, cool pop against the warmth).
  turquoise: { 400: '#4fd0cf', 500: '#17a8a8', 600: '#0d8484' },
  // Oasis green — success / "correct".
  palm: { 400: '#5bbf8a', 500: '#2aa06a', 600: '#158455' },
  // Warm neutrals — sand & parchment in light, roasted espresso at night.
  sand: { 50: '#faf3e8', 100: '#f4e9d6', 200: '#eadbc0', 300: '#dcc7a3' },
  night: { 700: '#2e2216', 800: '#241a11', 900: '#191207', 950: '#120c05' },
  danger: '#d1402f',
  warning: '#e8912a',
} as const;

export interface Theme {
  mode: 'light' | 'dark';
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  primaryText: string;
  accentGold: string;
  accentDiamond: string;
  danger: string;
  /** Soft color washes rendered behind glass panels so blur has something to refract. */
  backdropGradient: readonly [string, string, string];
  glassTint: string;
  glassBorder: string;
  glassHighlight: string;
}

// Light mode is the "daytime majlis": warm parchment ground, brass primary (with dark ink on it),
// zellige-teal accent, deep warm-ink text.
export const lightTheme: Theme = {
  mode: 'light',
  background: '#F4ECDB', // warm parchment
  surface: '#F1E7D2',
  surfaceElevated: '#FFFBF2', // warm off-white — never a cold pure white
  border: '#E7D7B8',
  textPrimary: '#241B10', // deep warm ink
  textSecondary: '#8A7458',
  primary: '#A9781E', // brass
  primaryText: '#2A1E0A', // dark ink reads on brass
  accentGold: palette.gold[500],
  accentDiamond: '#17827A', // zellige teal
  danger: palette.danger,
  backdropGradient: ['#F7EFDD', '#F4ECDB', '#FBF3E2'],
  glassTint: 'rgba(255,251,242,0.6)',
  glassBorder: 'rgba(120,90,30,0.14)',
  glassHighlight: 'rgba(255,252,246,0.9)',
};

// Dark mode is the "lantern-lit majlis" night: deep teal-black ground, brass primary, an amber
// glow, zellige-teal accent, and parchment-bone text.
export const darkTheme: Theme = {
  mode: 'dark',
  background: '#0C1719',
  surface: '#13262B',
  surfaceElevated: '#17323A',
  border: '#26363c',
  textPrimary: '#EFE6D2', // parchment bone
  textSecondary: '#8FA39C', // muted sage
  primary: '#C79A3E', // lantern brass
  primaryText: '#1A1206',
  accentGold: palette.gold[400],
  accentDiamond: '#31A79C', // zellige teal
  danger: '#CE6A5F',
  backdropGradient: ['#0e2226', '#0C1719', '#12262a'],
  glassTint: 'rgba(19,38,43,0.6)',
  glassBorder: 'rgba(239,230,210,0.10)',
  glassHighlight: 'rgba(239,230,210,0.06)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };
