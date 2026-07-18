"use client";

import { X, Eye, GitBranch, ChevronDown } from "lucide-react";
import { studioModels, studioRatios } from "@/data/studioMock";

// Pinned locale + timeZone so the server and client always render the exact
// same string — `toLocaleString(undefined, ...)` previously deferred to
// each runtime's own default locale (Node vs. the browser), which differ
// and caused a real hydration mismatch here.
function formatCreatedAt(isoOrDate) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(isoOrDate));
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-muted mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function ReadOnlyRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-b-0">
      <span className="text-[11px] uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="text-[12px] font-mono text-ink text-right truncate max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

export default function Inspector({
  overlayOpen,
  mode, // "view" | "branch" | "empty"
  viewedNode,
  viewedImageIndex,
  branchDraft,
  onChangeDraft,
  onStrengthChange,
  onCancelBranch,
  onCloseOverlay,
}) {
  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 h-11 shrink-0 border-b border-border">
        <h2 className="flex items-center gap-1.5 font-display text-xs font-medium tracking-wide text-ink-soft uppercase">
          {mode === "branch" ? <GitBranch size={13} /> : <Eye size={13} />}
          {mode === "branch" ? "New attempt" : "Parameters"}
        </h2>
        <button
          type="button"
          onClick={onCloseOverlay}
          className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-cream-deep transition-colors lg:hidden"
          aria-label="Close inspector"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {mode === "empty" && (
          <p className="text-xs text-muted leading-relaxed">
            Set your model and ratio from the composer's chip or ⌘K, then
            describe what to generate below — it becomes the first result
            of this new thread.
          </p>
        )}

        {mode === "view" && viewedNode && (
          <div>
            <p className="text-[13px] text-ink leading-snug mb-3">
              {viewedNode.prompt}
            </p>
            <div className="rounded-md border border-border px-2.5">
              <ReadOnlyRow label="Model" value={viewedNode.model} />
              <ReadOnlyRow label="Ratio" value={viewedNode.ratio} />
              <ReadOnlyRow
                label="Seed"
                value={`${viewedNode.seed}-${viewedImageIndex}`}
              />
              {viewedNode.strength != null && (
                <ReadOnlyRow label="Strength" value={viewedNode.strength} />
              )}
              <ReadOnlyRow
                label="Created"
                value={formatCreatedAt(viewedNode.createdAt)}
              />
            </div>
            <p className="mt-3 text-[11px] text-muted leading-relaxed">
              This is what made this result. To try a variation, use Branch
              in the Loupe toolbar or the command palette.
            </p>
          </div>
        )}

        {mode === "branch" && branchDraft && (
          <div className="space-y-3">
            <p className="text-[11px] text-muted leading-relaxed">
              Branching from{" "}
              <span className="text-ink-soft">
                “{branchDraft.parentPromptPreview}”
              </span>
              . These parameters apply to the next generation from the
              composer below.
            </p>

            <Field label="Model">
              <div className="relative">
                <select
                  value={branchDraft.model}
                  onChange={(e) => onChangeDraft({ model: e.target.value })}
                  className="w-full h-9 appearance-none rounded-md border border-border bg-card pl-2.5 pr-8 text-[13px] text-ink outline-none focus:border-accent"
                >
                  {studioModels.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {/* appearance-none drops the browser's own arrow — its
                    position/style isn't consistent (or stylable) across
                    browsers, which is what made this look unfinished.
                    One chevron, always in the same spot, matching every
                    other control in this panel. */}
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </Field>

            <Field label="Ratio">
              <div className="flex flex-wrap gap-1.5">
                {studioRatios.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onChangeDraft({ ratio: r })}
                    className={`h-7 px-2 rounded-md text-[12px] font-mono border transition-colors ${
                      branchDraft.ratio === r
                        ? "bg-accent text-white border-accent"
                        : "border-border text-ink-soft hover:bg-cream-deep"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={`Strength — ${branchDraft.strength.toFixed(2)}`}>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={branchDraft.strength}
                onChange={(e) => {
                  const strength = parseFloat(e.target.value);
                  onChangeDraft({ strength });
                  // Steers the Loupe preview live — disposable, doesn't
                  // touch the tree. Only Model/Ratio stay request-only
                  // for this pass; see PRODUCT_THINKING.md.
                  onStrengthChange?.(strength);
                }}
                className="w-full accent-[var(--color-accent)]"
              />
            </Field>

            <button
              type="button"
              onClick={onCancelBranch}
              className="w-full h-8 rounded-md border border-border text-xs text-ink-soft hover:bg-cream-deep transition-colors"
            >
              Cancel branch
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex w-[280px] shrink-0 border-l border-border bg-studio-surface-raised flex-col">
        {content}
      </div>

      {overlayOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCloseOverlay}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-xs bg-studio-surface-raised shadow-xl slide-in-right">
            {content}
          </div>
        </div>
      )}
    </>
  );
}