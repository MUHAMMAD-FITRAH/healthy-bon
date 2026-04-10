/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        forest: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d", 950: "#052e16" },
        health: { green: "#00C853", teal: "#00897B", amber: "#FF8F00", red: "#D32F2F" },
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
        mono: ["DM Mono", "Consolas", "monospace"],
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
