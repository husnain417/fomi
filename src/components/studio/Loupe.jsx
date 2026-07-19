"use client";

import { useEffect, useRef, useState } from "react";
import { Star, GitBranch, Plus, Check, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";

// "4:5" -> "4 / 5" for the CSS aspect-ratio property.
function ratioToAspectCss(ratio) {
  const parts = (ratio || "1:1").split(":").map(Number);
  const [w, h] = parts;
  if (!w || !h) return "1 / 1";
  return `${w} / ${h}`;
}

const STAGE_HEIGHT = "min(65vh, 600px)";

// The box's real size = min(available width, height-budget * ratio), with
// height always DERIVED from that width via aspect-ratio — never fixed
// independently. That's what makes this distortion-proof: there's only
// ever one source of truth (width), so width and height can never
// disagree with the declared ratio, on any viewport. (A fixed height +
// max-width approach was tried and measurably distorts wide ratios once
// the available width gets tight — verified, not a hunch.)
function stageWidthCap(ratio) {
  const [w, h] = (ratio || "1:1").split(":").map(Number);
  const decimal = w && h ? w / h : 1;
  return `calc(${STAGE_HEIGHT} * ${decimal})`;
}

// Same visual language as the top bar's theme-toggle tooltip, applied
// consistently to every icon button in the Loupe. Native `title`
// attributes turned out to be unreliable here (OS-level, hover-delay
// dependent, not something we can guarantee or verify) — this is plain
// DOM/CSS, so it's actually testable and it's what's already proven to
// work elsewhere in the app.
function IconTooltip({ label, children, align = "center", className }) {
  const alignClass =
    align === "right"
      ? "right-0"
      : align === "left"
      ? "left-0"
      : "left-1/2 -translate-x-1/2";
  // Deliberately not hardcoding "relative" alongside whatever position
  // class the caller passes — having both "relative" and "absolute" on
  // the same element is a same-property conflict that Tailwind resolves
  // by stylesheet order, not by which class appears later in the string,
  // and it silently discarded "absolute" every time. The caller's own
  // position class is now the only one in play; this default only
  // applies when a caller doesn't need special positioning (e.g. icons
  // that just flow inside an already-positioned toolbar row).
  const positionClass = className || "relative inline-flex";
  return (
    <div className={`group/tooltip ${positionClass}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-full mt-1.5 ${alignClass} whitespace-nowrap rounded-md bg-black/85 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-150 delay-300 group-hover/tooltip:opacity-100 z-20`}
      >
        {label}
      </span>
    </div>
  );
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

  // `current` is what's actually painted; `previous` is the outgoing
  // image kept mounted just long enough for the crossfade. `current`
  // only ever changes to a url that has already finished loading AND
  // decoding — see the preload effect below — so the fade-in animation
  // and the arrival of real pixels are always in sync instead of racing
  // each other (that race was the original flicker bug).
  const [current, setCurrent] = useState(targetUrl);
  const [previous, setPrevious] = useState(null);
  // True for the gap between "a new target was requested" and "it's
  // actually decoded and on screen." Without this, clicking next/prev on
  // an image the browser hasn't cached yet reads as a dropped click —
  // `current` doesn't change until decode finishes, so nothing visibly
  // happens in between. This only ever gates a loading affordance; it
  // never gates *which* url eventually gets committed — that's still
  // entirely decided by latestRequestedRef in commit() below.
  const [isSwitching, setIsSwitching] = useState(false);
  const currentRef = useRef(targetUrl);
  const latestRequestedRef = useRef(targetUrl);
  const clearPrevTimeoutRef = useRef(null);
  const switchingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!targetUrl || targetUrl === currentRef.current) return;
    latestRequestedRef.current = targetUrl;

    // Small delay before showing the loading state — most cached/already-
    // seen images (going back to something you just looked at) decode in
    // a handful of milliseconds, and flashing a spinner for that would
    // read as noisier, not more responsive. Only the genuinely-slow loads
    // (first time this url has ever been fetched) end up showing it.
    window.clearTimeout(switchingTimeoutRef.current);
    switchingTimeoutRef.current = window.setTimeout(() => {
      if (latestRequestedRef.current === targetUrl) setIsSwitching(true);
    }, 120);

    let cancelled = false;
    const img = new window.Image();
    img.src = targetUrl;

    function commit() {
      // A newer selection superseded this one while it was loading (e.g.
      // clicking through several filmstrip thumbnails quickly) — drop
      // this stale result instead of flashing an outdated image.
      if (cancelled || latestRequestedRef.current !== targetUrl) return;
      window.clearTimeout(switchingTimeoutRef.current);
      setIsSwitching(false);
      setPrevious(currentRef.current);
      currentRef.current = targetUrl;
      setCurrent(targetUrl);
      window.clearTimeout(clearPrevTimeoutRef.current);
      clearPrevTimeoutRef.current = window.setTimeout(() => setPrevious(null), 220);
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

  useEffect(
    () => () => {
      window.clearTimeout(clearPrevTimeoutRef.current);
      window.clearTimeout(switchingTimeoutRef.current);
    },
    []
  );

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
  // signal than a placeholder would be.
  const showGeneratingPlaceholder = isGenerating && !previewImage;
  const stageRatio = showGeneratingPlaceholder ? pendingRatio : node.ratio;

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
          fine up to ~1440px, but on large/ultra-wide monitors it reads
          as an empty void rather than "generous negative space." Capping
          the width and giving it a faint border turns that same space
          into a deliberate canvas boundary instead. (This was previously
          dropped in favor of no framing at all, to work around a corner-
          rounding artifact — but that artifact was actually the seed
          data lying about its own aspect ratio, which is fixed at the
          source now in studioMock.js, so the frame is safe to keep.) */}
      <div className="relative w-full h-full max-w-[1040px] mx-auto rounded-2xl border border-border/60 bg-studio-surface-raised/40 flex items-center justify-center p-4 sm:p-8">
        {/* This wrapper's size comes entirely from aspectRatio + the
            width/maxWidth pair above — metadata, not any <img>'s natural
            size — so it never collapses while an image is loading, and
            every absolutely positioned child (toolbar, prev/next arrows)
            is positioned relative to *this*, so they're only ever in
            their real, final spots — never bunched at a collapsed box's
            center. */}
        <div
          data-stage-box="true"
          className="relative"
          style={{
            aspectRatio: ratioToAspectCss(stageRatio),
            width: "100%",
            maxWidth: stageWidthCap(stageRatio),
          }}
        >
          {showGeneratingPlaceholder ? (
            <div
              className="absolute inset-0 rounded-lg border border-border bg-cream-deep stage-pulse"
              aria-hidden="true"
            />
          ) : (
            <div
              className={`absolute inset-0 rounded-lg overflow-hidden bg-cream-deep border transition-colors ${
                isPreviewing ? "border-dashed border-accent/60" : "border-border"
              } ${isResuming ? "loupe-fade-in" : ""}`}
            >
              {previous && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previous}
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

                  `key={current}` is safe here even though it forces a
                  remount: by the time `current` updates, the browser has
                  already decoded this exact url once via the offscreen
                  preloader above, so the remounted element paints from
                  that decode instantly instead of loading from scratch. */}
              {current && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={current}
                  src={current}
                  alt={node.prompt}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-150 ${
                    previous ? "loupe-fade-in" : ""
                  } ${isSwitching ? "opacity-50" : "opacity-100"}`}
                />
              )}

              {/* Feedback for the gap between clicking prev/next (or a
                  filmstrip thumbnail) and that image actually finishing
                  its decode — without this, a click on an uncached image
                  looked dropped, since `current` doesn't change until
                  decode completes. Suppressed while isPreviewing, which
                  already has its own status pill for the same corner. */}
              {isSwitching && !isPreviewing && (
                <div
                  className="absolute top-2 left-2 flex items-center gap-1.5 h-6 px-2 rounded-full bg-black/60 backdrop-blur-sm text-white"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 size={11} className="animate-spin" aria-hidden="true" />
                  <span className="text-[10px] font-mono uppercase tracking-wide">
                    Loading…
                  </span>
                </div>
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
                  <IconTooltip label="Discard preview" align="left">
                    <button
                      type="button"
                      onClick={onDiscardPreview}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                      aria-label="Discard preview"
                    >
                      <X size={10} />
                    </button>
                  </IconTooltip>
                </div>
              )}
            </div>
          )}

          {/* Prev/next siblings without touching the filmstrip */}
          {node.images.length > 1 && !showGeneratingPlaceholder && (
            <>
              <IconTooltip
                label="Previous variant"
                className="absolute left-1.5 top-1/2 -translate-y-1/2"
              >
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={imageIndex === 0}
                  className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm disabled:opacity-0 transition-opacity hover:bg-black/75"
                  aria-label="Previous variant"
                >
                  <ChevronLeft size={16} />
                </button>
              </IconTooltip>
              <IconTooltip
                label="Next variant"
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
              >
                <button
                  type="button"
                  onClick={onNext}
                  disabled={imageIndex === node.images.length - 1}
                  className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm disabled:opacity-0 transition-opacity hover:bg-black/75"
                  aria-label="Next variant"
                >
                  <ChevronRight size={16} />
                </button>
              </IconTooltip>
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
                align="right"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoupeButton({ icon, label, onClick, active, disabled, align = "center" }) {
  return (
    <IconTooltip label={label} align={align}>
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
    </IconTooltip>
  );
}