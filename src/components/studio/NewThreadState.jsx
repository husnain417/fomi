"use client";

import { Sparkles } from "lucide-react";

export default function NewThreadState({ activeModel, activeRatio }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
      <div
        className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center"
        aria-hidden="true"
      >
        <Sparkles size={20} className="text-accent-dark" />
      </div>
      <div className="max-w-xs">
        <p className="text-[13px] font-medium text-ink">New thread</p>
        <p className="text-[13px] text-muted mt-1 leading-relaxed">
          Describe what you want to generate in the composer below — it
          becomes the first result of a new thread.
        </p>
      </div>
      <p className="text-[11px] font-mono text-muted">
        {activeModel} · {activeRatio}
      </p>
    </div>
  );
}
