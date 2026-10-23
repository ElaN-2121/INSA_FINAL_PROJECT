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
          accent: '#16A34A',
          'accent-dark': '#15803D',
          'accent-light': '#F0FDF4',
          'accent-border': '#BBF7D0',
        },
      },
    },
  },
  plugins: [],
};
