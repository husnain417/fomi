"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Flips to "saving" whenever `watchedValue` changes identity, then back to
 * "saved" after a short simulated write delay. Skips the very first run
 * (mount) so the indicator doesn't announce "Saving…" for data that was
 * already there when the workspace opened — only real edits trigger it.
 */
export function useAutosaveStatus(watchedValue, delay = 600) {
  const [status, setStatus] = useState("saved");
  const isFirstRun = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setStatus("saving");
    clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setStatus("saved");
    }, delay);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValue]);

  return status;
}
