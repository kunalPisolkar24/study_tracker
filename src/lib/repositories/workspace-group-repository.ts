import { prisma } from "@/lib/shared/prisma";
import type { WorkspaceGroupStoreItem } from "@/types/workspace";

function toDomain(row: { id: string; name: string; orderIndex: number; userId: string; createdAt: Date }): WorkspaceGroupStoreItem {
  return {
    id: row.id,
    name: row.name,
    orderIndex: row.orderIndex,
    createdAt: row.createdAt.toISOString(),
  };
}

export const workspaceGroupRepository = {
  async findAll(userId: string): Promise<WorkspaceGroupStoreItem[]> {
    const rows = await prisma.workspaceGroup.findMany({
      where: { userId },
      orderBy: { orderIndex: "asc" },
    });
    return rows.map(toDomain);
  },

  async findById(id: string, userId: string): Promise<WorkspaceGroupStoreItem | null> {
    const row = await prisma.workspaceGroup.findFirst({
      where: { id, userId },
    });
    return row ? toDomain(row) : null;
  },

  async create(data: { name: string; orderIndex: number }, userId: string): Promise<WorkspaceGroupStoreItem> {
    const row = await prisma.workspaceGroup.create({
      data: { name: data.name, orderIndex: data.orderIndex, userId },
    });
    return toDomain(row);
  },

  async update(id: string, data: { name: string }, userId: string): Promise<void> {
    await prisma.workspaceGroup.updateMany({
      where: { id, userId },
      data: { name: data.name },
    });
  },

  async delete(id: string, userId: string): Promise<void> {
    await prisma.workspaceGroup.deleteMany({
      where: { id, userId },
    });
  },
};
