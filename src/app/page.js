"use client";

import { useState } from "react";
import Header from "@/components/Header";
import HistoryStrip from "@/components/HistoryStrip";
import GeneratePanel from "@/components/GeneratePanel";
import ResultsFeed from "@/components/ResultsFeed";
import { historyItems, initialGenerations, seededPhoto } from "@/data/mockData";

// Convert the seed-only mock data into the same shape the live API returns,
// so ResultsFeed never has to know the difference between mock and fetched data.
const seedGenerations = initialGenerations.map((g) => ({
  ...g,
  images: Array.from({ length: g.count }).map((_, i) => ({
    id: `${g.id}-${i}`,
    url: seededPhoto(`${g.seed}-${i}`, 600, 800),
  })),
}));

export default function Page() {
  const [generations, setGenerations] = useState(seedGenerations);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate({ prompt, mode, count, ratio, model }) {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode, count, ratio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setGenerations((prev) => [
        {
          id: data.id,
          prompt,
          tag: model,
          images: data.images ?? [],
          videos: data.videos ?? [],
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 pb-16 max-w-[1600px] mx-auto flex flex-col gap-4">
        <HistoryStrip items={historyItems} />

        {error && (
          <p role="alert" className="text-sm text-red-600 px-1">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 items-start">
          <GeneratePanel onGenerate={handleGenerate} isGenerating={isGenerating} />
          <ResultsFeed generations={generations} isGenerating={isGenerating} />
        </div>
      </main>
    </div>
  );
}
