"use client";

import { Sparkles, Video, ArrowUpCircle, LayoutGrid } from "lucide-react";
import Reveal from "./Reveal";
import { seededPhoto } from "@/data/mockData";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Text to Image",
    copy: "Turn a sentence into a fully art-directed image in seconds, in whatever style you describe.",
    seed: "neon-surf",
  },
  {
    icon: Video,
    title: "Text to Video",
    copy: "Generate short clips from a prompt or a still, ready to drop straight into a reel or a cut.",
    seed: "cyberpunk-drive",
  },
  {
    icon: ArrowUpCircle,
    title: "Upscale & Enhance",
    copy: "Push existing images and video up to 4x resolution without smearing away the detail.",
    seed: "macro-butterfly",
  },
  {
    icon: LayoutGrid,
    title: "Templates & Presets",
    copy: "Start from a curated look instead of a blank prompt box when you need something fast.",
    seed: "creative-grid",
  },
];

export default function FeatureHighlights() {
  return (
    <section aria-labelledby="features-heading" className="py-16 sm:py-20">
      <Reveal as="header" className="max-w-xl mx-auto text-center mb-12 px-4">
        <p className="text-sm font-medium text-accent-dark mb-2 tracking-wide uppercase">
          What Fomi can do
        </p>
        <h2
          id="features-heading"
          className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink"
        >
          One studio, every format
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.title} delay={i * 90}>
            <div className="group relative aspect-[4/5] w-full rounded-3xl overflow-hidden border border-border/40 shadow-md transition-all duration-300 hover:shadow-xl hover:border-accent/40 bg-card">
              {/* Image Background */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={seededPhoto(feature.seed, 600, 750)}
                  alt={feature.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                {/* Gradient Overlays for Readability and Depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 z-10" />
              </div>

              {/* Card Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-6 z-20 flex flex-col justify-end">
                {/* Icon Glassmorphic Container */}
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white mb-4 border border-white/20 shadow-inner transition-transform duration-300 group-hover:scale-110">
                  <feature.icon size={20} strokeWidth={1.75} />
                </div>
                
                <h3 className="font-display text-lg font-semibold text-white mb-2 tracking-tight group-hover:text-accent-soft transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-white/80 leading-relaxed font-normal">
                  {feature.copy}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

