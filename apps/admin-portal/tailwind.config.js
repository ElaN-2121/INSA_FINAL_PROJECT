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
          accent: '#334155',
          'accent-dark': '#1E293B',
          'accent-light': '#F8FAFC',
          'accent-border': '#CBD5E1',
        },
      },
    },
  },
  plugins: [],
};
