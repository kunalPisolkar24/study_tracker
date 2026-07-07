import { prisma } from "@/lib/shared/prisma";
import { nodeRepository } from "@/lib/repositories/node-repository";
import { nodeActivityRepository } from "@/lib/repositories/node-activity-repository";
import { generateId } from "@/lib/workspace/node-factories";
import type { NodeStoreItem, NodeActivityAction, CreateNodeInput, UpdateNodeInput } from "@/types/node";

function deriveAction(
  oldStatus: string | null | undefined,
  newStatus: string | null | undefined,
): NodeActivityAction | null {
  if (newStatus === undefined || newStatus === oldStatus) return null;
  if (newStatus === "done") return "marked_done";
  if (newStatus === "in_progress") return "marked_in_progress";
  return "marked_not_started";
}

export const nodeService = {
  async addNode(input: CreateNodeInput, userId: string): Promise<string> {
    const parentId = input.parentId ?? null;
    const orderIndex = await nodeRepository.getNextOrderIndex(input.workspaceId, parentId, userId);
    const now = new Date();

    const node = await nodeRepository.create({
      id: generateId(),
      workspaceId: input.workspaceId,
      parentId,
      title: input.title,
      status: null,
      confidence: null,
      notes: "",
      lastReviewedAt: null,
      orderIndex,
      userId,
    });

    await nodeActivityRepository.create({
      id: generateId(),
      nodeId: node.id,
      workspaceId: node.workspaceId,
      action: "created",
      userId,
      timestamp: now,
    });

    return node.id;
  },

  async updateNode(id: string, input: UpdateNodeInput, userId: string): Promise<void> {
    const existing = await nodeRepository.findById(id, userId);
    if (!existing) throw new Error("Node not found");

    const now = new Date();
    const statusChanged = input.status !== undefined && input.status !== existing.status;
    const confidenceChanged = input.confidence !== undefined && input.confidence !== existing.confidence;
    const notesChanged = input.notes !== undefined && input.notes !== existing.notes;
    const shouldUpdateReviewedAt = statusChanged || confidenceChanged || notesChanged;

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.confidence !== undefined) updateData.confidence = input.confidence;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (shouldUpdateReviewedAt) updateData.lastReviewedAt = now;

    const logs: Array<{
      id: string;
      nodeId: string;
      workspaceId: string;
      action: string;
      userId: string;
      timestamp: Date;
    }> = [];

    const action = deriveAction(existing.status, input.status);
    if (action) {
      logs.push({ id: generateId(), nodeId: id, workspaceId: existing.workspaceId, action, userId, timestamp: now });
    }
    if (confidenceChanged) {
      logs.push({ id: generateId(), nodeId: id, workspaceId: existing.workspaceId, action: "confidence_changed", userId, timestamp: now });
    }

    await prisma.$transaction(async () => {
      await nodeRepository.update(id, updateData as any, userId);
      if (logs.length > 0) {
        await nodeActivityRepository.createMany(logs);
      }
    });
  },

  async removeNode(id: string, userId: string): Promise<void> {
    await nodeRepository.deleteSubtree(id, userId);
  },

  async reorderSiblings(parentId: string | null, workspaceId: string, orderedIds: string[], userId: string): Promise<void> {
    const updates = orderedIds.map((nodeId, index) => ({
      id: nodeId,
      orderIndex: index,
      parentId,
    }));
    await nodeRepository.batchUpdateOrder(updates, userId);
  },

  async getWorkspaceNodes(workspaceId: string, userId: string): Promise<NodeStoreItem[]> {
    return nodeRepository.findByWorkspace(workspaceId, userId);
  },

  async getActivityLogs(workspaceId: string, userId: string): Promise<import("@/types/node").NodeActivityEntry[]> {
    return nodeActivityRepository.findByWorkspace(workspaceId, userId);
  },

  async getAllNodes(userId: string): Promise<NodeStoreItem[]> {
    return nodeRepository.findAllByUser(userId);
  },

  async getAllActivityLogs(userId: string): Promise<import("@/types/node").NodeActivityEntry[]> {
    return nodeActivityRepository.findAllByUser(userId);
  },
};
