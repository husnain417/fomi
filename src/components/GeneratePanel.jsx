"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Sparkles,
  Image as ImageIcon,
  Video,
  SlidersHorizontal,
  Palette,
  Layers,
} from "lucide-react";
import { models, aspectRatios, imageCounts } from "@/data/mockData";

// Shared trigger chrome for every custom picker, so Count / Ratio / Model
// all read as the same control family instead of three one-off styles.
function PickerTrigger({ open, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="listbox"
      aria-expanded={open}
      className={`w-full flex items-center justify-between gap-2 rounded-full border bg-card px-4 py-2.5 text-sm font-medium text-ink transition-colors ${
        open
          ? "border-accent ring-2 ring-accent/25"
          : "border-border hover:border-muted-2"
      }`}
    >
      {children}
      <ChevronDown
        size={14}
        className={`shrink-0 text-muted transition-transform duration-200 ${
          open ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

// Panel shell shared by all three dropdowns — same radius, border, shadow
// and entrance animation everywhere.
function PickerPanel({ className = "", children }) {
  return (
    <div
      role="listbox"
      className={`absolute z-40 mt-2 rounded-2xl border border-border bg-card shadow-xl origin-top animate-[picker-in_0.12s_ease-out] ${className}`}
    >
      {children}
    </div>
  );
}

// A little proportionally-accurate rectangle for a given w:h ratio —
// used both in the trigger (small) and inside the grid (larger).
function RatioGlyph({ w, h, max }) {
  const scale = max / Math.max(w, h);
  const boxW = Math.max(4, Math.round(w * scale));
  const boxH = Math.max(4, Math.round(h * scale));
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-[3px] border-[1.5px] border-current"
      style={{ width: boxW, height: boxH }}
    />
  );
}

function CountPicker({ value, onChange, open, onToggle }) {
  return (
    <div className="relative min-w-0">
      <PickerTrigger open={open} onClick={onToggle}>
        <span className="flex items-center gap-2 truncate">
          <Layers size={14} className="text-muted shrink-0" />
          {value} {Number(value) === 1 ? "image" : "images"}
        </span>
      </PickerTrigger>
      {open && (
        <PickerPanel className="left-0 right-0 sm:right-auto w-auto sm:w-40 p-1.5">
          {imageCounts.map((n) => {
            const isSelected = String(value) === String(n);
            return (
              <button
                key={n}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onChange(n)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm text-left transition-colors ${
                  isSelected
                    ? "bg-accent-soft text-accent font-semibold"
                    : "text-ink hover:bg-cream-deep"
                }`}
              >
                {n} {n === 1 ? "image" : "images"}
              </button>
            );
          })}
        </PickerPanel>
      )}
    </div>
  );
}

function RatioPicker({ value, onChange, open, onToggle }) {
  const current = aspectRatios.find((r) => r.label === value) ?? aspectRatios[0];

  return (
    <div className="relative min-w-0">
      <PickerTrigger open={open} onClick={onToggle}>
        <span className="flex items-center gap-2 truncate text-ink-soft">
          <span className="text-ink">
            <RatioGlyph w={current.w} h={current.h} max={14} />
          </span>
          <span className="text-ink">{current.label}</span>
        </span>
      </PickerTrigger>
      {open && (
        <PickerPanel className="left-0 right-0 sm:right-auto w-auto sm:w-72 p-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {aspectRatios.map((r) => {
              const isSelected = value === r.label;
              return (
                <button
                  key={r.label}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onChange(r.label)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 transition-colors ${
                    isSelected
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-ink-soft hover:border-muted-2 hover:bg-cream-deep"
                  }`}
                >
                  <RatioGlyph w={r.w} h={r.h} max={22} />
                  <span className="text-[11px] font-semibold">{r.label}</span>
                </button>
              );
            })}
          </div>
        </PickerPanel>
      )}
    </div>
  );
}

function ModelPicker({ value, onChange, open, onToggle }) {
  return (
    <div className="relative min-w-0">
      <PickerTrigger open={open} onClick={onToggle}>
        <span className="truncate">
          Model: <span className="font-semibold">{value}</span>
        </span>
      </PickerTrigger>
      {open && (
        <PickerPanel className="left-0 right-0 sm:left-auto w-auto sm:w-64 max-h-72 overflow-y-auto p-1.5">
          {models.map((m) => {
            const isSelected = value === m.name;
            return (
              <button
                key={m.name}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onChange(m.name)}
                className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-left transition-colors ${
                  isSelected
                    ? "bg-accent-soft text-accent font-semibold"
                    : "text-ink hover:bg-cream-deep"
                }`}
              >
                <span className="truncate">{m.name}</span>
                {m.tag && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      isSelected
                        ? "bg-accent/15 text-accent"
                        : "bg-cream-deep text-muted"
                    }`}
                  >
                    {m.tag}
                  </span>
                )}
              </button>
            );
          })}
        </PickerPanel>
      )}
    </div>
  );
}

function Accordion({ title, icon: Icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-normal text-ink"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon size={15} className="text-muted" />}
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {/* grid-template-rows 0fr -> 1fr trick: animates height without ever
          having to measure the content in JS. */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 text-sm text-ink-soft">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function GeneratePanel({ onGenerate, isGenerating }) {
  const [mode, setMode] = useState("image");
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(imageCounts[2]);
  const [ratio, setRatio] = useState(aspectRatios[0].label);
  const [model, setModel] = useState(models[0].name);
  const [promptFocused, setPromptFocused] = useState(false);

  // Only one of the three custom dropdowns is ever open at a time.
  const [openDropdown, setOpenDropdown] = useState(null);
  const optionsRowRef = useRef(null);

  useEffect(() => {
    if (!openDropdown) return;
    function handlePointerDown(e) {
      if (optionsRowRef.current && !optionsRowRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpenDropdown(null);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDropdown]);

  function toggleDropdown(key) {
    setOpenDropdown((prev) => (prev === key ? null : key));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate?.({ prompt: prompt.trim(), mode, count: Number(count), ratio, model });
  }

  return (
    <div className="rounded-3xl bg-panel border border-border p-4 flex flex-col gap-4 h-fit md:sticky md:top-32">
      {/* Mode tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-full bg-tab-track p-1">
        {[
          { key: "image", label: "Image", icon: ImageIcon },
          { key: "video", label: "Video", icon: Video },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-normal transition-colors ${
              mode === key
                ? "bg-tab-active text-ink shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
            aria-pressed={mode === key}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Prompt box */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div
          className={`rounded-2xl bg-card border p-4 flex flex-col gap-6 transition-colors ${
            promptFocused ? "border-accent ring-2 ring-accent/20" : "border-border"
          }`}
        >
          <label htmlFor="prompt" className="sr-only">
            Describe the image or video you want to generate
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setPromptFocused(true)}
            onBlur={() => setPromptFocused(false)}
            rows={5}
            maxLength={500}
            placeholder="Describe you imaginations to be converted to piece of art..."
            className="w-full resize-none bg-transparent text-sm text-ink placeholder:text-muted-2 focus:outline-none"
          />
          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-accent hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 transition-all hover:shadow-md active:scale-[0.98]"
            >
              <Sparkles size={16} />
              {isGenerating ? "Generating…" : "Generate"}
            </button>
            <span className="text-xs text-muted tabular-nums">
              {prompt.length}/500
            </span>
          </div>
        </div>

        {/* Options row */}
        <div ref={optionsRowRef} className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <CountPicker
            value={count}
            onChange={(v) => {
              setCount(v);
              setOpenDropdown(null);
            }}
            open={openDropdown === "count"}
            onToggle={() => toggleDropdown("count")}
          />
          <RatioPicker
            value={ratio}
            onChange={(v) => {
              setRatio(v);
              setOpenDropdown(null);
            }}
            open={openDropdown === "ratio"}
            onToggle={() => toggleDropdown("ratio")}
          />
          <ModelPicker
            value={model}
            onChange={(v) => {
              setModel(v);
              setOpenDropdown(null);
            }}
            open={openDropdown === "model"}
            onToggle={() => toggleDropdown("model")}
          />
        </div>
      </form>

      <Accordion title="Advance" icon={SlidersHorizontal}>
        Fine-tune guidance scale, seed, and negative prompts before you generate.
      </Accordion>
      <Accordion title="Styles" icon={Palette}>
        Pick a visual style preset — cinematic, editorial, illustration, and more.
      </Accordion>
    </div>
  );
}