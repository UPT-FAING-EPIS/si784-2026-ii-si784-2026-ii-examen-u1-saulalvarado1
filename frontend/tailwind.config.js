/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#e11d48',
          gold: '#f59e0b',
          vip: '#8b5cf6'
        }
      }
    },
  },
  plugins: [],
}
