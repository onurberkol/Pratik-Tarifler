// Brand palette — Warm Terracotta, food-themed
// Used everywhere via theme imports

export const colors = {
  // Brand
  primary: "#E85D04",      // vibrant orange/paprika
  primaryDark: "#9D0208",  // deep red
  accent: "#FAA307",       // saffron gold

  // Neutrals
  cream: "#FFF8E7",
  light: "#F4E8C1",
  dark: "#370617",         // deep burgundy
  charcoal: "#212529",
  gray: "#6C757D",
  grayLight: "#ADB5BD",
  white: "#FFFFFF",
  black: "#000000",

  // Semantic
  success: "#52B788",
  premium: "#9D4EDD",
  danger: "#D62828",
  warning: "#F77F00",
  info: "#4361EE",

  // UI surfaces
  surface: "#FFFFFF",
  background: "#FFF8E7",
  divider: "#F4E8C1",

  // Text
  textPrimary: "#212529",
  textSecondary: "#6C757D",
  textOnPrimary: "#FFFFFF",

  // Match badge colors by score
  matchHigh: "#52B788",   // >= 80
  matchMid: "#FAA307",    // 60-79
  matchLow: "#E85D04",    // < 60
} as const;

export function matchColor(pct: number): string {
  if (pct >= 80) return colors.matchHigh;
  if (pct >= 60) return colors.matchMid;
  return colors.matchLow;
}
