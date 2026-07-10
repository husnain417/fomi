"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

/**
 * Wrap anything in this to have it fade + rise into place the first time
 * it scrolls into view. `delay` (ms) lets a group of these stagger instead
 * of firing in lockstep — pass i * 90 or similar when mapping a list.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}) {
  const { ref, visible } = useScrollReveal();

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
