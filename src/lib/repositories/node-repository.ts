import { prisma } from "@/lib/shared/prisma";
import type { NodeStoreItem } from "@/types/node";

function toDomain(row: {
  id: string;
  workspaceId: string;
  parentId: string | null;
  title: string;
  status: string | null;
  confidence: string | null;
  notes: string;
  lastReviewedAt: Date | null;
  orderIndex: number;
  createdAt: Date;
}): NodeStoreItem {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    parentId: row.parentId,
    title: row.title,
    status: row.status as NodeStoreItem["status"],
    confidence: row.confidence as NodeStoreItem["confidence"],
    notes: row.notes,
    lastReviewedAt: row.lastReviewedAt?.toISOString() ?? null,
    orderIndex: row.orderIndex,
    createdAt: row.createdAt.toISOString(),
  };
}

export const nodeRepository = {
  async findAllByUser(userId: string): Promise<NodeStoreItem[]> {
    const rows = await prisma.node.findMany({
      where: { userId },
      orderBy: [{ parentId: { sort: "asc", nulls: "first" } }, { orderIndex: "asc" }],
    });
    return rows.map(toDomain);
  },

  async findByWorkspace(workspaceId: string, userId: string): Promise<NodeStoreItem[]> {
    const rows = await prisma.node.findMany({
      where: { workspaceId, userId },
      orderBy: [{ parentId: { sort: "asc", nulls: "first" } }, { orderIndex: "asc" }],
    });
    return rows.map(toDomain);
  },

  async findById(id: string, userId: string): Promise<NodeStoreItem | null> {
    const row = await prisma.node.findFirst({
      where: { id, userId },
    });
    return row ? toDomain(row) : null;
  },

  async findChildren(parentId: string, userId: string): Promise<NodeStoreItem[]> {
    const rows = await prisma.node.findMany({
      where: { parentId, userId },
      orderBy: { orderIndex: "asc" },
    });
    return rows.map(toDomain);
  },

  async getNextOrderIndex(workspaceId: string, parentId: string | null, userId: string): Promise<number> {
    const result = await prisma.node.aggregate({
      where: { workspaceId, parentId, userId },
      _max: { orderIndex: true },
    });
    return (result._max.orderIndex ?? -1) + 1;
  },

  async findDescendantIds(nodeId: string, userId: string): Promise<string[]> {
    const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `WITH RECURSIVE subtree AS (
        SELECT id FROM "Node" WHERE id = $1 AND "userId" = $2
        UNION ALL
        SELECT n.id FROM "Node" n JOIN subtree s ON n."parentId" = s.id
      )
      SELECT id FROM subtree WHERE id != $1`,
      nodeId,
      userId,
    );
    return rows.map((r) => r.id);
  },

  async create(data: {
    id: string;
    workspaceId: string;
    parentId: string | null;
    title: string;
    status: string | null;
    confidence: string | null;
    notes: string;
    lastReviewedAt: Date | null;
    orderIndex: number;
    userId: string;
  }): Promise<NodeStoreItem> {
    const row = await prisma.node.create({ data: data as any });
    return toDomain(row);
  },

  async update(
    id: string,
    data: {
      title?: string;
      status?: string | null;
      confidence?: string | null;
      notes?: string;
      lastReviewedAt?: Date | null;
    },
    userId: string,
  ): Promise<NodeStoreItem | null> {
    await prisma.node.updateMany({
      where: { id, userId },
      data: data as any,
    });
    return this.findById(id, userId);
  },

  async batchUpdateOrder(
    updates: Array<{ id: string; orderIndex: number; parentId: string | null }>,
    userId: string,
  ): Promise<void> {
    if (updates.length === 0) return;
    const cases = updates.map((u) => `WHEN id = '${u.id}' THEN ${u.orderIndex}`);
    const parentCases = updates.map((u) => {
      const parentVal = u.parentId === null ? "NULL" : `'${u.parentId}'`;
      return `WHEN id = '${u.id}' THEN ${parentVal}::uuid`;
    });
    const idPlaceholders = updates.map((_, i) => `$${i + 1}`).join(",");
    const userIdPlaceholder = `$${updates.length + 1}`;
    await prisma.$executeRawUnsafe(
      `UPDATE "Node" SET "orderIndex" = CASE ${cases.join(" ")} END, "parentId" = CASE ${parentCases.join(" ")} END WHERE id IN (${idPlaceholders}) AND "userId" = ${userIdPlaceholder}`,
      ...updates.map((u) => u.id),
      userId,
    );
  },

  async delete(id: string, userId: string): Promise<void> {
    await prisma.node.deleteMany({
      where: { id, userId },
    });
  },

  async deleteSubtree(nodeId: string, userId: string): Promise<number> {
    const result = await prisma.$executeRawUnsafe(
      `WITH RECURSIVE subtree AS (
        SELECT id FROM "Node" WHERE id = $1 AND "userId" = $2
        UNION ALL
        SELECT n.id FROM "Node" n JOIN subtree s ON n."parentId" = s.id
      )
      DELETE FROM "Node" WHERE id IN (SELECT id FROM subtree)`,
      nodeId,
      userId,
    );
    return result;
  },

  async countByWorkspace(workspaceId: string, userId: string): Promise<number> {
    return prisma.node.count({
      where: { workspaceId, userId },
    });
  },
};
