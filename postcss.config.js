// postcss.config.js
/** @type {import('postcss').Config} */
// autoprefixer removed: @tailwindcss/postcss (Tailwind v4) handles vendor
// prefixes internally. Running both causes false-positive gradient warnings
// because autoprefixer misidentifies the `in oklab` color-space syntax.
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}