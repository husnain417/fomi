"use client";

import { useEffect, useState, useCallback } from "react";

/** Cmd/Ctrl+K toggles; Esc closes. Ignores the shortcut while a text input
 * has focus and the key isn't the palette combo itself, so it never
 * hijacks normal typing in the composer or inline-rename fields. */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    function onKeyDown(e) {
      const isPaletteCombo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isPaletteCombo) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, close, toggle, setOpen };
}

/**
 * Minimal subsequence-based fuzzy match: every character of `query` must
 * appear in order within `text`. Score rewards contiguous runs and early
 * matches so "cmp" beats "compare" less than "comp" would, without pulling
 * in a dependency for something this small.
 */
export function fuzzyScore(query, text) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  let score = 0;
  let streak = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti += 1) {
    if (t[ti] === q[qi]) {
      qi += 1;
      streak += 1;
      score += 1 + streak * 0.5;
    } else {
      streak = 0;
    }
  }
  if (qi < q.length) return -1; // not all characters matched
  if (t.startsWith(q)) score += 5;
  return score;
}

export function fuzzyFilter(query, items, getText) {
  if (!query.trim()) return items;
  return items
    .map((item) => ({ item, score: fuzzyScore(query, getText(item)) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
