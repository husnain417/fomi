"use client";

import { useCallback, useRef } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, LogOut } from "lucide-react";
import { useSyncedZoom } from "@/hooks/useSyncedZoom";

function truncate(text, max = 46) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function ExitCompareButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 h-7 px-2 rounded-md text-[11px] font-medium text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors"
    >
      <LogOut size={13} />
      <span>Exit compare</span>
    </button>
  );
}

export default function CompareView({ items, onRemove, onExitCompare }) {
  const { transform, zoomAt, panBy, reset } = useSyncedZoom();
  const dragState = useRef(null);

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      zoomAt(e.deltaY);
    },
    [zoomAt]
  );

  const handlePointerDown = useCallback((e) => {
    dragState.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragState.current) return;
      const dx = e.clientX - dragState.current.x;
      const dy = e.clientY - dragState.current.y;
      dragState.current = { x: e.clientX, y: e.clientY };
      panBy(dx, dy);
    },
    [panBy]
  );

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  if (!items.length) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-end px-3 sm:px-6 h-10 shrink-0 border-b border-border">
          <ExitCompareButton onClick={onExitCompare} />
        </div>
        <div className="flex-1 flex items-center justify-center text-muted text-sm px-6 text-center">
          Add 2–4 results to compare from the Loupe or Threads.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-3 sm:px-6 h-10 shrink-0 border-b border-border">
        <span className="text-xs text-muted">
          Comparing {items.length} result{items.length === 1 ? "" : "s"} ·{" "}
          {Math.round(transform.scale * 100)}%
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => zoomAt(120)}
            className="p-1.5 rounded-md text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            onClick={() => zoomAt(-120)}
            className="p-1.5 rounded-md text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={reset}
            className="p-1.5 rounded-md text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors"
            aria-label="Reset zoom"
          >
            <RotateCcw size={14} />
          </button>
          <span className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />
          <ExitCompareButton onClick={onExitCompare} />
        </div>
      </div>

      <div
        className={`flex-1 min-h-0 grid gap-px bg-border overflow-auto ${
          items.length <= 1
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {items.map((item, i) => (
          <figure
            key={item.key}
            className="relative bg-cream-deep flex flex-col min-h-[220px] sm:min-h-0"
            aria-label={`Compare pane ${i + 1}: ${truncate(item.node.prompt, 60)}`}
          >
            <div
              className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing touch-none"
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.node.images[item.imageIndex]?.url}
                alt={item.node.prompt}
                className="absolute inset-0 w-full h-full object-contain select-none"
                style={{
                  transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                  transformOrigin: "center",
                }}
                draggable={false}
              />
              <button
                type="button"
                onClick={() => onRemove(item.key)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Remove from compare"
              >
                <X size={13} />
              </button>
            </div>
            <figcaption className="px-2.5 py-1.5 text-[11px] text-ink-soft border-t border-border bg-studio-surface-raised truncate">
              {truncate(item.node.prompt)} · variant {item.imageIndex + 1}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
