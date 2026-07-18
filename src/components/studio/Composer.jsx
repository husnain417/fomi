"use client";

import { Command, GitBranch, Sparkles, X, Loader2, Cpu } from "lucide-react";

function truncate(text, max = 60) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export default function Composer({
  value,
  onChange,
  onSubmit,
  isGenerating,
  branchTargetNode,
  onCancelBranch,
  onOpenPalette,
  inputRef,
  paletteButtonRef,
  activeModel,
  activeRatio,
}) {
  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || isGenerating) return;
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-border bg-studio-surface-raised px-3 sm:px-6 py-2.5 sm:py-3"
    >
      {branchTargetNode && (
        <div className="flex items-center gap-1.5 mb-2 text-[11px] text-accent-dark">
          <GitBranch size={12} />
          <span>
            Branching from “{truncate(branchTargetNode.prompt, 50)}”
          </span>
          <button
            type="button"
            onClick={onCancelBranch}
            className="ml-1 text-muted hover:text-ink transition-colors"
            aria-label="Cancel branch"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Always-visible readout of what you're about to generate with —
            without this, the model/ratio only exist inside the palette,
            which is invisible until someone already knows to open it. */}
        <button
          type="button"
          onClick={onOpenPalette}
          className="hidden sm:flex shrink-0 items-center gap-1.5 h-10 px-2.5 rounded-md border border-border bg-card text-[12px] text-ink-soft hover:text-ink hover:border-accent transition-colors"
          aria-label={`Current model ${activeModel}, ratio ${activeRatio}. Click to change.`}
        >
          <Cpu size={12} className="text-muted" />
          <span className="max-w-[110px] truncate">{activeModel}</span>
          <span className="text-muted">·</span>
          <span className="font-mono">{activeRatio}</span>
        </button>

        {/* Visible palette trigger — there's no physical Cmd key on touch
            devices, so the keyboard shortcut can't be the only entry
            point into model/ratio/etc. controls. */}
        <button
          type="button"
          ref={paletteButtonRef}
          onClick={onOpenPalette}
          className="hidden sm:flex shrink-0 items-center gap-1 h-10 px-2.5 rounded-md border border-border text-[11px] font-mono text-muted hover:text-ink hover:bg-cream-deep transition-colors"
          aria-label="Open command palette"
        >
          <Command size={12} />K
        </button>
        <button
          type="button"
          onClick={onOpenPalette}
          className="sm:hidden shrink-0 w-10 h-10 rounded-md border border-border text-muted hover:text-ink hover:bg-cream-deep transition-colors flex items-center justify-center"
          aria-label="Open command palette"
        >
          <Command size={16} />
        </button>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            branchTargetNode
              ? "Describe the variation…"
              : "Describe what to generate…"
          }
          className="flex-1 min-w-0 h-10 rounded-md border border-border bg-card px-3 text-[13px] outline-none focus:border-accent"
        />

        <button
          type="submit"
          disabled={!value.trim() || isGenerating}
          className="shrink-0 flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-md bg-accent text-white text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-dark transition-colors"
        >
          {isGenerating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          <span className="hidden sm:inline">
            {isGenerating ? "Generating" : "Generate"}
          </span>
        </button>
      </div>
    </form>
  );
}
