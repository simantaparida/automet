/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: '1rem',
      },
      colors: {
        primary: {
          DEFAULT: '#450693',
          50: '#f5f0ff',
          100: '#ede0ff',
          200: '#dcc7ff',
          300: '#c4a3ff',
          400: '#a571ff',
          500: '#8C00FF',
          600: '#7a00e6',
          700: '#6600cc',
          800: '#5400a6',
          900: '#450693',
          950: '#2a0059',
        },
        secondary: {
          DEFAULT: '#8C00FF',
          50: '#f5f0ff',
          100: '#ede0ff',
          200: '#dcc7ff',
          300: '#c4a3ff',
          400: '#a571ff',
          500: '#8C00FF',
          600: '#7a00e6',
          700: '#6600cc',
          800: '#5400a6',
          900: '#450693',
        },
        accent: {
          pink: '#FF3F7F',
          yellow: '#FFC400',
          DEFAULT: '#FF3F7F',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
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
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
