"use client";

import { create } from "zustand";
import type { WorkspaceStoreItem, WorkspaceGroupStoreItem } from "@/types/workspace";
import type { CreateWorkspaceInput, CreateWorkspaceGroupInput } from "@/lib/workspace-schemas";
import {
  createWorkspaceStoreItem,
  updateWorkspaceStoreItem,
  createWorkspaceGroupStoreItem,
  updateWorkspaceGroupStoreItem,
} from "@/lib/workspace-factories";

interface WorkspaceStoreState {
  workspaceGroups: WorkspaceGroupStoreItem[];
  workspaces: WorkspaceStoreItem[];
  hydrated: boolean;
}

interface WorkspaceStoreActions {
  addWorkspace: (input: CreateWorkspaceInput) => void;
  updateWorkspace: (id: string, input: CreateWorkspaceInput) => void;
  removeWorkspace: (id: string) => void;
  reassignWorkspace: (id: string, groupId: string | null) => void;
  addGroup: (input: CreateWorkspaceGroupInput) => void;
  updateGroup: (id: string, input: CreateWorkspaceGroupInput) => void;
  removeGroup: (id: string) => void;
  getWorkspacesByGroup: (groupId: string) => WorkspaceStoreItem[];
  getUngroupedWorkspaces: () => WorkspaceStoreItem[];
}

type WorkspaceStore = WorkspaceStoreState & WorkspaceStoreActions;

const SEED_GROUPS: WorkspaceGroupStoreItem[] = [
  { id: "seed-group-core", name: "Core CS", orderIndex: 0, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-group-dsa", name: "DSA & Problem Solving", orderIndex: 1, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-group-interview", name: "Interview Prep", orderIndex: 2, createdAt: "2026-01-01T00:00:00.000Z" },
];

const SEED_WORKSPACES: WorkspaceStoreItem[] = [
  { id: "seed-ws-cn", name: "Computer Networks", groupId: "seed-group-core", orderIndex: 0, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-os", name: "Operating Systems", groupId: "seed-group-core", orderIndex: 1, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-db", name: "Database Systems", groupId: "seed-group-core", orderIndex: 2, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-ca", name: "Computer Architecture", groupId: "seed-group-core", orderIndex: 3, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-cd", name: "Compiler Design", groupId: "seed-group-core", orderIndex: 4, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-toc", name: "Theory of Computation", groupId: "seed-group-core", orderIndex: 5, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-arrays", name: "Arrays & Hashing", groupId: "seed-group-dsa", orderIndex: 0, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-pointers", name: "Two Pointers", groupId: "seed-group-dsa", orderIndex: 1, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-sliding", name: "Sliding Window", groupId: "seed-group-dsa", orderIndex: 2, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-stack", name: "Stack", groupId: "seed-group-dsa", orderIndex: 3, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-bs", name: "Binary Search", groupId: "seed-group-dsa", orderIndex: 4, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-ll", name: "Linked List", groupId: "seed-group-dsa", orderIndex: 5, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-trees", name: "Trees", groupId: "seed-group-dsa", orderIndex: 6, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-graphs", name: "Graphs", groupId: "seed-group-dsa", orderIndex: 7, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-dp", name: "Dynamic Programming", groupId: "seed-group-dsa", orderIndex: 8, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-greedy", name: "Greedy", groupId: "seed-group-dsa", orderIndex: 9, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-backtrack", name: "Backtracking", groupId: "seed-group-dsa", orderIndex: 10, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-tries", name: "Tries", groupId: "seed-group-dsa", orderIndex: 11, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-intervals", name: "Intervals", groupId: "seed-group-dsa", orderIndex: 12, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-math", name: "Math & Geometry", groupId: "seed-group-dsa", orderIndex: 13, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-bits", name: "Bit Manipulation", groupId: "seed-group-dsa", orderIndex: 14, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-sd", name: "System Design", groupId: "seed-group-interview", orderIndex: 0, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-lld", name: "Low-Level Design", groupId: "seed-group-interview", orderIndex: 1, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-sql", name: "SQL & Database Design", groupId: "seed-group-interview", orderIndex: 2, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-behavioral", name: "Behavioral Prep", groupId: "seed-group-interview", orderIndex: 3, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-ml", name: "Machine Learning", groupId: null, orderIndex: 0, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-dist", name: "Distributed Systems", groupId: null, orderIndex: 1, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-sec", name: "Cybersecurity", groupId: null, orderIndex: 2, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-web", name: "Web Development", groupId: null, orderIndex: 3, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-ws-cg", name: "Computer Graphics", groupId: null, orderIndex: 4, createdAt: "2026-01-01T00:00:00.000Z" },
];

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaceGroups: SEED_GROUPS,
  workspaces: SEED_WORKSPACES,
  hydrated: true,

  addWorkspace: (input) => {
    const orderIndex = get().workspaces.length;
    const workspace = createWorkspaceStoreItem(input, orderIndex);
    set((state) => ({ workspaces: [...state.workspaces, workspace] }));
  },

  updateWorkspace: (id, input) => {
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? updateWorkspaceStoreItem(w, input) : w,
      ),
    }));
  },

  removeWorkspace: (id) => {
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
    }));
  },

  reassignWorkspace: (id, groupId) => {
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? { ...w, groupId } : w,
      ),
    }));
  },

  addGroup: (input) => {
    const orderIndex = get().workspaceGroups.length;
    const group = createWorkspaceGroupStoreItem(input, orderIndex);
    set((state) => ({ workspaceGroups: [...state.workspaceGroups, group] }));
  },

  updateGroup: (id, input) => {
    set((state) => ({
      workspaceGroups: state.workspaceGroups.map((g) =>
        g.id === id ? updateWorkspaceGroupStoreItem(g, input) : g,
      ),
    }));
  },

  removeGroup: (id) => {
    set((state) => ({
      workspaceGroups: state.workspaceGroups.filter((g) => g.id !== id),
      workspaces: state.workspaces.map((w) =>
        w.groupId === id ? { ...w, groupId: null } : w,
      ),
    }));
  },

  getWorkspacesByGroup: (groupId) => {
    return get().workspaces.filter((w) => w.groupId === groupId);
  },

  getUngroupedWorkspaces: () => {
    return get().workspaces.filter((w) => w.groupId === null);
  },
}));
