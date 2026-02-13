// postcss.config.js
/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},   // ⬅️ nombre correcto
    autoprefixer: {},
  },
}