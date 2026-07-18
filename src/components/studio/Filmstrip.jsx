"use client";

import Image from "next/image";
import { Star } from "lucide-react";

export default function Filmstrip({ node, selectedIndex, onSelect }) {
  if (!node) return null;

  return (
    <div
      className="shrink-0 border-t border-border px-3 sm:px-6 py-2.5"
      role="listbox"
      aria-label="Sibling variants from this generation"
      aria-orientation="horizontal"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {node.images.map((img, i) => {
          const isSelected = i === selectedIndex;
          const isFavorite = node.favoriteImageIndex === i;
          return (
            <button
              key={img.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-label={`Variant ${i + 1} of ${node.images.length}${
                isFavorite ? ", favorite" : ""
              }`}
              onClick={() => onSelect(i)}
              className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-colors ${
                isSelected
                  ? "border-accent"
                  : "border-transparent hover:border-border"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
              {isFavorite && (
                <Star
                  size={11}
                  className="absolute top-1 right-1 fill-accent text-accent drop-shadow"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
