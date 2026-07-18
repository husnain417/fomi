"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, PanelRight, Loader2, Sun, Moon } from "lucide-react";

export default function StudioTopBar({
  projectName,
  onRenameProject,
  saveStatus,
  onOpenThreads,
  onOpenInspector,
  theme,
  onToggleTheme,
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(projectName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commitName() {
    const trimmed = draftName.trim();
    onRenameProject(trimmed || projectName);
    setEditing(false);
  }

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-3 sm:px-4 border-b border-border bg-studio-surface-raised">
      {/* Mobile/tablet: reach the thread tree without a permanent rail */}
      <button
        type="button"
        onClick={onOpenThreads}
        className="md:hidden p-2 -ml-1 rounded-md text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors"
        aria-label="Open threads"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName();
              if (e.key === "Escape") {
                setDraftName(projectName);
                setEditing(false);
              }
            }}
            className="font-display text-sm font-medium bg-transparent border-b border-accent outline-none px-0.5 min-w-0 w-40 sm:w-56"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraftName(projectName);
              setEditing(true);
            }}
            className="font-display text-sm font-medium truncate max-w-[10rem] sm:max-w-xs text-left hover:text-accent transition-colors"
            title="Rename project"
          >
            {projectName}
          </button>
        )}

        <SaveIndicator status={saveStatus} />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenInspector}
          className="lg:hidden p-2 rounded-md text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors"
          aria-label="Open inspector"
        >
          <PanelRight size={18} />
        </button>

        <div className="relative group/tooltip">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={theme === "dark"}
            className="p-2 rounded-md text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute right-0 top-full mt-1.5 whitespace-nowrap rounded-md bg-black/85 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-150 delay-300 group-hover/tooltip:opacity-100 z-10"
          >
            {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          </span>
        </div>

        <div
          className="w-7 h-7 rounded-full bg-accent-soft text-accent-dark font-display text-xs font-medium flex items-center justify-center shrink-0"
          title="Account"
        >
          M
        </div>
      </div>
    </header>
  );
}

function SaveIndicator({ status }) {
  const saving = status === "saving";
  return (
    <span
      className="flex items-center gap-1 text-[11px] text-muted shrink-0"
      role="status"
      aria-live="polite"
    >
      {saving ? (
        <>
          <Loader2 size={11} className="animate-spin" />
          <span>Saving…</span>
        </>
      ) : (
        <>
          <span
            className="w-1.5 h-1.5 rounded-full bg-studio-live inline-block"
            aria-hidden="true"
          />
          <span>Saved</span>
        </>
      )}
    </span>
  );
}