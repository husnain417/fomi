"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { seededPhoto } from "@/data/mockData";
import Reveal from "./Reveal";

const TOP_PICKS = [
  {
    title: "BACKGROUND REPLACEMENT",
    copy: "Swap out flat backgrounds for cinematic environments or studio setups instantly.",
    seed: "bg-after",
    beforeSeed: "bg-before",
  },
  {
    title: "IMAGE RESTORATION",
    copy: "Breathe life back into old or blurry photos, restoring clarity and color.",
    seed: "restored",
    beforeSeed: "damaged",
  },
  {
    title: "OUTFIT REPLACEMENT",
    copy: "Change clothing styles, colors, or textures while maintaining perfect lighting.",
    seed: "outfit-after",
    beforeSeed: "outfit-before",
  },
  {
    title: "HAIR REPLACEMENT",
    copy: "Experiment with haircuts, volumes, and natural shades seamlessly.",
    seed: "hair-after",
    beforeSeed: "hair-before",
  },
  {
    title: "SKIN RETOUCH",
    copy: "Beauty retouch that keeps pores and texture—no plastic skin.",
    seed: "skin-after",
    beforeSeed: "skin-before",
  },
  {
    title: "T-SHIRT DESIGNS",
    copy: "Apply vector-quality artwork directly onto realistic fabric mockups.",
    seed: "shirt-after",
    beforeSeed: "shirt-before",
  },
  {
    title: "TEXT REMOVER",
    copy: "Erase watermark overlays or background text without leaving artifacts.",
    seed: "text-after",
    beforeSeed: "text-before",
  },
];

export default function ShowcaseMarquee() {
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef(null);

  // Duplicated once so the track can scroll exactly -50% and loop with no
  // visible seam, instead of snapping back to the start.
  const track = [...TOP_PICKS, ...TOP_PICKS];

  useEffect(() => {
    function handleClickOutside(event) {
      if (marqueeRef.current && !marqueeRef.current.contains(event.target)) {
        setIsPaused(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <section
      ref={marqueeRef}
      aria-labelledby="showcase-heading"
      className="py-16 sm:py-20 overflow-hidden"
    >
      <Reveal as="header" className="max-w-2xl mx-auto text-center mb-12 px-4">
        <p className="text-sm font-medium text-accent-dark mb-2 tracking-wide uppercase">
          Top picks
        </p>
        <h2
          id="showcase-heading"
          className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink mb-3"
        >
          Explore the apps creators love most
        </h2>
        <p className="text-sm text-ink-soft leading-relaxed max-w-lg mx-auto">
          Curated to turn your ideas into polished results in seconds.
        </p>
      </Reveal>

      <div className="group relative -mx-4 sm:-mx-6 lg:-mx-8">
        <div
          className="flex w-max gap-5 px-4 sm:px-6 lg:px-8 animate-marquee"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {track.map((item, i) => (
            <div
              key={`${item.title}-${i}`}
              className="group/card relative h-[380px] w-[260px] sm:w-[280px] shrink-0 overflow-hidden rounded-3xl border border-border bg-cream-deep shadow-md transition-all duration-500 hover:shadow-xl hover:border-accent/40 cursor-pointer"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Main Image Background */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={seededPhoto(item.seed, 300, 400)}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                  loading="lazy"
                />
                {/* Dynamic Gradient Overlays for optimal readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10 z-10 transition-opacity duration-300 opacity-80 group-hover/card:opacity-95" />
              </div>

              {/* Card Contents */}
              <div className="absolute inset-x-0 bottom-0 p-6 z-20 flex flex-col justify-end">
                {/* Before Thumbnail Overlay */}
                <div className="relative w-16 h-16 rounded-xl border border-white/20 overflow-hidden shadow-lg mb-4 bg-black/40">
                  <img
                    src={seededPhoto(item.beforeSeed, 100, 100)}
                    alt="Before preview"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-center">
                    <span className="text-[9px] font-semibold text-white/90 tracking-wider uppercase">
                      BEFORE
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display text-sm font-semibold text-white tracking-wide uppercase">
                  {item.title}
                </h3>

                {/* Expanded Description & CTA on Hover */}
                <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-500 ease-in-out group-hover/card:max-h-32 group-hover/card:opacity-100">
                  <p className="text-xs text-white/80 leading-relaxed font-normal mt-2">
                    {item.copy}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-white group-hover/card:text-accent-soft transition-colors">
                    <span>Try now</span>
                    <ArrowRight size={13} className="transition-transform duration-300 group-hover/card:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edge gradient fades for marquee track */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-cream to-transparent z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-cream to-transparent z-10"
        />
      </div>
    </section>
  );
}

