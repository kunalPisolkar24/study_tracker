import { workspaceRepository } from "@/lib/repositories/workspace-repository";
import { workspaceGroupRepository } from "@/lib/repositories/workspace-group-repository";
import { createWorkspaceStoreItem, updateWorkspaceStoreItem } from "@/lib/workspace/workspace-factories";
import type { WorkspaceStoreItem } from "@/types/workspace";
import type { CreateWorkspaceInput } from "@/lib/workspace/workspace-schemas";

export const workspaceService = {
  async list(userId: string): Promise<WorkspaceStoreItem[]> {
    return workspaceRepository.findAll(userId);
  },

  async findById(id: string, userId: string): Promise<WorkspaceStoreItem | null> {
    return workspaceRepository.findById(id, userId);
  },

  async create(input: CreateWorkspaceInput & { groupId?: string | null }, userId: string): Promise<WorkspaceStoreItem> {
    const orderIndex = await workspaceRepository.getNextOrderIndex(userId);
    return workspaceRepository.create(
      { name: input.name, groupId: input.groupId ?? null, orderIndex },
      userId,
    );
  },

  async update(id: string, input: CreateWorkspaceInput, userId: string): Promise<void> {
    await workspaceRepository.update(id, { name: input.name, groupId: input.groupId }, userId);
  },

  async remove(id: string, userId: string): Promise<void> {
    await workspaceRepository.delete(id, userId);
  },

  async reassign(id: string, groupId: string | null, userId: string): Promise<void> {
    await workspaceRepository.reassign(id, groupId, userId);
  },

  async getWorkspacesByGroup(groupId: string, userId: string): Promise<WorkspaceStoreItem[]> {
    return workspaceRepository.findByGroup(groupId, userId);
  },

  async getUngrouped(userId: string): Promise<WorkspaceStoreItem[]> {
    return workspaceRepository.findUngrouped(userId);
  },
};
