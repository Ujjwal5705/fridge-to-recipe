/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f6f3e7",
        ink: "#2b2b25",
        sage: { DEFAULT: "#5b6b4e", dark: "#46543d" },
        butter: "#e8b23d",
        brick: "#b0472e",
        line: "#ded7c2",
      },
    },
  },
  plugins: [],
};
