export const palette = {
  brand: {
    50: '#eefdf4',
    100: '#d6fae3',
    200: '#b0f3cb',
    300: '#7ce7ab',
    400: '#42d386',
    500: '#1ab86a',
    600: '#0f9a56',
    700: '#0f7a47',
    800: '#11603b',
    900: '#0f4f33',
  },
  gold: { 400: '#ffd873', 500: '#ffc531', 600: '#f0a80e' },
  diamond: { 400: '#7dd3fc', 500: '#38bdf8', 600: '#0ea5e9' },
  ink: { 50: '#f6f7f9', 100: '#eceef2', 800: '#1c2029', 900: '#12151c', 950: '#0a0c11' },
  danger: '#f0473e',
  warning: '#f5a524',
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
}

export const lightTheme: Theme = {
  mode: 'light',
  background: '#ffffff',
  surface: palette.ink[50],
  surfaceElevated: '#ffffff',
  border: '#e4e6eb',
  textPrimary: palette.ink[900],
  textSecondary: '#6b7280',
  primary: palette.brand[600],
  primaryText: '#ffffff',
  accentGold: palette.gold[500],
  accentDiamond: palette.diamond[500],
  danger: palette.danger,
};

export const darkTheme: Theme = {
  mode: 'dark',
  background: palette.ink[950],
  surface: palette.ink[900],
  surfaceElevated: palette.ink[800],
  border: '#262b36',
  textPrimary: '#f5f6f8',
  textSecondary: '#9aa1ae',
  primary: palette.brand[500],
  primaryText: '#04140c',
  accentGold: palette.gold[500],
  accentDiamond: palette.diamond[500],
  danger: '#ff6b62',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };
