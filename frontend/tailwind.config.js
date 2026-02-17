/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fffbf0',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        ink: {
          900: '#0a1410',
          800: '#1a2820',
          700: '#2d3d35',
          600: '#435549',
          500: '#5a6d60',
        },
        sage: {
          50: '#f8faf9',
          100: '#f0f5f2',
          200: '#e4ebe6',
          300: '#d1ddd5',
          400: '#b5c6bb',
          500: '#95a99e',
          600: '#7a8d82',
          700: '#647269',
          800: '#535e56',
          900: '#474f4a',
        },
      },
      fontFamily: {
        display: ['Noto Serif SC', 'Source Han Serif CN', 'Georgia', 'serif'],
        body: ['Inter', 'Noto Sans SC', '-apple-system', 'sans-serif'],
        serif: ['Noto Serif SC', 'Source Han Serif CN', 'Georgia', 'serif'],
        sans: ['Inter', 'Noto Sans SC', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 4px 20px -2px rgba(217, 119, 6, 0.15)',
        'warm-lg': '0 10px 40px -4px rgba(217, 119, 6, 0.2)',
        editorial: '0 1px 3px 0 rgba(10, 20, 16, 0.06), 0 1px 2px 0 rgba(10, 20, 16, 0.04)',
        'editorial-md': '0 4px 6px -1px rgba(10, 20, 16, 0.08), 0 2px 4px -1px rgba(10, 20, 16, 0.04)',
        'editorial-lg': '0 10px 15px -3px rgba(10, 20, 16, 0.08), 0 4px 6px -2px rgba(10, 20, 16, 0.04)',
      },
    },
  },
  plugins: [],
}
