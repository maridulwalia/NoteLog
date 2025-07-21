/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // 👈 Enables dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // 👈 Add modern font
      },
      colors: {
        primary: {
          DEFAULT: '#6366f1', // indigo-500
          dark: '#4f46e5',
        },
        accent: '#facc15', // yellow-400
      },
      boxShadow: {
        card: '0 10px 25px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
