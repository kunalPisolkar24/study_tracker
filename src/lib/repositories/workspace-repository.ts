import { prisma } from "@/lib/shared/prisma";
import type { WorkspaceStoreItem } from "@/types/workspace";

function toDomain(row: { id: string; name: string; groupId: string | null; orderIndex: number; userId: string; createdAt: Date }): WorkspaceStoreItem {
  return {
    id: row.id,
    name: row.name,
    groupId: row.groupId,
    orderIndex: row.orderIndex,
    createdAt: row.createdAt.toISOString(),
  };
}

export const workspaceRepository = {
  async findAll(userId: string): Promise<WorkspaceStoreItem[]> {
    const rows = await prisma.workspace.findMany({
      where: { userId },
      orderBy: { orderIndex: "asc" },
    });
    return rows.map(toDomain);
  },

  async findById(id: string, userId: string): Promise<WorkspaceStoreItem | null> {
    const row = await prisma.workspace.findFirst({
      where: { id, userId },
    });
    return row ? toDomain(row) : null;
  },

  async findByGroup(groupId: string, userId: string): Promise<WorkspaceStoreItem[]> {
    const rows = await prisma.workspace.findMany({
      where: { groupId, userId },
      orderBy: { orderIndex: "asc" },
    });
    return rows.map(toDomain);
  },

  async findUngrouped(userId: string): Promise<WorkspaceStoreItem[]> {
    const rows = await prisma.workspace.findMany({
      where: { groupId: null, userId },
      orderBy: { orderIndex: "asc" },
    });
    return rows.map(toDomain);
  },

  async getNextOrderIndex(userId: string): Promise<number> {
    const result = await prisma.workspace.aggregate({
      where: { userId },
      _max: { orderIndex: true },
    });
    return (result._max.orderIndex ?? -1) + 1;
  },

  async create(data: { name: string; groupId?: string | null; orderIndex: number }, userId: string): Promise<WorkspaceStoreItem> {
    const row = await prisma.workspace.create({
      data: {
        name: data.name,
        groupId: data.groupId ?? null,
        orderIndex: data.orderIndex,
        userId,
      },
    });
    return toDomain(row);
  },

  async update(id: string, data: { name?: string; groupId?: string | null }, userId: string): Promise<void> {
    await prisma.workspace.updateMany({
      where: { id, userId },
      data,
    });
  },

  async reassign(id: string, groupId: string | null, userId: string): Promise<void> {
    await prisma.workspace.updateMany({
      where: { id, userId },
      data: { groupId },
    });
  },

  async delete(id: string, userId: string): Promise<void> {
    await prisma.workspace.deleteMany({
      where: { id, userId },
    });
  },
};
