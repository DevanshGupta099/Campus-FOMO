import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "var(--ink-950, #050B1F)",
          800: "var(--ink-800, #0B1F4D)",
        },
        royal: {
          500: "var(--royal-500, #1E4FD8)",
          300: "var(--royal-300, #6E93FF)",
        },
        gold: {
          400: "var(--gold-400, #F2B705)",
        },
        ember: {
          500: "var(--ember-500, #FF5A3C)",
        },
        mint: {
          400: "var(--mint-400, #3EE6B0)",
        },
        paper: {
          50: "var(--paper-50, #F6F8FF)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
