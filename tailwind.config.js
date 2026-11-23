/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#151515',
          dark: '#0D0D0D',
          light: '#222222',
        },
        noir: {
          DEFAULT: '#090909',
          900: '#090909',
          800: '#121212',
          700: '#1E1E1E',
          600: '#2A2A2A',
        },
        champagne: {
          DEFAULT: '#C5A46D',
          light: '#D4BB8E',
          dark: '#A6854F',
          muted: '#C5A46D20',
        },
        offwhite: {
          DEFAULT: '#F7F7F5',
          light: '#FAFAF9',
          dark: '#EEEEEB',
        },
        neutralgrey: {
          DEFAULT: '#858585',
          light: '#A3A3A3',
          dark: '#525252',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.15em',
        refined: '0.05em',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        elevated: '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
