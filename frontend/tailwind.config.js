/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(148, 163, 184, 0.12), 0 24px 60px rgba(0, 0, 0, 0.6)'
      },
      colors: {
        surface: {
          900: '#0a0a0c',
          800: '#121215',
          700: '#1a1a20'
        },
        slate: {
          950: '#0a0a0c',
          900: '#121215',
          800: '#1a1b20',
          700: '#262830',
          600: '#3d404d',
          500: '#616575',
          400: '#9094a6',
          300: '#c4c7d5',
          200: '#e2e4ed',
          100: '#f1f2f6',
          50: '#f8f9fa'
        }
      },
      fontFamily: {
        sans: ['Segoe UI Variable', 'Segoe UI', 'sans-serif'],
        display: ['Trebuchet MS', 'Segoe UI', 'sans-serif'],
        mono: ['Consolas', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  },
  plugins: []
};
