"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { seededPhoto } from "@/data/mockData";

const FEATURED_TOOLS = [
  {
    title: "Image Generation",
    seed: "creative-lens",
  },
  {
    title: "Enhance Image",
    seed: "face-hair",
  },
  {
    title: "Edit Image",
    seed: "cat-pink",
  },
  {
    title: "Upscale",
    seed: "flower-bug",
  },
  {
    title: "Video Studio",
    seed: "glitter-makeup",
  },
  {
    title: "Lipsync",
    seed: "pig-suit",
  },
];

export default function FeaturedToolsSlider() {
  const sliderRef = useRef(null);

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.6;
      sliderRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto w-full">
      <div className="relative w-full rounded-[32px] bg-cream-deep/60 dark:bg-panel border border-border/40 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col md:flex-row gap-8 items-center overflow-hidden shadow-sm">
        
        {/* Left Side: Call to Action */}
        <div className="w-full md:w-[28%] shrink-0 flex flex-col items-start gap-4 text-left z-10">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink leading-tight">
            Create your <br />
            <span className="text-accent-dark font-black">imagination now</span>
          </h2>
          <p className="text-sm text-ink-soft leading-relaxed max-w-[240px]">
            Explore featured tools faster and start creating in seconds.
          </p>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-accent-dark text-white px-5 py-3 text-sm font-semibold hover:bg-accent transition-colors shadow-sm mt-2 hover:-translate-y-0.5 duration-200">
            <span>All Features</span>
            <Sparkles size={14} className="animate-pulse" />
          </button>
        </div>

        {/* Right Side: Slider Carousel */}
        <div className="w-full md:w-[72%] relative group/slider">
          
          {/* Navigation Controls */}
          <button
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-card/90 border border-border/30 backdrop-blur-md shadow-md flex items-center justify-center text-ink hover:bg-white dark:hover:bg-card z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 pointer-events-auto cursor-pointer"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          
          <button
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-card/90 border border-border/30 backdrop-blur-md shadow-md flex items-center justify-center text-ink hover:bg-white dark:hover:bg-card z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 pointer-events-auto cursor-pointer"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>

          {/* Cards Track */}
          <div
            ref={sliderRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth w-full py-2 px-1"
          >
            {FEATURED_TOOLS.map((tool) => (
              <div
                key={tool.title}
                className="flex flex-col items-center gap-3 shrink-0 group/card cursor-pointer"
              >
                {/* Square Card Image */}
                <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-3xl overflow-hidden relative border border-border/40 shadow-sm transition-transform duration-300 group-hover/card:scale-102 group-hover/card:shadow-md bg-card">
                  <img
                    src={seededPhoto(tool.seed, 300, 300)}
                    alt={tool.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Visual overlay specifically for "Enhance Image" showing vertical comparison slider */}
                  {tool.title === "Enhance Image" && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                      <div className="w-[1.5px] h-full bg-white/80 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-card shadow-md border border-border/40 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-dark" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Title Below Card */}
                <span className="text-xs sm:text-sm font-semibold text-ink/90 group-hover/card:text-accent-dark transition-colors">
                  {tool.title}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
