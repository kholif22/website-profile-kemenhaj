/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          dark: '#B88A24',
          light: '#F5C542',
        },
        plhut: {
          black: '#171717',
          bg: '#F8F7F2',
          border: '#E8E3D5',
          'text-primary': '#222222',
          'text-secondary': '#6B6B6B',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
