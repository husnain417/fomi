"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, PanelLeftClose, PanelLeftOpen, Plus, GitBranch, List } from "lucide-react";
import ThreadNode from "./ThreadNode";

const MIN_WIDTH = 240;
const MAX_WIDTH = 440;
const DEFAULT_WIDTH = 280;
const WIDTH_STORAGE_KEY = "studio-thread-rail-width";
const VIEW_MODE_STORAGE_KEY = "studio-thread-view-mode";

function clampWidth(w) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w));
}

/** Recursively renders a node and its children as a nested, connector-lined
 * list. Every edge in this list IS a branch — there's no special-cased
 * "main line" vs "fork": a node with one child still reads as a
 * continuous thread, and a node with several children naturally fans out
 * with each sibling getting its own elbow connector off the trunk. */
function ThreadBranch({
  nodeIds,
  nodesById,
  childrenByParent,
  depth,
  parentLabel,
  selectedNodeId,
  branchContextId,
  justAddedId,
  compareSet,
  onSelect,
  registerRef,
}) {
  return (
    <ul className={depth > 0 ? "thread-children" : "flex flex-col gap-0.5"}>
      {nodeIds.map((id, i) => {
        const node = nodesById[id];
        const children = childrenByParent[id] || [];
        const nodeWithCount = { ...node, childCount: children.length };
        return (
          <li key={id} className="relative">
            <ThreadNode
              node={nodeWithCount}
              depth={depth}
              siblingIndex={i}
              siblingCount={nodeIds.length}
              parentLabel={parentLabel}
              isSelected={selectedNodeId === id}
              isBranchTarget={branchContextId === id}
              isNew={justAddedId === id}
              isLastChild={i === nodeIds.length - 1}
              compareSelected={compareSet.has(id)}
              onSelect={onSelect}
              registerRef={(el) => registerRef(id, el)}
            />
            {children.length > 0 && (
              <ThreadBranch
                nodeIds={children}
                nodesById={nodesById}
                childrenByParent={childrenByParent}
                depth={depth + 1}
                parentLabel={node.prompt}
                selectedNodeId={selectedNodeId}
                branchContextId={branchContextId}
                justAddedId={justAddedId}
                compareSet={compareSet}
                onSelect={onSelect}
                registerRef={registerRef}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** The "simple list" alternative to the tree: every node, flattened, most
 * recent first — no nesting, no connectors, the way history looked before
 * Threads existed. Still surfaces branch counts (via childCount) so
 * switching views doesn't hide that structure exists, just how it's laid
 * out. */
function FlatThreadList({
  nodesById,
  childrenByParent,
  selectedNodeId,
  branchContextId,
  justAddedId,
  compareSet,
  onSelect,
  registerRef,
}) {
  const sorted = useMemo(
    () =>
      Object.values(nodesById).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [nodesById]
  );

  return (
    <ul className="flex flex-col gap-0.5">
      {sorted.map((node) => {
        const children = childrenByParent[node.id] || [];
        const nodeWithCount = { ...node, childCount: children.length };
        return (
          <li key={node.id} className="relative">
            <ThreadNode
              node={nodeWithCount}
              depth={0}
              siblingIndex={0}
              siblingCount={1}
              parentLabel={null}
              isSelected={selectedNodeId === node.id}
              isBranchTarget={branchContextId === node.id}
              isNew={justAddedId === node.id}
              isLastChild
              compareSelected={compareSet.has(node.id)}
              onSelect={onSelect}
              registerRef={(el) => registerRef(node.id, el)}
            />
          </li>
        );
      })}
    </ul>
  );
}

export default function ThreadRail({
  collapsed,
  onToggleCollapsed,
  overlayOpen,
  onOpenOverlay,
  onCloseOverlay,
  onNewThread,
  orderedRootIds,
  nodesById,
  childrenByParent,
  selectedNodeId,
  branchContextId,
  justAddedId,
  compareSet,
  onSelectNode,
}) {
  const nodeRefs = useRef({});
  const registerRef = useCallback((id, el) => {
    if (el) nodeRefs.current[id] = el;
    else delete nodeRefs.current[id];
  }, []);

  const [viewMode, setViewMode] = useState("tree"); // "tree" | "list"
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStateRef = useRef({ startX: 0, startWidth: DEFAULT_WIDTH });

  // Read persisted rail width / view mode after mount only, so the first
  // client render matches the server-rendered defaults (no hydration
  // mismatch), then settles into whatever the person left it at.
  useEffect(() => {
    try {
      const storedWidth = parseInt(
        window.localStorage.getItem(WIDTH_STORAGE_KEY),
        10
      );
      if (Number.isFinite(storedWidth)) setWidth(clampWidth(storedWidth));
      const storedView = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (storedView === "tree" || storedView === "list") setViewMode(storedView);
    } catch (e) {
      // localStorage unavailable (private mode, etc.) — defaults stand.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(WIDTH_STORAGE_KEY, String(width));
    } catch (e) {
      /* ignore */
    }
  }, [width]);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch (e) {
      /* ignore */
    }
  }, [viewMode]);

  const handleResizeStart = useCallback(
    (e) => {
      e.preventDefault();
      resizeStateRef.current = { startX: e.clientX, startWidth: width };
      setIsResizing(true);
    },
    [width]
  );

  useEffect(() => {
    if (!isResizing) return;
    function onMove(e) {
      const { startX, startWidth } = resizeStateRef.current;
      setWidth(clampWidth(startWidth + (e.clientX - startX)));
    }
    function onUp() {
      setIsResizing(false);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isResizing]);

  // Flat visual order (depth-first for the tree, most-recent-first for the
  // list) so ArrowUp/ArrowDown move through whichever layout is showing,
  // the same way a person reads it top to bottom.
  const flatOrder = useMemo(() => {
    if (viewMode === "list") {
      return Object.values(nodesById)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((n) => n.id);
    }
    const order = [];
    function walk(id) {
      order.push(id);
      (childrenByParent[id] || []).forEach(walk);
    }
    orderedRootIds.forEach(walk);
    return order;
  }, [viewMode, nodesById, orderedRootIds, childrenByParent]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const idx = flatOrder.indexOf(selectedNodeId);
      const nextIdx =
        e.key === "ArrowDown"
          ? Math.min(flatOrder.length - 1, idx + 1)
          : Math.max(0, idx - 1);
      const nextId = flatOrder[nextIdx];
      if (nextId) {
        onSelectNode(nextId);
        nodeRefs.current[nextId]?.focus();
      }
    },
    [flatOrder, selectedNodeId, onSelectNode]
  );

  const recentFive = flatOrder.slice(0, 5);

  const toolbar = (
    <div className="flex items-center gap-1.5 px-2 pt-2 pb-1.5 shrink-0">
      <button
        type="button"
        onClick={onNewThread}
        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-md bg-accent text-white text-[12px] font-medium hover:bg-accent-dark transition-colors"
      >
        <Plus size={14} />
        New thread
      </button>
      <div
        className="flex items-center rounded-md border border-border p-0.5 shrink-0"
        role="radiogroup"
        aria-label="Thread view"
      >
        <button
          type="button"
          role="radio"
          aria-checked={viewMode === "tree"}
          onClick={() => setViewMode("tree")}
          title="Branching view"
          aria-label="Branching view"
          className={`w-7 h-7 rounded flex items-center rounded-md justify-center transition-colors ${
            viewMode === "tree"
              ? "bg-accent-soft text-accent-dark"
              : "text-muted hover:text-ink"
          }`}
        >
          <GitBranch size={14} />
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={viewMode === "list"}
          onClick={() => setViewMode("list")}
          title="Simple list view"
          aria-label="Simple list view"
          className={`w-7 h-7 rounded flex items-center rounded-md justify-center transition-colors ${
            viewMode === "list"
              ? "bg-accent-soft text-accent-dark"
              : "text-muted hover:text-ink"
          }`}
        >
          <List size={14} />
        </button>
      </div>
    </div>
  );

  const content = (forOverlay) => (
    <div
      className="flex flex-col h-full"
      role="tree"
      aria-label="Generation threads"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between px-3 h-11 shrink-0 border-b border-border">
        <h2 className="font-display text-xs font-medium tracking-wide text-ink-soft uppercase">
          Threads
        </h2>
        <button
          type="button"
          onClick={forOverlay ? onCloseOverlay : onToggleCollapsed}
          className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-cream-deep transition-colors"
          aria-label={forOverlay ? "Close threads" : "Collapse threads"}
          title={forOverlay ? "Close threads" : "Collapse threads"}
        >
          {forOverlay ? <X size={16} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {toolbar}

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {viewMode === "tree" ? (
          <ThreadBranch
            nodeIds={orderedRootIds}
            nodesById={nodesById}
            childrenByParent={childrenByParent}
            depth={0}
            parentLabel={null}
            selectedNodeId={selectedNodeId}
            branchContextId={branchContextId}
            justAddedId={justAddedId}
            compareSet={compareSet}
            onSelect={onSelectNode}
            registerRef={registerRef}
          />
        ) : (
          <FlatThreadList
            nodesById={nodesById}
            childrenByParent={childrenByParent}
            selectedNodeId={selectedNodeId}
            branchContextId={branchContextId}
            justAddedId={justAddedId}
            compareSet={compareSet}
            onSelect={onSelectNode}
            registerRef={registerRef}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Tablet (768-1023): icon-only strip, always present at this width,
          expands into the full overlay on tap. */}
      <div className="hidden md:flex lg:hidden w-11 shrink-0 border-r border-border flex-col items-center py-3 gap-2">
        <button
          type="button"
          onClick={onNewThread}
          className="p-2 rounded-md bg-accent text-white hover:bg-accent-dark transition-colors"
          aria-label="New thread"
          title="New thread"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={onOpenOverlay}
          className="p-2 rounded-md text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors"
          aria-label="Expand threads"
          title="Expand threads"
        >
          <PanelLeftOpen size={16} />
        </button>
        <div className="w-full h-px bg-border" />
        {recentFive.map((id) => {
          const n = nodesById[id];
          const thumb = n.images[n.favoriteImageIndex ?? 0]?.url;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectNode(id)}
              className={`w-8 h-8 rounded-md overflow-hidden border-2 shrink-0 ${
                selectedNodeId === id ? "border-accent" : "border-transparent"
              }`}
              aria-label={n.prompt}
              title={n.prompt}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb} alt="" className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>

      {/* Desktop (>=1024): full rail, or its own manually-collapsed icon
          strip if the person toggled it closed. Resizable by dragging the
          right edge; width persists across visits. */}
      {collapsed ? (
        <div className="hidden lg:flex w-11 shrink-0 border-r border-border flex-col items-center py-3 gap-2">
          <button
            type="button"
            onClick={onNewThread}
            className="p-2 rounded-md bg-accent text-white hover:bg-accent-dark transition-colors"
            aria-label="New thread"
            title="New thread"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="p-2 rounded-md text-ink-soft hover:text-ink hover:bg-cream-deep transition-colors"
            aria-label="Expand threads"
            title="Expand threads"
          >
            <PanelLeftOpen size={16} />
          </button>
        </div>
      ) : (
        <div
          className="hidden lg:flex relative shrink-0 border-r border-border bg-studio-surface-raised flex-col"
          style={{ width }}
        >
          {content(false)}
          {/* Drag handle: grab the right edge to resize. A thin visible
              line with a wider invisible hit target, so it's easy to grab
              without stealing space from the panel at rest. */}
          <div
            onPointerDown={handleResizeStart}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize threads panel"
            aria-valuenow={width}
            aria-valuemin={MIN_WIDTH}
            aria-valuemax={MAX_WIDTH}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setWidth((w) => clampWidth(w - 16));
              if (e.key === "ArrowRight") setWidth((w) => clampWidth(w + 16));
            }}
            className="absolute top-0 right-0 -mr-1.5 w-3 h-full cursor-col-resize group z-10 flex justify-center outline-none"
          >
            {/* Always-faint line so the panel reads as resizable at rest,
                not just on hover — a hover-only 1px line is effectively
                undiscoverable. Brightens on hover/drag. */}
            <div
              className={`w-px h-full transition-colors ${
                isResizing
                  ? "bg-accent"
                  : "bg-border group-hover:bg-accent"
              }`}
            />
            {/* Grip-dots: a small, always-visible affordance at the
                vertical center, the way panel resize handles in Figma/
                VS Code hint themselves without needing a hover first. */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 transition-colors ${
                isResizing ? "text-accent" : "text-muted group-hover:text-accent"
              }`}
            >
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile + tablet overlay: full slide-over, reached via the top
          bar's menu icon (mobile) or the icon strip's expand button
          (tablet). */}
      {overlayOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCloseOverlay}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-xs bg-studio-surface-raised shadow-xl slide-in-left">
            {content(true)}
          </div>
        </div>
      )}
    </>
  );
}
