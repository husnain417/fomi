"use client";

import { useEffect, useRef, useState } from "react";
import { Star, GitBranch, Plus, Check, ChevronLeft, ChevronRight, X } from "lucide-react";

// "4:5" -> "4 / 5" for the CSS aspect-ratio property. Used for BOTH the
// generating placeholder and the loaded image's container, so the frame
// is exactly the right shape from the very first render in either state —
// nothing waits on the actual bitmap to arrive before claiming its space.
function ratioToAspectCss(ratio) {
  const parts = (ratio || "1:1").split(":").map(Number);
  const [w, h] = parts;
  if (!w || !h) return "1 / 1";
  return `${w} / ${h}`;
}

export default function Loupe({
  node,
  imageIndex,
  isResuming,
  compareSelected,
  compareFull,
  isGenerating,
  pendingRatio,
  previewImage, // { url } | null — disposable Strength-steering preview
  previewStatus, // "idle" | "loading" | "ready" | "error"
  onDiscardPreview,
  onPrev,
  onNext,
  onToggleFavorite,
  onBranch,
  onToggleCompare,
}) {
  const savedImage = node?.images[imageIndex];
  // The preview, when present, stands in for the branch target's saved
  // image — same crossfade machinery, it just points at a different url.
  const displayImage = previewImage || savedImage;
  const targetUrl = displayImage?.url ?? null;

  // `currentUrl`/`prevUrl` are what's actually painted. Deliberately NOT
  // the same as `targetUrl` — we only promote a url to `currentUrl` once
  // it has been preloaded and decoded off-screen, so the crossfade never
  // starts on an image that isn't actually ready to paint instantly.
  // That's what removes the flicker: previously the swap happened the
  // instant you clicked, so a fast second click could interrupt an image
  // that hadn't finished loading and briefly flash it on screen anyway.
  const [currentUrl, setCurrentUrl] = useState(targetUrl);
  const [prevUrl, setPrevUrl] = useState(null);
  const currentUrlRef = useRef(targetUrl);
  const latestRequestedRef = useRef(targetUrl);
  const clearTimerRef = useRef(null);

  useEffect(() => {
    if (!targetUrl || targetUrl === currentUrlRef.current) return;

    latestRequestedRef.current = targetUrl;
    let cancelled = false;
    const img = new window.Image();
    img.src = targetUrl;

    function commit() {
      // If the user clicked again before this particular image finished
      // loading, `latestRequestedRef` has already moved on to a newer
      // target — drop this stale result instead of flashing it on screen.
      if (cancelled || latestRequestedRef.current !== targetUrl) return;
      setPrevUrl(currentUrlRef.current);
      currentUrlRef.current = targetUrl;
      setCurrentUrl(targetUrl);
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = window.setTimeout(() => setPrevUrl(null), 180);
    }

    if (img.decode) {
      img.decode().then(commit).catch(commit);
    } else {
      img.onload = commit;
      img.onerror = commit;
    }

    return () => {
      cancelled = true;
    };
  }, [targetUrl]);

  useEffect(() => () => clearTimeout(clearTimerRef.current), []);

  function handleKeyDown(e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onNext();
    }
  }

  if (!node || !savedImage) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-sm">
        Select a generation from Threads to view it here.
      </div>
    );
  }

  const isFavorite = node.favoriteImageIndex === imageIndex;
  const isPreviewing = previewStatus === "loading" || previewStatus === "ready";
  // Only the discrete commit flow gets the pulse placeholder, and only
  // when there's no preview already sitting on screen — if Strength was
  // just steered, the settled preview is a better "is this ready yet"
  // signal than a placeholder would be, and swapping to a placeholder
  // over it would be a regression, not an improvement.
  const showGeneratingPlaceholder = isGenerating && !previewImage;

  // Same sizing approach in both states (placeholder vs. loaded), keyed
  // off whichever ratio is relevant to that state — this is what stops
  // the container (and the icons anchored to it) from ever collapsing
  // toward zero and then jumping once a bitmap arrives.
  const frameStyle = {
    aspectRatio: ratioToAspectCss(showGeneratingPlaceholder ? pendingRatio : node.ratio),
    height: "min(65vh, 600px)",
    maxWidth: "100%",
  };

  return (
    <div
      className="relative flex-1 flex items-center justify-center min-h-0 px-3 py-4 sm:px-6 sm:py-6 outline-none"
      tabIndex={0}
      role="group"
      aria-label={`Loupe viewer, image ${imageIndex + 1} of ${node.images.length}`}
      onKeyDown={handleKeyDown}
    >
      {/* The stage: a bounded, framed area the image sits inside. Without
          this, the Loupe is just an image floating in raw background —
          fine up to ~1440px, but on large/ultra-wide monitors it reads as
          an empty void rather than "generous negative space." Capping the
          width and giving it a faint border turns that same space into a
          deliberate canvas boundary instead. */}
      <div className="relative w-full h-full max-w-[1040px] mx-auto rounded-2xl border border-border/60 bg-studio-surface-raised/40 flex items-center justify-center p-4 sm:p-8">
        <div className="relative max-w-full max-h-full">
          {showGeneratingPlaceholder ? (
            <div
              className="rounded-lg border border-border bg-cream-deep stage-pulse"
              style={frameStyle}
              aria-hidden="true"
            />
          ) : (
            <div
              className={`relative rounded-lg overflow-hidden bg-cream-deep border transition-colors ${
                isPreviewing ? "border-dashed border-accent/60" : "border-border"
              } ${isResuming ? "loupe-fade-in" : ""}`}
              style={frameStyle}
            >
              {prevUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prevUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}
              {/* Loupe and Compare stay plain <img>, deliberately — both
                  need arbitrary CSS transforms (crossfade here, zoom/pan
                  in Compare) that fight next/image's sizing model. The
                  bulk thumbnails in ThreadNode/Filmstrip don't need that
                  flexibility, so those use next/image instead.

                  No `key` tied to the url here: by the time `currentUrl`
                  updates, the browser has already decoded this exact url
                  once (via the offscreen Image() above), so re-pointing
                  this same element's `src` paints instantly from that
                  cache — no remount, no reload, no flicker. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {currentUrl && (
                <img
                  key={currentUrl}
                  src={currentUrl}
                  alt={node.prompt}
                  className={`absolute inset-0 w-full h-full object-contain ${
                    prevUrl ? "loupe-fade-in" : ""
                  }`}
                />
              )}

              {isPreviewing && (
                <div
                  className="absolute top-2 left-2 flex items-center gap-1.5 h-6 pl-2 pr-1 rounded-full bg-black/60 backdrop-blur-sm text-white"
                  role="status"
                  aria-live="polite"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-studio-live inline-block animate-pulse"
                    aria-hidden="true"
                  />
                  <span className="text-[10px] font-mono uppercase tracking-wide">
                    {previewStatus === "loading" ? "Rendering…" : "Previewing"}
                  </span>
                  <button
                    type="button"
                    onClick={onDiscardPreview}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                    aria-label="Discard preview"
                    title="Discard preview"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Prev/next siblings without touching the filmstrip */}
          {node.images.length > 1 && !showGeneratingPlaceholder && (
            <>
              <button
                type="button"
                onClick={onPrev}
                disabled={imageIndex === 0}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm disabled:opacity-0 transition-opacity hover:bg-black/75"
                aria-label="Previous variant"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={imageIndex === node.images.length - 1}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm disabled:opacity-0 transition-opacity hover:bg-black/75"
                aria-label="Next variant"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Loupe toolbar */}
          {!showGeneratingPlaceholder && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <LoupeButton
                active={isFavorite}
                onClick={() => onToggleFavorite(imageIndex)}
                label={isFavorite ? "Unmark favorite" : "Mark favorite"}
                icon={<Star size={14} className={isFavorite ? "fill-current" : ""} />}
              />
              <LoupeButton
                onClick={onBranch}
                label="Branch from this result"
                icon={<GitBranch size={14} />}
              />
              <LoupeButton
                active={compareSelected}
                disabled={!compareSelected && compareFull}
                onClick={onToggleCompare}
                label={compareSelected ? "Remove from compare" : "Add to compare"}
                icon={compareSelected ? <Check size={14} /> : <Plus size={14} />}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoupeButton({ icon, label, onClick, active, disabled }) {
  return (
    <div className="relative group/tooltip">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={active || undefined}
        className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
          active
            ? "bg-accent text-white"
            : "bg-black/60 text-white hover:bg-black/75"
        }`}
      >
        {icon}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full mt-1.5 whitespace-nowrap rounded-md bg-black/85 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-150 delay-300 group-hover/tooltip:opacity-100 z-10"
      >
        {label}
      </span>
    </div>
  );
}