/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
          950: '#052c1c',
        },
        gold: {
          400: '#ffd873',
          500: '#ffc531',
          600: '#f0a80e',
        },
        diamond: {
          400: '#7dd3fc',
          500: '#38bdf8',
          600: '#0ea5e9',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          800: '#1c2029',
          900: '#12151c',
          950: '#0a0c11',
        },
      },
      fontFamily: {
        display: ['CairoBold', 'System'],
        arabic: ['NotoNaskhArabic', 'System'],
        body: ['InterRegular', 'System'],
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
    },
  },
  plugins: [],
};
