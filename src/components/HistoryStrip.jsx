"use client";

import Image from "next/image";

export default function HistoryStrip({ items, onSelect }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-2 shadow-sm">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          className="flex flex-col items-start justify-center shrink-0 w-28 h-20 sm:w-32 sm:h-24 rounded-2xl bg-cream px-4 hover:bg-cream-deep transition-colors"
        >
          <span className="font-display font-semibold text-sm text-ink">History</span>
          <span className="text-xs text-muted mt-0.5">View All</span>
        </button>

        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item)}
            className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-transparent hover:border-accent transition-colors"
            aria-label={`Reopen generation: ${item.label}`}
          >
            <Image
              src={`https://picsum.photos/seed/${item.seed}/160/160`}
              alt={item.label}
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
