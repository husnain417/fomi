"use client";

import { useLayoutEffect } from "react";
import { THEME_KEY, getStoredTheme } from "@/lib/theme";

/**
 * The SSR script in studio/layout.js handles hard loads/reloads of
 * /studio. This covers the client-side-navigation case (e.g. clicking a
 * link from `/` into `/studio` without a full reload), where an injected
 * <script> tag never actually executes. Runs in useLayoutEffect so it
 * applies before the browser paints the new route.
 *
 * Only ever touches the *visual* class, never localStorage — an unset
 * preference should stay unset. On unmount, if the person still hasn't
 * made an explicit choice, it hands the class back to whatever the rest
 * of the app (the homepage's light default) expects, so navigating away
 * doesn't leave the whole app stuck in the studio's forced dark mode.
 */
export function useStudioThemeInit() {
  useLayoutEffect(() => {
    const stored = getStoredTheme();
    const root = document.documentElement;

    if (stored) return; // explicit choice already made — respect it, do nothing

    root.classList.add("dark");
    root.style.colorScheme = "dark";

    return () => {
      if (getStoredTheme()) return; // a choice was made while in the studio
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    };
  }, []);
}
