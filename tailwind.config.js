/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx}",
    "./src/context/**/*.{js,ts,jsx,tsx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
    "./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      /* ======================================================
         🎨 FLOWJUYU DESIGN SYSTEM
      ====================================================== */
      colors: {
        /* ---- Mantener compatibilidad con sistema actual ---- */
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        neutral: "rgb(var(--color-neutral) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",

        /* ---- Nueva capa oficial Flowjuyu ---- */
        flow: {
          bg: "#f8f5ef",           // Fondo principal público
          bgSoft: "#f3f1eb",       // Fondo panel vendedor
          card: "#ffffff",         // Cards limpias
          text: "#171717",         // Texto principal
          muted: "#6b7280",        // Texto secundario
          accent: "#f59e0b",       // Ámbar principal
          accentHover: "#d97706",  // Hover ámbar
          accentSoft: "#fef3c7",   // Fondo suave ámbar
          accentText: "#92400e",   // Texto sobre accentSoft
          border: "#e5e3dc",       // Bordes suaves artesanales
        },
      },

      spacing: {
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
      },

      borderRadius: {
        "2xl": "1rem",
      },

      boxShadow: {
        flow: "0 10px 30px rgba(0,0,0,0.05)",
        flowSoft: "0 4px 12px rgba(0,0,0,0.04)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)"    },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)"    },
        },
        "number-pop": {
          "0%":   { transform: "scale(0.85)", opacity: "0"   },
          "60%":  { transform: "scale(1.05)"                 },
          "100%": { transform: "scale(1)",    opacity: "1"   },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-up":        "fade-up 0.4s ease-out both",
        "fade-in":        "fade-in 0.35s ease-out both",
        "scale-in":       "scale-in 0.3s ease-out both",
        "number-pop":     "number-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      },
    },
  },

  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/container-queries"),
    require("tailwindcss-animate"),
  ],

  safelist: [
    {
      pattern:
        /^(bg|text|border)-(primary|secondary|accent|neutral)(-(50|100|200|300|400|500|600|700|800|900))?$/,
      variants: ["hover", "dark"],
    },
  ],
};
