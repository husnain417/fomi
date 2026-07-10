"use client";

import { PenLine, Sparkles, Download } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const STEPS = [
  {
    icon: PenLine,
    title: "Describe it",
    copy: "Type what you want to see — subject, mood, style, aspect ratio.",
  },
  {
    icon: Sparkles,
    title: "Generate",
    copy: "Fomi renders a set of options in seconds, ready to compare.",
  },
  {
    icon: Download,
    title: "Refine & export",
    copy: "Pick a favorite, tweak it, then download or send it to your next tool.",
  },
];

export default function HowItWorks() {
  // Watching the whole section (rather than wrapping each step in its own
  // Reveal) so the connecting line and the three steps animate off one
  // shared "visible" flag instead of drifting out of sync with each other.
  const { ref, visible } = useScrollReveal({ threshold: 0.3 });

  return (
    <section
      ref={ref}
      aria-labelledby="how-it-works-heading"
      className="py-16 sm:py-20"
    >
      <div className="max-w-xl mx-auto text-center mb-14 px-4">
        <p className="text-sm font-medium text-accent-dark mb-2 tracking-wide uppercase">
          How it works
        </p>
        <h2
          id="how-it-works-heading"
          className="font-display text-2xl sm:text-3xl font-semibold text-ink"
        >
          From prompt to finished asset
        </h2>
      </div>

      <div className="relative max-w-4xl mx-auto px-4">
        <div
          aria-hidden="true"
          className="hidden sm:block absolute left-[16.5%] right-[16.5%] top-6 h-[2px] bg-border overflow-hidden"
        >
          <div
            className="h-full w-full bg-accent origin-left transition-transform duration-[1200ms] ease-out"
            style={{ transform: visible ? "scaleX(1)" : "scaleX(0)" }}
          />
        </div>

        <ol className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 list-none">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className={`relative flex flex-col items-center text-center transition-all duration-700 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: visible ? `${300 + i * 200}ms` : "0ms" }}
            >
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-md mb-4">
                <step.icon size={19} strokeWidth={1.9} />
              </span>
              <h3 className="font-display font-semibold text-ink mb-1.5">
                {i + 1}. {step.title}
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed max-w-[220px]">
                {step.copy}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
