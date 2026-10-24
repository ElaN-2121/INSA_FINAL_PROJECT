import preset from '../../packages/ui/tailwind-preset.js';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
    '../../packages/ui/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        portal: {
          accent: '#D97706',
          'accent-dark': '#B45309',
          'accent-light': '#FFFBEB',
          'accent-border': '#FDE68A',
        },
      },
    },
  },
  plugins: [],
};
