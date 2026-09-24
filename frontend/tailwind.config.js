/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F1B33",
          light: "#152447",
          card: "#1B2C4F",
        },
        brand: {
          teal: "#10B981",
          tealDark: "#0D9668",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(60% 50% at 85% 0%, rgba(16,185,129,0.10) 0%, rgba(16,185,129,0) 60%), radial-gradient(40% 40% at 0% 20%, rgba(15,27,51,0.06) 0%, rgba(15,27,51,0) 60%)",
      },
    },
  },
  plugins: [],
};
