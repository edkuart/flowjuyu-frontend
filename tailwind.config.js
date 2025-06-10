/** @type {import('tailwindcss').Config} */
/* eslint-disable @typescript-eslint/no-require-imports */

module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tw-animate-css") // si sigues usando tw-animate-css
  ],
}
