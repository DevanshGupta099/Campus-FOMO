export const colors = {
  ink: {
    950: "#050B1F", // Deep night background
    900: "#071536",
    800: "#0B1F4D", // Panels, cards
    700: "#132B66",
    600: "#1D3B82",
  },
  royal: {
    700: "#133BA6",
    500: "#1E4FD8", // Primary university blue
    300: "#6E93FF", // Links, glows
    100: "#D6E2FF",
  },
  gold: {
    600: "#C79402",
    400: "#F2B705", // Accent, XP, CTAs, last seats
    200: "#FCE788",
  },
  ember: {
    600: "#D93E20",
    500: "#FF5A3C", // Urgency / FOMO
    300: "#FFA08E",
  },
  mint: {
    600: "#26B386",
    400: "#3EE6B0", // Success, confirmed
    200: "#B5F7DF",
  },
  paper: {
    50: "#F6F8FF", // Text on dark, light-panel background
    100: "#EDF1FC",
    200: "#DDE4F8",
  },
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const fonts = {
  display: "Unbounded, sans-serif",
  body: "Inter, system-ui, -apple-system, sans-serif",
  mono: "JetBrains Mono, monospace",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const cssVariables = `
:root {
  --ink-950: ${colors.ink[950]};
  --ink-800: ${colors.ink[800]};
  --royal-500: ${colors.royal[500]};
  --royal-300: ${colors.royal[300]};
  --gold-400: ${colors.gold[400]};
  --ember-500: ${colors.ember[500]};
  --mint-400: ${colors.mint[400]};
  --paper-50: ${colors.paper[50]};
  --font-display: ${fonts.display};
  --font-body: ${fonts.body};
}
`;
