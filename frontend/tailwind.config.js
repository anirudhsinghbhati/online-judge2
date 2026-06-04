/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(148, 163, 184, 0.18), 0 24px 60px rgba(15, 23, 42, 0.45)'
      },
      colors: {
        surface: {
          900: '#07111f',
          800: '#0b1628',
          700: '#13253f'
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
