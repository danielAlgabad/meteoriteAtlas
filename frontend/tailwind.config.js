/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        space: {
          950: '#030712',
          900: '#060a14',
          800: '#0a0f1f',
          700: '#0d1530',
        },
      },
    },
  },
  plugins: [],
}
