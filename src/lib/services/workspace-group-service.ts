import { workspaceGroupRepository } from "@/lib/repositories/workspace-group-repository";
import { workspaceRepository } from "@/lib/repositories/workspace-repository";
import type { WorkspaceGroupStoreItem } from "@/types/workspace";
import type { CreateWorkspaceGroupInput } from "@/lib/workspace/workspace-schemas";

export const workspaceGroupService = {
  async list(userId: string): Promise<WorkspaceGroupStoreItem[]> {
    return workspaceGroupRepository.findAll(userId);
  },

  async findById(id: string, userId: string): Promise<WorkspaceGroupStoreItem | null> {
    return workspaceGroupRepository.findById(id, userId);
  },

  async create(input: CreateWorkspaceGroupInput, userId: string): Promise<WorkspaceGroupStoreItem> {
    const groups = await workspaceGroupRepository.findAll(userId);
    const orderIndex = groups.length;
    return workspaceGroupRepository.create({ name: input.name, orderIndex }, userId);
  },

  async update(id: string, input: CreateWorkspaceGroupInput, userId: string): Promise<void> {
    await workspaceGroupRepository.update(id, { name: input.name }, userId);
  },

  async remove(id: string, userId: string): Promise<void> {
    const workspaces = await workspaceRepository.findByGroup(id, userId);
    for (const ws of workspaces) {
      await workspaceRepository.reassign(ws.id, null, userId);
    }
    await workspaceGroupRepository.delete(id, userId);
  },
};
