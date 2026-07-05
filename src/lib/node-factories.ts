import type { NodeStoreItem, CreateNodeInput, UpdateNodeInput } from "@/types/node";

let counter = 0;

function generateId(): string {
  counter++;
  return `node-${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 7)}`;
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

export function updateNodeStoreItem(
  existing: NodeStoreItem,
  input: UpdateNodeInput,
): NodeStoreItem {
  return {
    ...existing,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.status !== undefined ? { status: input.status, lastReviewedAt: new Date().toISOString() } : {}),
    ...(input.confidence !== undefined ? { confidence: input.confidence, lastReviewedAt: new Date().toISOString() } : {}),
    ...(input.notes !== undefined ? { notes: input.notes, lastReviewedAt: input.notes !== existing.notes ? new Date().toISOString() : existing.lastReviewedAt } : {}),
  };
}
