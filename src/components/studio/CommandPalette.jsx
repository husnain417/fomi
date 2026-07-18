"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check } from "lucide-react";
import { fuzzyFilter } from "@/hooks/useCommandPalette";

export default function CommandPalette({ open, onClose, actions, triggerRef }) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const listRef = useRef(null);

  const filtered = useMemo(
    () => fuzzyFilter(query, actions, (a) => `${a.label} ${a.group}`),
    [query, actions]
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlighted(0);
      // Focus after the mount so the palette-in animation's transform
      // doesn't fight the browser's focus-scroll.
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    // Return focus to whatever opened the palette (the ⌘K trigger).
    triggerRef?.current?.focus?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  function runAction(action) {
    if (!action) return;
    action.run();
    // Model/ratio picks set `keepOpen` so you can try several in a row
    // without the palette closing after each click — everything else
    // (new thread, compare, export, theme...) closes as normal.
    if (!action.keepOpen) onClose();
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(filtered.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      runAction(filtered[highlighted]);
      return;
    }
    if (e.key === "Tab") {
      // Single-field dialog (search input + list) — keep focus trapped on
      // the input rather than letting Tab escape to the page behind it.
      e.preventDefault();
    }
  }

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-highlighted="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  if (!open) return null;

  let lastGroup = null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={handleKeyDown}
        className="relative isolate w-full max-w-md rounded-xl border border-border overflow-hidden palette-in"
        style={{
          backgroundColor: "var(--color-studio-surface-raised)",
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.12), 0 16px 40px -8px rgba(0,0,0,0.35)",
        }}
      >
        <div className="flex items-center gap-2 px-3 h-11 border-b border-border">
          <Search size={15} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command…"
            className="flex-1 min-w-0 h-full bg-transparent outline-none text-[13px]"
            aria-label="Search commands"
          />
          <kbd className="hidden sm:inline text-[10px] font-mono text-muted border border-border rounded px-1 py-0.5">
            Esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto py-1.5" role="listbox">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted">
              No matching commands.
            </p>
          )}
          {filtered.map((action, i) => {
            const showGroup = action.group !== lastGroup;
            lastGroup = action.group;
            const isHighlighted = i === highlighted;
            return (
              <div key={action.id}>
                {showGroup && (
                  <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-muted">
                    {action.group}
                  </div>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={isHighlighted}
                  data-highlighted={isHighlighted ? "true" : undefined}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => runAction(action)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors ${
                    isHighlighted ? "bg-accent-soft/80 text-ink" : "text-ink"
                  }`}
                >
                  {action.icon && (
                    <action.icon size={14} className="shrink-0 text-ink-soft" />
                  )}
                  <span className="truncate">{action.label}</span>
                  {action.checked ? (
                    <Check size={14} className="ml-auto text-accent shrink-0" />
                  ) : (
                    action.hint && (
                      <span className="ml-auto text-[11px] font-mono text-muted shrink-0">
                        {action.hint}
                      </span>
                    )
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
