"use client";

import { create } from "zustand";
import type { WorkspaceStoreItem, WorkspaceGroupStoreItem } from "@/types/workspace";
import type { CreateWorkspaceInput, CreateWorkspaceGroupInput } from "@/lib/workspace/workspace-schemas";
import {
  updateWorkspaceStoreItem,
  updateWorkspaceGroupStoreItem,
} from "@/lib/workspace/workspace-factories";
import {
  fetchWorkspacesAction,
  createWorkspaceAction,
  updateWorkspaceAction,
  deleteWorkspaceAction,
  reassignWorkspaceAction,
} from "@/lib/actions/workspace-actions";
import {
  fetchGroupsAction,
  createGroupAction,
  updateGroupAction,
  deleteGroupAction,
} from "@/lib/actions/group-actions";

interface WorkspaceStoreState {
  workspaceGroups: WorkspaceGroupStoreItem[];
  workspaces: WorkspaceStoreItem[];
  hydrated: boolean;
}

interface WorkspaceStoreActions {
  hydrate: () => Promise<void>;
  addWorkspace: (input: CreateWorkspaceInput & { groupId?: string | null }) => Promise<void>;
  updateWorkspace: (id: string, input: CreateWorkspaceInput) => Promise<void>;
  removeWorkspace: (id: string) => Promise<void>;
  reassignWorkspace: (id: string, groupId: string | null) => Promise<void>;
  addGroup: (input: CreateWorkspaceGroupInput) => Promise<void>;
  updateGroup: (id: string, input: CreateWorkspaceGroupInput) => Promise<void>;
  removeGroup: (id: string) => Promise<void>;
  getWorkspacesByGroup: (groupId: string) => WorkspaceStoreItem[];
  getUngroupedWorkspaces: () => WorkspaceStoreItem[];
}

type WorkspaceStore = WorkspaceStoreState & WorkspaceStoreActions;

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaceGroups: [],
  workspaces: [],
  hydrated: false,

  hydrate: async () => {
    const [workspaces, groups] = await Promise.all([
      fetchWorkspacesAction(),
      fetchGroupsAction(),
    ]);
    set({ workspaces, workspaceGroups: groups, hydrated: true });
  },

  addWorkspace: async (input) => {
    const workspace = await createWorkspaceAction(input);
    set((state) => ({ workspaces: [...state.workspaces, workspace] }));
  },

  updateWorkspace: async (id, input) => {
    const previous = get().workspaces;
    try {
      await updateWorkspaceAction(id, input);
    } catch {
      set({ workspaces: previous });
      throw new Error("Failed to update workspace");
    }
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? updateWorkspaceStoreItem(w, input) : w,
      ),
    }));
  },

  removeWorkspace: async (id) => {
    const previous = get().workspaces;
    try {
      await deleteWorkspaceAction(id);
    } catch {
      set({ workspaces: previous });
      throw new Error("Failed to delete workspace");
    }
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
    }));
  },

  reassignWorkspace: async (id, groupId) => {
    const previous = get().workspaces;
    try {
      await reassignWorkspaceAction(id, groupId);
    } catch {
      set({ workspaces: previous });
      throw new Error("Failed to reassign workspace");
    }
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? { ...w, groupId } : w,
      ),
    }));
  },

  addGroup: async (input) => {
    const group = await createGroupAction(input);
    set((state) => ({ workspaceGroups: [...state.workspaceGroups, group] }));
  },

  updateGroup: async (id, input) => {
    const previous = get().workspaceGroups;
    try {
      await updateGroupAction(id, input);
    } catch {
      set({ workspaceGroups: previous });
      throw new Error("Failed to update group");
    }
    set((state) => ({
      workspaceGroups: state.workspaceGroups.map((g) =>
        g.id === id ? updateWorkspaceGroupStoreItem(g, input) : g,
      ),
    }));
  },

  removeGroup: async (id) => {
    const previousGroups = get().workspaceGroups;
    const previousWorkspaces = get().workspaces;
    try {
      await deleteGroupAction(id);
    } catch {
      set({ workspaceGroups: previousGroups, workspaces: previousWorkspaces });
      throw new Error("Failed to delete group");
    }
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
