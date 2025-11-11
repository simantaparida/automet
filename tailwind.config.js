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
          DEFAULT: '#EF7722', // Vibrant orange from flag
          50: '#fef4ed',
          100: '#fde7d3',
          200: '#fbcfa5',
          300: '#f8ae6d',
          400: '#f48532',
          500: '#EF7722', // Primary color
          600: '#d95f18',
          700: '#b44815',
          800: '#913818',
          900: '#773116',
          950: '#40170a',
        },
        secondary: {
          DEFAULT: '#FFB84D', // Lighter golden orange (from flag's second stripe)
          50: '#fff9ed',
          100: '#fff2d3',
          200: '#ffe3a5',
          300: '#ffce6d',
          400: '#ffb032',
          500: '#FFB84D', // Lighter orange
          600: '#e6991f',
          700: '#bf7819',
          800: '#995f1a',
          900: '#7c5019',
          950: '#43280a',
        },
        accent: {
          blue: '#3B82F6', // Medium blue from flag (fourth stripe)
          DEFAULT: '#3B82F6',
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
};
