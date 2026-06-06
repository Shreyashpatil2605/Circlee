export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "themeMode";

export function getThemeModeDefault(): ThemeMode {
  // Default to dark mode for premium experience
  return "dark";
}

/**
 * Apple Liquid Glass Design System
 * Premium dark mode color palette with glassmorphic effects
 */
export const LiquidGlassTheme = {
  colors: {
    // Base backgrounds
    background: {
      primary: "#000000",
      secondary: "#0A0A0A",
      tertiary: "#141414",
    },

    // Glass surfaces
    glass: {
      light: "rgba(20,20,20,0.6)",
      medium: "rgba(20,20,20,0.8)",
      dark: "rgba(15,15,15,0.9)",
    },

    // Borders & accents
    border: {
      light: "rgba(255,255,255,0.08)",
      medium: "rgba(255,255,255,0.12)",
      highlight: "rgba(255,255,255,0.15)",
    },

    // Text
    text: {
      primary: "#FFFFFF",
      secondary: "#E5E7EB",
      tertiary: "#9CA3AF",
      disabled: "#6B7280",
    },

    // Accent colors (Apple-inspired)
    accent: {
      blue: "#0A84FF",
      blueLight: "rgba(10,132,255,0.2)",
      white: "#FFFFFF",
      whiteDim: "rgba(255,255,255,0.3)",
    },
  },

  blur: {
    subtle: 15,
    moderate: 30,
    intense: 50,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
