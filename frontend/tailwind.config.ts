import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          '"Bricolage Grotesque Variable"',
          '"Plus Jakarta Sans Variable"',
          "system-ui",
          "sans-serif",
        ],
        editorial: [
          '"Instrument Serif"',
          "Georgia",
          "Times New Roman",
          "serif",
        ],
        serif: [
          '"Bricolage Grotesque Variable"',
          '"Plus Jakarta Sans Variable"',
          "system-ui",
          "sans-serif",
        ],
        sans: [
          '"Plus Jakarta Sans Variable"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          '"IBM Plex Mono"',
          '"JetBrains Mono Variable"',
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      colors: {
        void: "#06080C",
        carbon: "#0B0F17",
        gunmetal: "#111723",
        steel: "#182030",
        bone: "#F5F2EB",
        silver: "#9BA6B8",
        vermilion: {
          DEFAULT: "#FF5224",
          hover: "#E44318",
          soft: "rgba(255, 82, 36, 0.12)",
        },
        gold: {
          DEFAULT: "#E5BA6B",
          soft: "rgba(229, 186, 107, 0.12)",
        },
        phosphor: {
          DEFAULT: "#34D399",
          soft: "rgba(52, 211, 153, 0.12)",
        },
        paper: {
          DEFAULT: "#080B11",
          elevated: "#0E131D",
          recessed: "#151C2A",
          deep: "#C8D0DC",
        },
        rule: {
          DEFAULT: "rgba(245, 242, 235, 0.085)",
          strong: "rgba(245, 242, 235, 0.15)",
        },
        obsidian: {
          DEFAULT: "#05070B",
          surface: "#0C1018",
          elevated: "#141B28",
          rule: "rgba(245, 242, 235, 0.10)",
        },
        ink: {
          DEFAULT: "#F5F2EB",
          secondary: "#A5B0C2",
          muted: "#768396",
        },
        terracotta: {
          DEFAULT: "#FF5224",
          hover: "#E44318",
          soft: "rgba(255, 82, 36, 0.12)",
        },
        brass: {
          DEFAULT: "#E5BA6B",
          light: "#F2CF8D",
        },
        pine: {
          DEFAULT: "#34D399",
          soft: "rgba(52, 211, 153, 0.12)",
        },
        ochre: {
          DEFAULT: "#F59E0B",
          soft: "rgba(245, 158, 11, 0.13)",
        },
      },
      boxShadow: {
        editorial:
          "0 20px 50px -20px rgba(0, 0, 0, 0.72), inset 0 1px 0 0 rgba(255, 255, 255, 0.07)",
        anchor:
          "0 36px 90px -24px rgba(0, 0, 0, 0.9), 0 0 60px -20px rgba(229, 186, 107, 0.16)",
        glow: "0 10px 30px -8px rgba(255, 82, 36, 0.42)",
      },
    },
  },
  plugins: [],
} satisfies Config;
