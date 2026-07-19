"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  GitBranch,
  Columns2,
  Download,
  Sun,
  Moon,
  Cpu,
  RectangleHorizontal,
} from "lucide-react";

import StudioTopBar from "@/components/studio/StudioTopBar";
import ThreadRail from "@/components/studio/ThreadRail";
import Loupe from "@/components/studio/Loupe";
import Filmstrip from "@/components/studio/Filmstrip";
import CompareView from "@/components/studio/CompareView";
import Inspector from "@/components/studio/Inspector";
import Composer from "@/components/studio/Composer";
import CommandPalette from "@/components/studio/CommandPalette";
import NewThreadState from "@/components/studio/NewThreadState";

import { useThreadTree } from "@/hooks/useThreadTree";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { useAutosaveStatus } from "@/hooks/useAutosaveStatus";
import { useStudioThemeInit } from "@/hooks/useStudioThemeInit";
import { useTheme } from "@/hooks/useTheme";
import { usePreviewSteering } from "@/hooks/usePreviewSteering";
import { studioModels, studioRatios } from "@/data/studioMock";

const DEFAULT_MODEL = studioModels[0].name;
const DEFAULT_RATIO = "4:5";

export default function StudioPage() {
  useStudioThemeInit();
  const { theme, toggleTheme } = useTheme();
  const thread = useThreadTree();
  const palette = useCommandPalette();

  const [projectName, setProjectName] = useState("Redhead Editorial — July Shoot");
  const [composerValue, setComposerValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  const [defaultModel, setDefaultModel] = useState(DEFAULT_MODEL);
  const [defaultRatio, setDefaultRatio] = useState(DEFAULT_RATIO);
  const [branchDraft, setBranchDraft] = useState(null);
  // Ratio a commit-in-flight generation was submitted with, so the Loupe's
  // pulse placeholder (§3) can size itself correctly. Only read while
  // isGenerating is true.
  const [pendingRatio, setPendingRatio] = useState(DEFAULT_RATIO);

  const branchTargetNode = thread.branchContextId
    ? thread.nodesById[thread.branchContextId]
    : null;

  // Disposable Strength-steering preview for the branch in progress. Fully
  // decoupled from useThreadTree — see hooks/usePreviewSteering.js.
  const preview = usePreviewSteering({
    branchContextId: thread.branchContextId,
    parentPrompt: branchTargetNode?.prompt,
  });

  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState([]); // [{nodeId, imageIndex}]

  const [railCollapsed, setRailCollapsed] = useState(false);
  const [railOverlayOpen, setRailOverlayOpen] = useState(false);
  const [inspectorOverlayOpen, setInspectorOverlayOpen] = useState(false);

  const [isResuming, setIsResuming] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setIsResuming(false), 260);
    return () => window.clearTimeout(t);
  }, []);

  const composerRef = useRef(null);
  const paletteTriggerRef = useRef(null);

  const autosaveKey = useMemo(
    () => ({}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thread.nodesById, projectName]
  );
  const saveStatus = useAutosaveStatus(autosaveKey);

  // ---- selection / branch context -----------------------------------
  useEffect(() => {
    if (!thread.branchContextId) {
      setBranchDraft(null);
      return;
    }
    const node = thread.nodesById[thread.branchContextId];
    if (!node) return;
    setBranchDraft({
      model: node.model,
      ratio: node.ratio,
      strength: node.strength ?? 0.4,
      parentPromptPreview: node.prompt,
    });
    setComposerValue(node.prompt);
    composerRef.current?.focus();
    // Deliberately only re-runs when the branch *target* changes, not on
    // every nodesById update (e.g. a favorite toggled elsewhere) — that
    // would otherwise clobber in-progress edits to the branch draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.branchContextId]);

  const handleSelectNode = useCallback(
    (id) => {
      thread.selectNode(id);
      setRailOverlayOpen(false);
    },
    [thread]
  );

  // ---- compare selection ----------------------------------------------
  const compareKey = (nodeId, imageIndex) => `${nodeId}:${imageIndex}`;
  const compareSet = useMemo(
    () => new Set(compareSelection.map((c) => c.nodeId)),
    [compareSelection]
  );
  const isInCompare = useCallback(
    (nodeId, imageIndex) =>
      compareSelection.some(
        (c) => c.nodeId === nodeId && c.imageIndex === imageIndex
      ),
    [compareSelection]
  );

  const toggleCompareImage = useCallback(
    (nodeId, imageIndex) => {
      const exists = compareSelection.some(
        (c) => c.nodeId === nodeId && c.imageIndex === imageIndex
      );
      if (exists) {
        setCompareSelection((prev) =>
          prev.filter(
            (c) => !(c.nodeId === nodeId && c.imageIndex === imageIndex)
          )
        );
        return;
      }
      if (compareSelection.length >= 4) return; // 2-4 panes, cap at 4
      // Compare mode has no standalone entry point anymore (§2.2) — it
      // activates automatically the instant a second image joins the set.
      const enteringCompare = compareSelection.length === 1;
      setCompareSelection((prev) => [...prev, { nodeId, imageIndex }]);
      if (enteringCompare) setCompareMode(true);
    },
    [compareSelection]
  );

  const removeFromCompare = useCallback((key) => {
    setCompareSelection((prev) =>
      prev.filter((c) => compareKey(c.nodeId, c.imageIndex) !== key)
    );
  }, []);

  const compareItems = useMemo(
    () =>
      compareSelection
        .map((c) => {
          const node = thread.nodesById[c.nodeId];
          if (!node) return null;
          return {
            key: compareKey(c.nodeId, c.imageIndex),
            node,
            imageIndex: c.imageIndex,
          };
        })
        .filter(Boolean),
    [compareSelection, thread.nodesById]
  );

  // ---- generation -------------------------------------------------------
  async function handleGenerate() {
    const prompt = composerValue.trim();
    if (!prompt || isGenerating) return;

    const branching = Boolean(thread.branchContextId);
    const model = branching ? branchDraft.model : defaultModel;
    const ratio = branching ? branchDraft.ratio : defaultRatio;
    const strength = branching ? branchDraft.strength : undefined;
    const parentId = thread.branchContextId || null;

    setPendingRatio(ratio);
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: "image", count: 4, ratio, model, parentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Generation failed.");

      thread.addGeneration({
        prompt,
        model: model || DEFAULT_MODEL,
        ratio,
        strength,
        seed: data.id,
        parentId,
        images: data.images.map((img) => ({ id: img.id, url: img.url })),
      });
      setComposerValue("");
      // Generate is the only action that writes to history — once it
      // lands, the disposable preview that got us here has served its
      // purpose and shouldn't linger over the newly-committed node.
      preview.discardPreview();
    } catch (err) {
      setGenerateError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Strength and Ratio are both wired into live preview while branching
  // (see PRODUCT_THINKING.md §3) — Model stays request-only, since
  // swapping it changes too much about the result to read as "steering"
  // rather than "a different result."
  function handleStrengthChange(strength) {
    if (!thread.branchContextId || !branchDraft) return;
    preview.requestPreview({
      model: branchDraft.model,
      ratio: branchDraft.ratio,
      strength,
    });
  }

  function handleRatioChange(ratio) {
    if (!thread.branchContextId || !branchDraft) return;
    preview.requestPreview({
      model: branchDraft.model,
      ratio,
      strength: branchDraft.strength,
    });
  }

  function handleExport() {
    const node = thread.selectedNode;
    const image = node?.images[thread.selectedImageIndex];
    if (image?.url) window.open(image.url, "_blank", "noopener,noreferrer");
  }

  // Shared by the rail's "New thread" button and the command palette's
  // "New thread" action. Clears selection entirely (not just the branch
  // context) so the main stage actually swaps to the empty "start a new
  // thread" state instead of silently keeping the last-viewed result on
  // screen — that mismatch was the original bug report.
  function handleNewThread() {
    thread.startNewThread();
    setComposerValue("");
    setCompareMode(false);
    composerRef.current?.focus();
  }

  // ---- command palette actions ------------------------------------------
  const actions = useMemo(() => {
    const list = [
      {
        id: "new-thread",
        group: "Thread",
        label: "New thread",
        icon: Plus,
        run: handleNewThread,
      },
      {
        id: "branch-selection",
        group: "Thread",
        label: thread.selectedNode
          ? `Branch from "${thread.selectedNode.prompt.slice(0, 30)}…"`
          : "Branch from selection",
        icon: GitBranch,
        run: () => {
          if (thread.selectedNodeId) thread.startBranch(thread.selectedNodeId);
        },
      },
      {
        id: "compare-selected",
        group: "View",
        label: `Compare selected (${compareSelection.length})`,
        hint: compareSelection.length < 2 ? "needs 2+" : undefined,
        icon: Columns2,
        run: () => {
          if (compareSelection.length >= 2) setCompareMode(true);
        },
      },
      {
        id: "export",
        group: "Thread",
        label: "Export current result",
        icon: Download,
        run: handleExport,
      },
      {
        id: "toggle-theme",
        group: "View",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        icon: theme === "dark" ? Sun : Moon,
        run: toggleTheme,
      },
    ];

    const activeModel = thread.branchContextId ? branchDraft?.model : defaultModel;
    const activeRatio = thread.branchContextId ? branchDraft?.ratio : defaultRatio;

    studioModels.forEach((m) => {
      list.push({
        id: `model-${m.id}`,
        group: "Model",
        label: `Set model: ${m.name}`,
        icon: Cpu,
        checked: m.name === activeModel,
        keepOpen: true,
        run: () => {
          if (thread.branchContextId) {
            setBranchDraft((d) => (d ? { ...d, model: m.name } : d));
          } else {
            setDefaultModel(m.name);
          }
        },
      });
    });

    studioRatios.forEach((r) => {
      list.push({
        id: `ratio-${r}`,
        group: "Ratio",
        label: `Set ratio: ${r}`,
        icon: RectangleHorizontal,
        checked: r === activeRatio,
        keepOpen: true,
        run: () => {
          if (thread.branchContextId) {
            setBranchDraft((d) => (d ? { ...d, ratio: r } : d));
          } else {
            setDefaultRatio(r);
          }
        },
      });
    });

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    thread.selectedNode,
    thread.selectedNodeId,
    thread.branchContextId,
    compareSelection,
    theme,
    defaultModel,
    defaultRatio,
    branchDraft,
  ]);

  // ---- inspector mode -----------------------------------------------
  const inspectorMode = thread.branchContextId
    ? "branch"
    : thread.selectedNode
    ? "view"
    : "empty";

  const selectedImage = thread.selectedNode?.images[thread.selectedImageIndex];
  const selectedIsCompared = selectedImage
    ? isInCompare(thread.selectedNodeId, thread.selectedImageIndex)
    : false;

  return (
    <div className="h-dvh flex flex-col bg-cream text-ink font-body overflow-hidden">
      <StudioTopBar
        projectName={projectName}
        onRenameProject={setProjectName}
        saveStatus={saveStatus}
        onOpenThreads={() => setRailOverlayOpen(true)}
        onOpenInspector={() => setInspectorOverlayOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 min-h-0 flex">
        <ThreadRail
          collapsed={railCollapsed}
          onToggleCollapsed={() => setRailCollapsed((v) => !v)}
          overlayOpen={railOverlayOpen}
          onOpenOverlay={() => setRailOverlayOpen(true)}
          onCloseOverlay={() => setRailOverlayOpen(false)}
          onNewThread={handleNewThread}
          orderedRootIds={thread.orderedRootIds}
          nodesById={thread.nodesById}
          childrenByParent={thread.childrenByParent}
          selectedNodeId={thread.selectedNodeId}
          branchContextId={thread.branchContextId}
          justAddedId={thread.justAddedId}
          compareSet={compareSet}
          onSelectNode={handleSelectNode}
        />

        <main className="flex-1 min-w-0 flex flex-col">
          {compareMode ? (
            <CompareView
              items={compareItems}
              onRemove={removeFromCompare}
              onExitCompare={() => setCompareMode(false)}
            />
          ) : !thread.selectedNode ? (
            <NewThreadState activeModel={defaultModel} activeRatio={defaultRatio} />
          ) : (
            <>
              <Loupe
                node={thread.selectedNode}
                imageIndex={thread.selectedImageIndex}
                isResuming={isResuming}
                compareSelected={selectedIsCompared}
                compareFull={compareSelection.length >= 4}
                isGenerating={isGenerating}
                pendingRatio={pendingRatio}
                previewImage={preview.previewImage}
                previewStatus={preview.status}
                onDiscardPreview={preview.discardPreview}
                onPrev={() =>
                  thread.selectImageIndex(
                    Math.max(0, thread.selectedImageIndex - 1)
                  )
                }
                onNext={() =>
                  thread.selectImageIndex(
                    Math.min(
                      (thread.selectedNode?.images.length || 1) - 1,
                      thread.selectedImageIndex + 1
                    )
                  )
                }
                onToggleFavorite={(idx) =>
                  thread.toggleFavorite(thread.selectedNodeId, idx)
                }
                onBranch={() => thread.startBranch(thread.selectedNodeId)}
                onToggleCompare={() =>
                  toggleCompareImage(thread.selectedNodeId, thread.selectedImageIndex)
                }
              />
              <Filmstrip
                node={thread.selectedNode}
                selectedIndex={thread.selectedImageIndex}
                onSelect={thread.selectImageIndex}
              />
            </>
          )}

          {generateError && (
            <p
              role="alert"
              className="px-3 sm:px-6 py-1.5 text-[12px] text-error bg-error-soft border-t border-error-soft"
            >
              {generateError}
            </p>
          )}

          <Composer
            value={composerValue}
            onChange={setComposerValue}
            onSubmit={handleGenerate}
            isGenerating={isGenerating}
            branchTargetNode={
              thread.branchContextId ? thread.nodesById[thread.branchContextId] : null
            }
            onCancelBranch={thread.cancelBranch}
            onOpenPalette={palette.toggle}
            inputRef={composerRef}
            paletteButtonRef={paletteTriggerRef}
            activeModel={branchDraft ? branchDraft.model : defaultModel}
            activeRatio={branchDraft ? branchDraft.ratio : defaultRatio}
          />
        </main>

        <Inspector
          overlayOpen={inspectorOverlayOpen}
          mode={inspectorMode}
          viewedNode={thread.selectedNode}
          viewedImageIndex={thread.selectedImageIndex}
          branchDraft={branchDraft}
          onChangeDraft={(patch) => setBranchDraft((d) => (d ? { ...d, ...patch } : d))}
          onStrengthChange={handleStrengthChange}
          onRatioChange={handleRatioChange}
          onCancelBranch={thread.cancelBranch}
          onCloseOverlay={() => setInspectorOverlayOpen(false)}
        />
      </div>

      <CommandPalette
        open={palette.open}
        onClose={palette.close}
        actions={actions}
        triggerRef={paletteTriggerRef}
      />
    </div>
  );
}