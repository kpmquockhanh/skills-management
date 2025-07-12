/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.{html,js}',
    "./src/**/*.js",
    "./src/**/*.vue",
  ],
  theme: {
    extend: {
      screens: {
        'hover-hover': { 'raw': '(hover: hover)' },
      }
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"],
  },
}

