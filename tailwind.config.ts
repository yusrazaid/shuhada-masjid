import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: "#12372A",
        "forest-deep": "#0B261C",
        gold: "#B4914C",
        parchment: "#F8F6EF",
        ink: "#17231D",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
        serif: ["var(--font-amiri)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(18, 55, 42, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
