"use client";

import ImageGrid from "./ImageGrid";

export default function ResultsFeed({ generations, isGenerating }) {
  if (!generations.length && !isGenerating) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center text-muted">
        <p className="font-display text-lg text-ink-soft mb-1">
          Nothing generated yet
        </p>
        <p className="text-sm">
          Describe what you want to see on the left and hit Generate.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {generations.map((gen) => (
        <article key={gen.id} className="flex flex-col lg:flex-row gap-4">
          <div className="rounded-3xl bg-panel border border-border p-5 flex flex-col gap-4 lg:w-72 lg:shrink-0">
            <p className="text-sm leading-relaxed text-ink-soft">{gen.prompt}</p>
            <span className="self-start shrink-0 rounded-full bg-card border border-border px-4 py-1.5 text-sm font-medium text-ink">
              {gen.tag ?? "Model"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <ImageGrid images={gen.images} />
          </div>
        </article>
      ))}

      {isGenerating && (
        <article className="flex flex-col lg:flex-row gap-4" aria-live="polite">
          <div className="rounded-3xl bg-panel border border-border p-5 animate-pulse h-40 lg:w-72 lg:shrink-0" />
          <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-cream-deep border border-border animate-pulse"
                style={{ aspectRatio: "3/4" }}
              />
            ))}
          </div>
        </article>
      )}
    </div>
  );
}