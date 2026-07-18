"use client";

import { useCallback, useMemo, useState } from "react";
import {
  seedThreadNodes,
  lastViewedNodeId,
  lastViewedImageIndex,
} from "@/data/studioMock";

function toMap(nodes) {
  const map = {};
  nodes.forEach((n) => {
    map[n.id] = n;
  });
  return map;
}

let nodeCounter = 1000;

/**
 * Owns the branching thread tree: node data, selection, fork/branch
 * context, and favorites. The tree itself is derived (children grouped by
 * parentId) rather than stored, so adding a node is a single flat insert.
 */
export function useThreadTree() {
  const [nodesById, setNodesById] = useState(() => toMap(seedThreadNodes));
  const [rootOrder, setRootOrder] = useState(() =>
    seedThreadNodes.filter((n) => !n.parentId).map((n) => n.id)
  );
  const [selectedNodeId, setSelectedNodeId] = useState(lastViewedNodeId);
  const [selectedImageIndex, setSelectedImageIndexState] = useState(
    lastViewedImageIndex
  );
  // Node currently being branched *from* — drives the Inspector into its
  // editable "new attempt" mode and tells the Composer what parentId to
  // send. Null means "new thread from scratch".
  const [branchContextId, setBranchContextId] = useState(null);
  // Marks the most recently created node so the rail can play the
  // connector-draw animation once, instead of replaying it for the whole
  // tree on every render.
  const [justAddedId, setJustAddedId] = useState(null);

  const childrenByParent = useMemo(() => {
    const map = {};
    Object.values(nodesById).forEach((n) => {
      if (!n.parentId) return;
      if (!map[n.parentId]) map[n.parentId] = [];
      map[n.parentId].push(n.id);
    });
    Object.values(map).forEach((arr) =>
      arr.sort(
        (a, b) =>
          new Date(nodesById[a].createdAt) - new Date(nodesById[b].createdAt)
      )
    );
    return map;
  }, [nodesById]);

  // Most recent activity first, per spec 3.2.
  const orderedRootIds = useMemo(
    () =>
      [...rootOrder].sort(
        (a, b) =>
          new Date(nodesById[b].createdAt) - new Date(nodesById[a].createdAt)
      ),
    [rootOrder, nodesById]
  );

  const selectedNode = selectedNodeId ? nodesById[selectedNodeId] : null;

  const selectNode = useCallback((nodeId, imageIndex = 0) => {
    setSelectedNodeId(nodeId);
    setSelectedImageIndexState(imageIndex);
    setBranchContextId(null);
  }, []);

  const selectImageIndex = useCallback((index) => {
    setSelectedImageIndexState(index);
  }, []);

  const startBranch = useCallback((nodeId) => {
    setBranchContextId(nodeId);
  }, []);

  const cancelBranch = useCallback(() => setBranchContextId(null), []);

  // Clears selection entirely — used by the "New thread" entry points (the
  // rail button and the command palette action). Without this, "new
  // thread" only ever cleared the branch context while a prior result
  // stayed selected, so the Loupe kept showing that old result and the
  // action looked like it did nothing. This is what actually makes the
  // main stage swap to the "start a new thread" empty state.
  const startNewThread = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedImageIndexState(0);
    setBranchContextId(null);
  }, []);

  const toggleFavorite = useCallback((nodeId, imageIndex) => {
    setNodesById((prev) => {
      const n = prev[nodeId];
      if (!n) return prev;
      const isFav = n.favoriteImageIndex === imageIndex;
      return {
        ...prev,
        [nodeId]: { ...n, favoriteImageIndex: isFav ? null : imageIndex },
      };
    });
  }, []);

  /** Adds a new node. If parentId is set this is a branch/fork; otherwise
   * it's a fresh root thread. Returns the new node's id. */
  const addGeneration = useCallback(
    ({ prompt, model, ratio, strength, seed, images, parentId = null }) => {
      nodeCounter += 1;
      const id = `gen-${nodeCounter}`;
      const newNode = {
        id,
        parentId,
        prompt,
        model,
        ratio,
        strength,
        seed,
        createdAt: new Date().toISOString(),
        favoriteImageIndex: null,
        images,
      };
      setNodesById((prev) => ({ ...prev, [id]: newNode }));
      if (!parentId) {
        setRootOrder((prev) => [...prev, id]);
      }
      setSelectedNodeId(id);
      setSelectedImageIndexState(0);
      setBranchContextId(null);
      setJustAddedId(id);
      window.setTimeout(() => {
        setJustAddedId((cur) => (cur === id ? null : cur));
      }, 400);
      return id;
    },
    []
  );

  return {
    nodesById,
    childrenByParent,
    orderedRootIds,
    selectedNodeId,
    selectedNode,
    selectedImageIndex,
    branchContextId,
    branchContextNode: branchContextId ? nodesById[branchContextId] : null,
    justAddedId,
    selectNode,
    selectImageIndex,
    startBranch,
    cancelBranch,
    startNewThread,
    toggleFavorite,
    addGeneration,
  };
}
