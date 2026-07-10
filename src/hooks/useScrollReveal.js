"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once, the first time the element scrolls into view — after that it
 * stays visible even if the user scrolls back past it. That one-way switch
 * is deliberate: re-triggering every time an element re-enters the
 * viewport reads as flickery on scroll-jumpy trackpads, and there's no
 * information lost by not replaying it.
 */
export function useScrollReveal({
  threshold = 0.2,
  rootMargin = "0px 0px -10% 0px",
} = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver (very old browser) — just show it, don't
    // block content behind a feature that isn't there.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, visible };
}
