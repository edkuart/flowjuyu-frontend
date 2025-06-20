/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',                      
  content: [
    './src/app/**/*.{ts,tsx,mdx}',       
    './src/components/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',        
    './src/stories/**/*.{ts,tsx,mdx}',      
  ],
  theme: {
    container: {                            
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary:   'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent:    'rgb(var(--color-accent) / <alpha-value>)',
        neutral:   'rgb(var(--color-neutral) / <alpha-value>)',
      },

      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
      },

      borderRadius: {
        '2xl': '1rem',
      },
    },
  },

  plugins: [
    require('@tailwindcss/aspect-ratio'),   
    require('tailwindcss-animate'),       
    require('@tailwindcss/container-queries'), 
  ],

  safelist: [
    {
      pattern: /^(bg|text|border)-(primary|secondary|accent|neutral)(-(50|100|200|300|400|500|600|700|800|900))?$/,
      variants: ['hover', 'dark'],
    },
  ],
};
