export const THEME_KEY = "fomi-theme";
export const THEMES = ["light", "dark"];

/**
 * Inline, dependency-free script string. Injected into <head> via
 * dangerouslySetInnerHTML so it runs and paints *before* React hydrates —
 * this is what prevents the light-mode flash (FOUC) for returning dark-mode
 * users, and keeps the server-rendered class in sync with the client so
 * React never sees a hydration mismatch on <html>.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_KEY)});
    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    var root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export function getStoredTheme() {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(THEME_KEY);
  return THEMES.includes(stored) ? stored : null;
}

export function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Applies a theme to the document without touching React state. */
export function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}
