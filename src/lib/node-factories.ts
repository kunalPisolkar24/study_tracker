import type { NodeStoreItem, CreateNodeInput, UpdateNodeInput } from "@/types/node";

export function generateId(): string {
  return crypto.randomUUID();
}

export function createNodeStoreItem(input: CreateNodeInput, orderIndex: number): NodeStoreItem {
  return {
    id: generateId(),
    workspaceId: input.workspaceId,
    parentId: input.parentId ?? null,
    title: input.title,
    status: null,
    confidence: null,
    notes: "",
    lastReviewedAt: null,
    orderIndex,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Applies partial updates to an existing `NodeStoreItem`.
 * `lastReviewedAt` is only updated when status, confidence, or notes change.
 */
export function updateNodeStoreItem(
  existing: NodeStoreItem,
  input: UpdateNodeInput,
): NodeStoreItem {
  const statusChanged = input.status !== undefined && input.status !== existing.status;
  const confidenceChanged = input.confidence !== undefined && input.confidence !== existing.confidence;
  const notesChanged = input.notes !== undefined && input.notes !== existing.notes;

  const shouldUpdateReviewedAt = statusChanged || confidenceChanged || notesChanged;

  return {
    ...existing,
    ...(input.title !== undefined && { title: input.title }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.confidence !== undefined && { confidence: input.confidence }),
    ...(input.notes !== undefined && { notes: input.notes }),
    ...(shouldUpdateReviewedAt && { lastReviewedAt: new Date().toISOString() }),
  };
}
