/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07080b',
          900: '#0d1017',
          850: '#121622',
          800: '#171d2c',
          750: '#1d2436',
          700: '#262f44',
          600: '#344059',
        },
        brand: {
          orange: '#ff6a00',
          'orange-hover': '#ff5100',
          amber: '#ff9100',
          gold: '#ffb703',
          glow: 'rgba(255, 106, 0, 0.45)',
        }
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px rgba(255, 106, 0, 0.35)',
        'glow-orange-sm': '0 0 12px rgba(255, 106, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
