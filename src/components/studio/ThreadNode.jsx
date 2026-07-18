"use client";

import Image from "next/image";
import { GitBranch, Star } from "lucide-react";

function truncateLabel(prompt, max = 40) {
  if (!prompt) return "Untitled";
  return prompt.length > max ? `${prompt.slice(0, max).trim()}…` : prompt;
}

export default function ThreadNode({
  node,
  depth,
  siblingIndex,
  siblingCount,
  parentLabel,
  isSelected,
  isBranchTarget,
  isNew,
  isLastChild,
  compareSelected,
  onSelect,
  registerRef,
}) {
  const thumb = node.images[node.favoriteImageIndex ?? 0]?.url;
  const branchCount = node.childCount || 0;

  const a11yLabel =
    depth === 0
      ? `${truncateLabel(node.prompt, 60)}, thread`
      : `Branch ${siblingIndex + 1} of ${siblingCount} from ${truncateLabel(
          parentLabel,
          40
        )}`;

  return (
    <div className="relative">
      {depth > 0 && (
        <>
          <span
            className={`thread-elbow ${isNew ? "thread-elbow-grow" : ""}`}
            aria-hidden="true"
          />
          {!isLastChild && (
            <span className="thread-trunk-continue" aria-hidden="true" />
          )}
        </>
      )}

      <button
        ref={registerRef}
        type="button"
        onClick={() => onSelect(node.id)}
        aria-label={a11yLabel}
        aria-current={isSelected ? "true" : undefined}
        data-node-id={node.id}
        className={`thread-node group w-full flex items-center gap-2 rounded-lg pr-2 py-1.5 text-left transition-colors ${
          depth > 0 ? "pl-4" : "pl-2"
        } ${
          isSelected
            ? "bg-accent-soft/60 ring-1 ring-accent-soft"
            : "hover:bg-cream-deep"
        } ${isBranchTarget ? "outline outline-2 outline-accent outline-offset-1" : ""}`}
      >
        <span className="relative shrink-0 w-9 h-9 rounded-md overflow-hidden bg-cream-deep border border-border">
          {thumb && (
            <Image
              src={thumb}
              alt=""
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          )}
          {node.favoriteImageIndex !== null && (
            <Star
              size={10}
              className="absolute top-0.5 right-0.5 fill-accent text-accent drop-shadow"
            />
          )}
          {compareSelected && (
            <span className="absolute inset-0 ring-2 ring-inset ring-studio-live rounded-md" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[13px] leading-snug text-ink truncate">
            {truncateLabel(node.prompt)}
          </span>
          <span className="block text-[11px] text-muted truncate font-mono">
            {node.model} · {node.ratio}
          </span>
        </span>

        {branchCount > 0 && (
          <span
            className="shrink-0 flex items-center gap-0.5 text-[10px] text-muted"
            title={`${branchCount} branch${branchCount === 1 ? "" : "es"}`}
          >
            <GitBranch size={11} />
            {branchCount}
          </span>
        )}
      </button>
    </div>
  );
}
