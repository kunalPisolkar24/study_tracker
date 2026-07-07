"use client";

import { create } from "zustand";
import type { NodeStoreItem, NodeActivityEntry, NodeActivityAction, CreateNodeInput, UpdateNodeInput } from "@/types/node";
import { createNodeStoreItem, updateNodeStoreItem, generateId } from "@/lib/node-factories";
import { SEED_NODES, deriveSeedActivityLogs } from "@/lib/seed-data-node";

interface NodeStoreState {
  nodes: NodeStoreItem[];
  activityLogs: NodeActivityEntry[];
  hydrated: boolean;
}

interface NodeStoreActions {
  addNode: (input: CreateNodeInput) => string;
  updateNode: (id: string, input: UpdateNodeInput) => void;
  removeNode: (id: string) => void;
  reorderSiblings: (parentId: string | null, workspaceId: string, orderedIds: string[]) => void;
  getWorkspaceNodes: (workspaceId: string) => NodeStoreItem[];
  getWorkspaceActivityLogs: (workspaceId: string) => NodeActivityEntry[];
}

type NodeStore = NodeStoreState & NodeStoreActions;

export const useNodeStore = create<NodeStore>((set, get) => ({
  nodes: SEED_NODES,
  activityLogs: deriveSeedActivityLogs(SEED_NODES),
  hydrated: true,

  addNode: (input) => {
    const siblings = get().nodes.filter(
      (n) => n.parentId === (input.parentId ?? null) && n.workspaceId === input.workspaceId,
    );
    const orderIndex = siblings.length;
    const node = createNodeStoreItem(input, orderIndex);
    const now = new Date().toISOString();
    const log: NodeActivityEntry = {
      id: generateId(),
      nodeId: node.id,
      workspaceId: node.workspaceId,
      action: "created",
      timestamp: now,
    };
    set((state) => ({
      nodes: [...state.nodes, node],
      activityLogs: [...state.activityLogs, log],
    }));
    return node.id;
  },

  updateNode: (id, input) => {
    set((state) => {
      const existing = state.nodes.find((n) => n.id === id);
      if (!existing) return state;

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

      return {
        nodes: state.nodes.map((n) => (n.id === id ? updateNodeStoreItem(n, input) : n)),
        activityLogs: [...state.activityLogs, ...logs],
      };
    });
  },

  removeNode: (id) => {
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

  reorderSiblings: (parentId, workspaceId, orderedIds) => {
    set((state) => {
      const reorderIndex = new Map<string, number>();
      orderedIds.forEach((id, i) => reorderIndex.set(id, i));

      const reordered = new Set(orderedIds);

      const intermediate = state.nodes.map((node) => {
        if (node.workspaceId !== workspaceId) return node;
        const newOrder = reorderIndex.get(node.id);
        if (newOrder !== undefined) {
          return { ...node, parentId, orderIndex: newOrder };
        }
        return node;
      });

      const parentBuckets = new Map<string | null, Array<{ id: string; orderIndex: number }>>();
      for (const node of intermediate) {
        if (node.workspaceId !== workspaceId) continue;
        if (reordered.has(node.id)) continue;
        const key = node.parentId;
        if (!parentBuckets.has(key)) parentBuckets.set(key, []);
        parentBuckets.get(key)!.push({ id: node.id, orderIndex: node.orderIndex });
      }

      for (const [, siblings] of parentBuckets) {
        siblings.sort((a, b) => a.orderIndex - b.orderIndex);
      }

      const compactIndex = new Map<string, number>();
      for (const [, siblings] of parentBuckets) {
        for (let i = 0; i < siblings.length; i++) {
          compactIndex.set(siblings[i].id, i);
        }
      }

      return {
        nodes: intermediate.map((node) => {
          if (node.workspaceId !== workspaceId) return node;
          if (reordered.has(node.id)) return node;
          const compact = compactIndex.get(node.id);
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
