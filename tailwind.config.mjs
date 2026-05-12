/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
