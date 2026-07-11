import "dotenv/config";
import { PrismaClient, NodeStatus, NodeConfidence } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { SEED_GROUPS, SEED_WORKSPACES, buildSeedNodes } from "../src/lib/seed/seed-data";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log("Seeding database...");

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "NodeActivity", "Node", "Workspace", "WorkspaceGroup", "User" RESTART IDENTITY CASCADE`);

  const user = await prisma.user.create({
    data: {
      id: "seed-test-user",
      email: "test@study.dev",
      name: "Test User",
      hashedPassword: await hash("password123", 12),
    },
  });

  await prisma.workspaceGroup.createMany({
    data: SEED_GROUPS.map((g) => ({ ...g, userId: user.id })),
  });

  await prisma.workspace.createMany({
    data: SEED_WORKSPACES.map((w) => ({ ...w, userId: user.id })),
  });

  const nodes = buildSeedNodes();
  const sorted = topologicalSort(nodes);

  for (const node of sorted) {
    await prisma.node.create({
      data: {
        id: node.id,
        workspaceId: node.workspaceId,
        parentId: node.parentId,
        title: node.title,
        status: node.status as NodeStatus | null,
        confidence: node.confidence as NodeConfidence | null,
        notes: node.notes,
        lastReviewedAt: node.lastReviewedAt ? new Date(node.lastReviewedAt) : null,
        orderIndex: node.orderIndex,
        userId: user.id,
        createdAt: new Date(node.createdAt),
      },
    });
  }

  console.log("Seed complete. Test user: test@study.dev / password123");
}

function topologicalSort<T extends { id: string; parentId: string | null }>(nodes: T[]): T[] {
  const sorted: T[] = [];
  const visited = new Set<string>();
  const ids = new Map<string, T>();
  for (const n of nodes) ids.set(n.id, n);

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const node = ids.get(id);
    if (!node) return;
    if (node.parentId && ids.has(node.parentId)) {
      visit(node.parentId);
    }
    sorted.push(node);
  }

  for (const node of nodes) visit(node.id);
  return sorted;
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
