import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          '"Syne Variable"',
          '"Syne"',
          '"Space Grotesk Variable"',
          "sans-serif",
        ],
        serif: [
          '"Space Grotesk Variable"',
          '"Space Grotesk"',
          '"Syne Variable"',
          "sans-serif",
        ],
        sans: ['"Outfit Variable"', "system-ui", "-apple-system", "sans-serif"],
        mono: [
          '"Chakra Petch"',
          '"JetBrains Mono Variable"',
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      colors: {
        void: "#07090D",
        carbon: "#0C1017",
        gunmetal: "#121823",
        steel: "#1A2230",
        bone: "#F4F0E6",
        silver: "#9DA8B8",
        vermilion: {
          DEFAULT: "#FF4D1C",
          hover: "#E03D10",
          soft: "rgba(255, 77, 28, 0.14)",
        },
        gold: {
          DEFAULT: "#E2B45A",
          soft: "rgba(226, 180, 90, 0.14)",
        },
        phosphor: {
          DEFAULT: "#2EE59D",
          soft: "rgba(46, 229, 157, 0.13)",
        },
        paper: {
          DEFAULT: "#090C12",
          elevated: "#101620",
          recessed: "#171F2C",
          deep: "#C5CDD8",
        },
        rule: {
          DEFAULT: "rgba(244, 240, 230, 0.10)",
          strong: "rgba(244, 240, 230, 0.18)",
        },
        obsidian: {
          DEFAULT: "#05070B",
          surface: "#0D121B",
          elevated: "#161E2C",
          rule: "rgba(244, 240, 230, 0.12)",
        },
        ink: {
          DEFAULT: "#F4F0E6",
          secondary: "#A2AEBE",
          muted: "#7D8A9C",
        },
        terracotta: {
          DEFAULT: "#FF4D1C",
          hover: "#E63E10",
          soft: "rgba(255, 77, 28, 0.14)",
        },
        brass: {
          DEFAULT: "#E2B45A",
          light: "#F0CA7D",
        },
        pine: {
          DEFAULT: "#2EE59D",
          soft: "rgba(46, 229, 157, 0.13)",
        },
        ochre: {
          DEFAULT: "#FFB020",
          soft: "rgba(255, 176, 32, 0.14)",
        },
      },
      boxShadow: {
        editorial:
          "0 16px 40px -16px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(244, 240, 230, 0.06)",
        anchor:
          "0 28px 70px -20px rgba(0, 0, 0, 0.85), 0 0 40px -12px rgba(255, 77, 28, 0.22)",
        glow: "0 0 32px -6px rgba(255, 77, 28, 0.45)",
      },
    },
  },
  plugins: [],
} satisfies Config;
