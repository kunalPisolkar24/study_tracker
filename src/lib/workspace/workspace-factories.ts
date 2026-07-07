import type { WorkspaceStoreItem, WorkspaceGroupStoreItem } from "@/types/workspace";
import type { CreateWorkspaceInput, CreateWorkspaceGroupInput } from "@/lib/workspace-schemas";

export function createWorkspaceStoreItem(
  input: CreateWorkspaceInput,
  orderIndex: number,
): WorkspaceStoreItem {
  return {
    id: crypto.randomUUID(),
    name: input.name,
    groupId: input.groupId ?? null,
    orderIndex,
    createdAt: new Date().toISOString(),
  };
}

export function updateWorkspaceStoreItem(
  existing: WorkspaceStoreItem,
  input: Partial<CreateWorkspaceInput>,
): WorkspaceStoreItem {
  return {
    ...existing,
    ...(input.name !== undefined && { name: input.name }),
    ...(input.groupId !== undefined && { groupId: input.groupId ?? null }),
  };
}

export function createWorkspaceGroupStoreItem(
  input: CreateWorkspaceGroupInput,
  orderIndex: number,
): WorkspaceGroupStoreItem {
  return {
    id: crypto.randomUUID(),
    name: input.name,
    orderIndex,
    createdAt: new Date().toISOString(),
  };
}

export function updateWorkspaceGroupStoreItem(
  existing: WorkspaceGroupStoreItem,
  input: Partial<CreateWorkspaceGroupInput>,
): WorkspaceGroupStoreItem {
  return {
    ...existing,
    ...(input.name !== undefined && { name: input.name }),
  };
}
