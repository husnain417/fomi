"use client";

import { useCallback, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 5;

/**
 * A single shared { scale, x, y } lives here and every Compare pane reads
 * from it — so "synced zoom/pan" is just "one state, many consumers"
 * rather than a broadcast/subscribe system. Any pane's wheel/drag handler
 * writes to the same setter, which means every pane necessarily
 * re-renders in the same tick: there's no separate sync step that could
 * lag behind.
 */
export function useSyncedZoom() {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });

  const zoomAt = useCallback((delta, originRatio = { x: 0.5, y: 0.5 }) => {
    setTransform((prev) => {
      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, prev.scale - delta * 0.0015 * prev.scale)
      );
      return { ...prev, scale: nextScale };
    });
  }, []);

  const panBy = useCallback((dx, dy) => {
    setTransform((prev) => {
      if (prev.scale <= MIN_SCALE) return prev;
      return { ...prev, x: prev.x + dx, y: prev.y + dy };
    });
  }, []);

  const reset = useCallback(() => setTransform({ scale: 1, x: 0, y: 0 }), []);

  return { transform, zoomAt, panBy, reset };
}
