"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_KEY, applyTheme } from "@/lib/theme";

/**
 * Theme state lives on <html class="dark"> (set synchronously pre-hydration
 * by the inline script in layout.js), so on mount we just read it back —
 * no flash, no mismatch. Explicit user choices are persisted to
 * localStorage; until a choice is made, the app keeps following the OS
 * theme live.
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const setTheme = useCallback((next) => {
    applyTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Report "light" until mounted so any server-rendered icon/label matches
  // the client's first paint, then reconcile in the same tick as `mounted`.
  return { theme: mounted ? theme : "light", toggleTheme, mounted };
}
