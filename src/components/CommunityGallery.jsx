"use client";

import { seededPhoto } from "@/data/mockData";
import Reveal from "./Reveal";

const GALLERY_ITEMS = [
  { seed: "runner-man", title: "Runner", height: 550 },
  { seed: "sunglasses-bunny", title: "Bunny", height: 400 },
  { seed: "roses-walk", title: "Walk", height: 300 },
  { seed: "tribal-snake", title: "Tribal Portrait", height: 500 },
  { seed: "pink-creature", title: "Pink Creature", height: 520 },
  { seed: "luxury-hands", title: "Luxury Details", height: 600 },
  { seed: "girl-cat", title: "Hugging Cat", height: 530 },
  { seed: "red-convertible", title: "Retro convertible", height: 550 },
  { seed: "red-car-driver", title: "Retro driver", height: 300 },
  { seed: "sunlit-women", title: "Sunlit Field", height: 270 },
  { seed: "sunset-detail", title: "Golden Hour", height: 300 },
  { seed: "young-man-portrait", title: "Portrait", height: 530 },
];

export default function CommunityGallery() {
  return (
    <section id="community-gallery" className="py-16 sm:py-20 max-w-7xl mx-auto w-full px-4 scroll-mt-20">
      <Reveal as="header" className="max-w-2xl mx-auto text-center mb-12 px-4">
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink mb-3">
          Community gallery
        </h2>
        <p className="text-sm text-ink-soft leading-relaxed max-w-lg mx-auto">
          Discover amazing AI-generated artwork from our creative community
        </p>
      </Reveal>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {GALLERY_ITEMS.map((item, idx) => (
          <Reveal key={item.seed} delay={idx * 50}>
            <div className="break-inside-avoid rounded-3xl overflow-hidden border border-border/40 bg-card group relative shadow-sm hover:shadow-md transition-all duration-300 hover:border-accent/30 cursor-pointer">
              <img
                src={seededPhoto(item.seed, 400, item.height)}
                alt={item.title}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-102"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
