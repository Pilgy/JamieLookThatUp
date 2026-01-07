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
      colors: {
        'night': {
          50: '#FDF8F6',
          100: '#F9EBE8',
          200: '#F2D5D0',
          300: '#E9BAB3',
          400: '#D99A91',
          500: '#C67A70',
          600: '#B35A4F',
          700: '#8C463D',
          800: '#66332C',
          900: '#3F201B',
        },
        'accent': {
          from: '#FF6B6B',
          via: '#4ECDC4',
          to: '#45B7D1',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-light': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
        'glass-dark': 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.6))',
        'accent-gradient': 'linear-gradient(45deg, var(--accent-from), var(--accent-via), var(--accent-to))',
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
      },
      transitionDuration: {
        '400': '400ms',
      },
      transitionTimingFunction: {
        'theme': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'spring': 'spring 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        spring: {
          '0%': {
            transform: 'scale(0.95)',
          },
          '50%': {
            transform: 'scale(1.05)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
      },
    },
  },
};