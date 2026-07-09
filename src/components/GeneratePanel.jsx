"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { models, aspectRatios, imageCounts } from "@/data/mockData";

function Dropdown({ label, value, options, onChange }) {
  return (
    <label className="relative flex-1 min-w-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-full bg-card border border-border text-sm font-medium text-ink px-4 py-2.5 pr-8 truncate focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {label === "Model" ? `Model: ${opt}` : opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </label>
  );
}

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-ink"
      >
        {title}
        <ChevronDown
          size={16}
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-ink-soft">{children}</div>
      )}
    </div>
  );
}

export default function GeneratePanel({ onGenerate, isGenerating }) {
  const [mode, setMode] = useState("image");
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(imageCounts[2]);
  const [ratio, setRatio] = useState(aspectRatios[0]);
  const [model, setModel] = useState(models[0]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate?.({ prompt: prompt.trim(), mode, count: Number(count), ratio, model });
  }

  return (
    <div className="rounded-3xl bg-panel border border-border p-4 flex flex-col gap-4 h-fit lg:sticky lg:top-32">
      {/* Mode tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-full bg-cream-deep p-1">
        {["image", "video"].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full py-2 text-sm font-semibold capitalize transition-colors ${
              mode === m ? "bg-card text-ink shadow-sm" : "text-ink-soft"
            }`}
            aria-pressed={mode === m}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Prompt box */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-6">
          <label htmlFor="prompt" className="sr-only">
            Describe the image or video you want to generate
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            placeholder="Describe you imaginations to be converted to piece of art..."
            className="w-full resize-none bg-transparent text-sm text-ink placeholder:text-muted-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="self-start inline-flex items-center gap-2 rounded-full bg-accent hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 transition-colors"
          >
            <Sparkles size={16} />
            {isGenerating ? "Generating…" : "Generate"}
          </button>
        </div>

        {/* Options row */}
        <div className="flex flex-wrap gap-2">
          <Dropdown
            label="# Images"
            value={count}
            options={imageCounts}
            onChange={setCount}
          />
          <Dropdown
            label="Ratio"
            value={ratio}
            options={aspectRatios}
            onChange={setRatio}
          />
          <Dropdown
            label="Model"
            value={model}
            options={models}
            onChange={setModel}
          />
        </div>
      </form>

      <Accordion title="Advance">
        Fine-tune guidance scale, seed, and negative prompts before you generate.
      </Accordion>
      <Accordion title="Styles">
        Pick a visual style preset — cinematic, editorial, illustration, and more.
      </Accordion>
    </div>
  );
}
