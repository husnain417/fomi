"use client";

import Image from "next/image";
import { Download, Heart } from "lucide-react";

export default function ImageGrid({ images, aspect = "3/4" }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((img, i) => (
        <div
          key={img.id ?? i}
          className="group relative rounded-2xl overflow-hidden bg-cream-deep border border-border"
          style={{ aspectRatio: aspect }}
        >
          <Image
            src={img.url}
            alt={img.alt ?? `Generated result ${i + 1}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              aria-label="Save to favorites"
              className="h-8 w-8 rounded-full bg-card/90 text-ink flex items-center justify-center hover:bg-card"
            >
              <Heart size={15} />
            </button>
            <button
              type="button"
              aria-label="Download image"
              className="h-8 w-8 rounded-full bg-card/90 text-ink flex items-center justify-center hover:bg-card"
            >
              <Download size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}