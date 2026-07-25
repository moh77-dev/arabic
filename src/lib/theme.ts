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

export const lightTheme: Theme = {
  mode: 'light',
  background: palette.sand[50],
  surface: palette.sand[100],
  surfaceElevated: '#fffaf1', // warm off-white — never a cold pure white
  border: '#ecdcc2',
  textPrimary: '#3a2a17', // deep espresso ink, warmer than black
  textSecondary: '#8a7355',
  primary: palette.spice[600],
  primaryText: '#fff8ef',
  accentGold: palette.gold[500],
  accentDiamond: palette.turquoise[500],
  danger: palette.danger,
  backdropGradient: ['#fbeede', '#f8ecdf', '#fdf3e0'],
  glassTint: 'rgba(255,250,242,0.55)',
  glassBorder: 'rgba(255,244,228,0.70)',
  glassHighlight: 'rgba(255,252,246,0.9)',
};

export const darkTheme: Theme = {
  mode: 'dark',
  background: palette.night[950],
  surface: palette.night[900],
  surfaceElevated: palette.night[700],
  border: '#3a2c1b',
  textPrimary: '#f7ecd9', // warm parchment
  textSecondary: '#b39b78',
  primary: palette.spice[400],
  primaryText: '#1a0e05',
  accentGold: palette.gold[400],
  accentDiamond: palette.turquoise[400],
  danger: '#ef6a52',
  backdropGradient: ['#1a1109', '#17110b', '#211509'],
  glassTint: 'rgba(38,28,17,0.55)',
  glassBorder: 'rgba(255,225,180,0.10)',
  glassHighlight: 'rgba(255,235,200,0.07)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };
