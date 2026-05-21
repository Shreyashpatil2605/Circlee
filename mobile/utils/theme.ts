export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "themeMode";

export function getThemeModeDefault(): ThemeMode {
  // Keep default simple; if you want system preference later, wire it here.
  return "light";
}

