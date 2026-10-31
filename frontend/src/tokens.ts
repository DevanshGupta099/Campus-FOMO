export const colors = {
  void: "#080808",
  surface: {
    DEFAULT: "#111111",
    2: "#1a1a1a",
    3: "#222222",
  },
  violet: {
    light: "#a78bfa",
    500: "#7c3aed",
    dim: "#4c1d95",
  },
  rose: {
    light: "#fb7185",
    500: "#f43f5e",
  },
  mint: {
    light: "#34d399",
    500: "#10b981",
  },
  amber: {
    light: "#fbbf24",
    500: "#f59e0b",
  },
  sky: {
    light: "#38bdf8",
    500: "#0ea5e9",
  },
  // Backwards compatibility tokens
  ink: {
    950: "#080808",
    900: "#111111",
    800: "#1a1a1a",
    700: "#222222",
    600: "#2a2a2a",
  },
  royal: {
    700: "#5b21b6",
    500: "#7c3aed",
    300: "#a78bfa",
    100: "#ede9fe",
  },
  gold: {
    600: "#d97706",
    400: "#fbbf24",
    200: "#fde68a",
  },
  ember: {
    600: "#e11d48",
    500: "#f43f5e",
    300: "#fda4af",
  },
  paper: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
  },
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const fonts = {
  display: "Geist, system-ui, sans-serif",
  body: "Geist, system-ui, sans-serif",
  mono: "Geist Mono Variable, Geist Mono, monospace",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;
