/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4FA',
          100: '#DBE5F3',
          200: '#B9CCE7',
          300: '#8FAFD7',
          400: '#5F8EC4',
          500: '#3B6FAF',
          600: '#255594',
          700: '#1C4276',
          800: '#16345E',
          900: '#0F274A',
          950: '#081528',
        },
        brand: {
          DEFAULT: '#16345E',
          dark: '#0F274A',
          deep: '#081528',
          light: '#255594',
          tint: '#F0F4FA',
        },
        ethio: {
          green: {
            DEFAULT: '#16A34A',
            dark: '#15803D',
            light: '#22C55E',
            surface: '#F0FDF4',
            border: '#BBF7D0',
          },
          gold: {
            DEFAULT: '#D97706',
            dark: '#B45309',
            light: '#F59E0B',
            surface: '#FFFBEB',
            border: '#FDE68A',
          },
          red: {
            DEFAULT: '#DC2626',
            dark: '#B91C1C',
            light: '#EF4444',
            surface: '#FEF2F2',
            border: '#FECACA',
          },
        },
        status: {
          success: {
            text: '#15803D',
            bg: '#F0FDF4',
            border: '#BBF7D0',
          },
          warning: {
            text: '#B45309',
            bg: '#FFFBEB',
            border: '#FDE68A',
          },
          danger: {
            text: '#B91C1C',
            bg: '#FEF2F2',
            border: '#FECACA',
          },
          info: {
            text: '#1D4ED8',
            bg: '#EFF6FF',
            border: '#BFDBFE',
          },
        },
      },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          'Inter',
          '"Noto Sans Ethiopic"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        display: [
          '"Plus Jakarta Sans Variable"',
          '"Plus Jakarta Sans"',
          'Inter',
          '"Noto Sans Ethiopic"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(15, 39, 74, 0.05), 0 1px 4px -1px rgba(15, 39, 74, 0.03)',
        card: '0 4px 16px -4px rgba(15, 39, 74, 0.08), 0 2px 6px -2px rgba(15, 39, 74, 0.04)',
        hover: '0 8px 24px -4px rgba(15, 39, 74, 0.12), 0 4px 8px -2px rgba(15, 39, 74, 0.06)',
        certificate: '0 16px 40px -12px rgba(15, 39, 74, 0.16), 0 6px 16px -4px rgba(15, 39, 74, 0.08)',
        modal: '0 24px 48px -12px rgba(8, 21, 40, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
