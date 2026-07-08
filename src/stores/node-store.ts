"use client";

import { create } from "zustand";
import type { NodeStoreItem, NodeActivityEntry, NodeActivityAction, CreateNodeInput, UpdateNodeInput } from "@/types/node";
import { createNodeStoreItem, updateNodeStoreItem, generateId } from "@/lib/workspace/node-factories";
import {
  addNodeAction,
  updateNodeAction,
  removeNodeAction,
  reorderSiblingsAction,
  fetchAllNodesAction,
  fetchAllActivityLogsAction,
} from "@/lib/actions/node-actions";

interface NodeStoreState {
  nodes: NodeStoreItem[];
  activityLogs: NodeActivityEntry[];
  hydrated: boolean;
}

interface NodeStoreActions {
  hydrate: (userId: string) => Promise<void>;
  addNode: (input: CreateNodeInput) => Promise<string>;
  updateNode: (id: string, input: UpdateNodeInput) => Promise<void>;
  removeNode: (id: string) => Promise<void>;
  reorderSiblings: (parentId: string | null, workspaceId: string, orderedIds: string[]) => Promise<void>;
  getWorkspaceNodes: (workspaceId: string) => NodeStoreItem[];
  getWorkspaceActivityLogs: (workspaceId: string) => NodeActivityEntry[];
}

type NodeStore = NodeStoreState & NodeStoreActions;

export const useNodeStore = create<NodeStore>((set, get) => ({
  nodes: [],
  activityLogs: [],
  hydrated: false,

  hydrate: async (userId: string) => {
    const [nodes, activityLogs] = await Promise.all([
      fetchAllNodesAction(),
      fetchAllActivityLogsAction(),
    ]);
    set({ nodes, activityLogs, hydrated: true });
  },

  addNode: async (input) => {
    const nodeId = await addNodeAction(input);
    const siblings = get().nodes.filter(
      (n) => n.parentId === (input.parentId ?? null) && n.workspaceId === input.workspaceId,
    );
    const orderIndex = siblings.length;
    const node = createNodeStoreItem(input, orderIndex);
    const domainNode = { ...node, id: nodeId };
    const now = new Date().toISOString();
    const log: NodeActivityEntry = {
      id: generateId(),
      nodeId,
      workspaceId: node.workspaceId,
      action: "created",
      timestamp: now,
    };
    set((state) => ({
      nodes: [...state.nodes, domainNode],
      activityLogs: [...state.activityLogs, log],
    }));
    return nodeId;
  },

  updateNode: async (id, input) => {
    const existing = get().nodes.find((n) => n.id === id);
    if (!existing) return;

    const now = new Date().toISOString();
    const logs: NodeActivityEntry[] = [];

    if (input.status !== undefined && input.status !== existing.status) {
      const action: NodeActivityAction =
        input.status === "done" ? "marked_done"
        : input.status === "in_progress" ? "marked_in_progress"
        : "marked_not_started";
      logs.push({
        id: generateId(),
        nodeId: id,
        workspaceId: existing.workspaceId,
        action,
        timestamp: now,
      });
    }
    if (input.confidence !== undefined && input.confidence !== existing.confidence) {
      logs.push({
        id: generateId(),
        nodeId: id,
        workspaceId: existing.workspaceId,
        action: "confidence_changed",
        timestamp: now,
      });
    }

    await updateNodeAction(id, input);

    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? updateNodeStoreItem(n, input) : n)),
      activityLogs: [...state.activityLogs, ...logs],
    }));
  },

  removeNode: async (id) => {
    await removeNodeAction(id);
    set((state) => {
      const idsToRemove = new Set<string>();
      function collectDescendants(nodeId: string) {
        idsToRemove.add(nodeId);
        state.nodes.filter((n) => n.parentId === nodeId).forEach((child) => collectDescendants(child.id));
      }
      collectDescendants(id);
      return { nodes: state.nodes.filter((n) => !idsToRemove.has(n.id)) };
    });
  },

  reorderSiblings: async (parentId, workspaceId, orderedIds) => {
    await reorderSiblingsAction(parentId, workspaceId, orderedIds);
    set((state) => {
      const reorderIndex = new Map(orderedIds.map((id, i) => [id, i]));

      // Apply reordered positions
      const intermediate = state.nodes.map((node) => {
        if (node.workspaceId !== workspaceId) return node;
        const idx = reorderIndex.get(node.id);
        if (idx !== undefined) return { ...node, parentId, orderIndex: idx };
        return node;
      });

      // Collect ALL nodes per parent (both reordered and non-reordered)
      const parentBuckets = new Map<string | null, Array<{ id: string; orderIndex: number }>>();
      for (const node of intermediate) {
        if (node.workspaceId !== workspaceId) continue;
        const key = node.parentId;
        if (!parentBuckets.has(key)) parentBuckets.set(key, []);
        parentBuckets.get(key)!.push({ id: node.id, orderIndex: node.orderIndex });
      }

      // Sort each bucket by orderIndex and assign dense indices
      const finalOrderIndex = new Map<string, number>();
      for (const [, siblings] of parentBuckets) {
        siblings.sort((a, b) => a.orderIndex - b.orderIndex);
        siblings.forEach((s, i) => finalOrderIndex.set(s.id, i));
      }

      return {
        nodes: intermediate.map((node) => {
          if (node.workspaceId !== workspaceId) return node;
          const compact = finalOrderIndex.get(node.id);
          if (compact !== undefined && compact !== node.orderIndex) {
            return { ...node, orderIndex: compact };
          }
          return node;
        }),
      };
    });
  },

  getWorkspaceNodes: (workspaceId) => {
    return get().nodes.filter((n) => n.workspaceId === workspaceId);
  },

  getWorkspaceActivityLogs: (workspaceId) => {
    return get().activityLogs.filter((l) => l.workspaceId === workspaceId);
  },
}));
