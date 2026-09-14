import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f0ff',
          100: '#e4e2fe',
          200: '#cbc6fd',
          300: '#aca3fb',
          400: '#8f7ff8',
          500: '#6a5af5', // primary indigo, matches Influply logo mark
          600: '#5a45e8',
          700: '#4c37cc',
          800: '#3f2fa5',
          900: '#352b83'
        },
        accent: {
          400: '#b9a6ff',
          500: '#a78bfa' // lighter violet from the logo's second figure
        },
        ink: {
          900: '#14121f',
          700: '#3a374d',
          500: '#6b6880',
          300: '#a7a4b8',
          100: '#e9e7f2'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20, 18, 31, 0.04), 0 8px 24px rgba(20, 18, 31, 0.06)'
      }
    }
  },
  plugins: []
};

export default config;
