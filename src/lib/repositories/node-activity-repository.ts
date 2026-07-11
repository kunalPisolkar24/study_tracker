import { prisma } from "@/lib/shared/prisma";
import type { NodeActivityEntry } from "@/types/node";

function toDomain(row: { id: string; nodeId: string; workspaceId: string; action: string; timestamp: Date }): NodeActivityEntry {
  return {
    id: row.id,
    nodeId: row.nodeId,
    workspaceId: row.workspaceId,
    action: row.action as NodeActivityEntry["action"],
    timestamp: row.timestamp.toISOString(),
  };
}

export const nodeActivityRepository = {
  async findAllByUser(userId: string): Promise<NodeActivityEntry[]> {
    const rows = await prisma.nodeActivity.findMany({
      where: { userId },
      orderBy: { timestamp: "asc" },
    });
    return rows.map(toDomain);
  },

  async findByWorkspace(workspaceId: string, userId: string): Promise<NodeActivityEntry[]> {
    const rows = await prisma.nodeActivity.findMany({
      where: { workspaceId, userId },
      orderBy: { timestamp: "asc" },
    });
    return rows.map(toDomain);
  },

  async create(data: {
    id: string;
    nodeId: string;
    workspaceId: string;
    action: string;
    userId: string;
    timestamp: Date;
  }): Promise<void> {
    await prisma.nodeActivity.create({ data });
  },

  async createMany(data: Array<{
    id: string;
    nodeId: string;
    workspaceId: string;
    action: string;
    userId: string;
    timestamp: Date;
  }>): Promise<void> {
    if (data.length === 0) return;
    await prisma.nodeActivity.createMany({ data });
  },
};
