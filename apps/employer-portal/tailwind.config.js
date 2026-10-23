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
          accent: '#0D9488',
          'accent-dark': '#0F766E',
          'accent-light': '#F0FDFA',
          'accent-border': '#99F6E4',
        },
      },
    },
  },
  plugins: [],
};
