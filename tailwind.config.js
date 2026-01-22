/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'Inter var', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Editorial scale
        'display': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'heading': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
      },
      colors: {
        'primary': {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#4338ca',  // Main accent
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        'coral': '#FF6B6B',
        'teal': '#4ECDC4',
        'surface': {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-light': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
        'glass-dark': 'linear-gradient(to bottom right, rgba(23, 23, 23, 0.9), rgba(23, 23, 23, 0.7))',
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
      },
    },
  },
};