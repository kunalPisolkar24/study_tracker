import crypto from "crypto";
import type { PrismaClient, NodeStatus, NodeConfidence } from "@/generated/prisma/client";
import type { NodeActivityAction } from "@/types/node";
import { SEED_GROUPS, SEED_WORKSPACES, buildSeedNodes, SPREAD_START, SPREAD_DAYS } from "@/lib/seed/seed-data";

function deriveSeedActivityLogs(nodes: Array<{
  id: string; workspaceId: string; status: string | null; lastReviewedAt: string | null; createdAt: string;
}>): Array<{
  id: string; nodeId: string; workspaceId: string; action: string; timestamp: Date; userId: string;
}> {
  const logs: Array<{
    id: string; nodeId: string; workspaceId: string; action: string; timestamp: Date; userId: string;
  }> = [];

  const doneNodes = nodes
    .filter((n) => n.status === "done" && n.lastReviewedAt)
    .sort((a, b) => a.id.localeCompare(b.id));
  const doneCount = doneNodes.length;

  for (const node of nodes) {
    logs.push({
      id: crypto.randomUUID(),
      nodeId: node.id,
      workspaceId: node.workspaceId,
      action: "created",
      timestamp: new Date(node.createdAt),
      userId: "",
    });

    if (!node.lastReviewedAt || !node.status) continue;

    if (node.status === "done") {
      const idx = doneNodes.indexOf(node);
      const offset = Math.round(doneCount > 1 ? (idx / (doneCount - 1)) * SPREAD_DAYS : 0);
      const ts = new Date(SPREAD_START);
      ts.setDate(ts.getDate() + offset);
      logs.push({
        id: crypto.randomUUID(),
        nodeId: node.id,
        workspaceId: node.workspaceId,
        action: "marked_done",
        timestamp: ts,
        userId: "",
      });
    } else {
      const action: NodeActivityAction =
        node.status === "in_progress" ? "marked_in_progress" : "marked_not_started";
      logs.push({
        id: crypto.randomUUID(),
        nodeId: node.id,
        workspaceId: node.workspaceId,
        action,
        timestamp: new Date(node.lastReviewedAt),
        userId: "",
      });
    }
  }
  return logs;
}

export async function seedUserData(userId: string, prisma: PrismaClient): Promise<void> {
  const existingGroups = await prisma.workspaceGroup.count({ where: { userId } });
  if (existingGroups > 0) return;

  await prisma.workspaceGroup.createMany({
    data: SEED_GROUPS.map((g) => ({ ...g, userId })),
  });

  await prisma.workspace.createMany({
    data: SEED_WORKSPACES.map((w) => ({ ...w, userId })),
  });

  const seedNodes = buildSeedNodes();
  const sorted = seedNodes
    .slice()
    .sort((a, b) => {
      function depth(nodes: typeof seedNodes, id: string, d = 0): number {
        const node = nodes.find((x) => x.id === id);
        if (!node || !node.parentId) return d;
        return depth(nodes, node.parentId, d + 1);
      }
      return depth(seedNodes, a.id) - depth(seedNodes, b.id);
    });

  for (const n of sorted) {
    await prisma.node.create({
      data: {
        id: n.id,
        workspaceId: n.workspaceId,
        parentId: n.parentId,
        title: n.title,
        status: n.status as NodeStatus | null,
        confidence: n.confidence as NodeConfidence | null,
        notes: n.notes,
        lastReviewedAt: n.lastReviewedAt ? new Date(n.lastReviewedAt) : null,
        orderIndex: n.orderIndex,
        userId,
      },
    });
  }

  const activityLogs = deriveSeedActivityLogs(seedNodes);
  if (activityLogs.length > 0) {
    await prisma.nodeActivity.createMany({
      data: activityLogs.map((log) => ({
        ...log,
        id: crypto.randomUUID(),
        userId,
      })),
    });
  }
}
