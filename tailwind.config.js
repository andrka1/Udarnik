/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["'Manrope'", "Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dce8ff",
          200: "#b9d2ff",
          300: "#8eb3ff",
          400: "#5e8eff",
          500: "#3b6bff",
          600: "#2a4ee6",
          700: "#233db4",
          800: "#1f348f",
          900: "#1c2f74",
        },
        accent: {
          400: "#ff8a65",
          500: "#ff6f4d",
          600: "#e85a3a",
        },
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(59, 107, 255, 0.25)",
        card: "0 8px 24px -8px rgba(15, 23, 42, 0.18)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pop": "pop 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.95)" },
          "60%": { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
