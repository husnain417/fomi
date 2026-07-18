"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 400;

/**
 * Disposable, single-image preview fetches for the Strength slider while a
 * branch is in progress. This intentionally never touches useThreadTree —
 * nothing here is history, and it can be cancelled or superseded with zero
 * consequence to the tree. Only Composer's Generate action writes a node.
 *
 * requestPreview() is debounced ~400ms so a slider being dragged doesn't
 * fire a request per tick, and every call aborts whatever request came
 * before it so a slow first request can never resolve after — and clobber
 * the screen with a stale image from — a faster second one.
 */
export function usePreviewSteering({ branchContextId, parentPrompt }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "ready" | "error"

  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  // Bumped on every new request and on discard, so a response that lands
  // after it's been superseded or discarded can recognize it's stale and
  // no-op instead of writing state.
  const requestTokenRef = useRef(0);

  const discardPreview = useCallback(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
    requestTokenRef.current += 1;
    setPreviewImage(null);
    setStatus("idle");
  }, []);

  const requestPreview = useCallback(
    (params) => {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        // A slower in-flight request must never land after this one and
        // show a stale image — abort it before starting the new fetch.
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const token = ++requestTokenRef.current;

        setStatus("loading");

        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: parentPrompt,
            mode: "image",
            count: 1,
            model: params.model,
            ratio: params.ratio,
            strength: params.strength,
            parentId: branchContextId,
          }),
          signal: controller.signal,
        })
          .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (token !== requestTokenRef.current) return; // superseded/discarded
            if (!res.ok) throw new Error(data?.error || "Preview failed.");
            const img = data.images?.[0];
            if (img) setPreviewImage({ url: img.url });
            setStatus("ready");
          })
          .catch((err) => {
            if (err?.name === "AbortError") return;
            if (token !== requestTokenRef.current) return;
            setStatus("error");
          });
      }, DEBOUNCE_MS);
    },
    [branchContextId, parentPrompt]
  );

  // Clear preview state whenever the branch target changes (including
  // going from "no branch" to "a branch", or leaving one — cancelBranch
  // sets branchContextId to null, which lands here too) and on unmount.
  useEffect(() => {
    return () => discardPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchContextId]);

  return { previewImage, status, requestPreview, discardPreview };
}
