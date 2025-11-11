/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{pages,components,services,types}/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  theme: {
    extend: {
       fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
