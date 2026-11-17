import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        accent: colors.emerald,
        warn: colors.amber,
        danger: colors.rose,
      },
    },
  },
  plugins: [],
};

export default config;
