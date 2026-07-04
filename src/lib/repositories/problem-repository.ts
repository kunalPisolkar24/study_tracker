import { prisma } from "@/lib/prisma";
import type { $Enums } from "@/generated/prisma/client";

export interface ProblemScalarFields {
  id: string;
  topicId: string;
  subTopicId: string | null;
  title: string;
  url: string | null;
  difficulty: string;
  status: string;
  reviewCount: number;
  sortOrder: number;
  notes: string | null;
  lastSolvedAt: Date | null;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

async function findMaxSortOrder(
  topicId: string,
  subTopicId?: string | null
): Promise<number> {
  const result = await prisma.problem.aggregate({
    where: { topicId, subTopicId: subTopicId ?? null },
    _max: { sortOrder: true },
  });
  return result._max.sortOrder ?? -1;
}

export async function createProblem(
  topicId: string,
  data: {
    subTopicId?: string | null;
    title: string;
    url?: string | null;
    difficulty: string;
    notes?: string | null;
  }
): Promise<ProblemScalarFields> {
  const maxOrder = await findMaxSortOrder(topicId, data.subTopicId ?? null);
  return prisma.problem.create({
    data: {
      topicId,
      subTopicId: data.subTopicId ?? null,
      title: data.title,
      url: data.url ?? null,
      difficulty: data.difficulty as $Enums.Difficulty,
      notes: data.notes ?? null,
      sortOrder: maxOrder + 1,
    },
  });
}

export async function updateProblem(
  id: string,
  data: {
    title?: string;
    url?: string | null;
    difficulty?: string;
    subTopicId?: string | null;
    notes?: string | null;
  }
): Promise<ProblemScalarFields> {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.url !== undefined) updateData.url = data.url || null;
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  if (data.subTopicId === undefined) {
    return prisma.problem.update({ where: { id }, data: updateData });
  }

  const current = await prisma.problem.findUnique({ where: { id } });
  if (!current) {
    throw new Error(`Problem ${id} not found`);
  }

  const containerMoved = current.subTopicId !== data.subTopicId;

  if (containerMoved) {
    const newMax = await prisma.problem.aggregate({
      where: {
        topicId: current.topicId,
        subTopicId: data.subTopicId ?? null,
      },
      _max: { sortOrder: true },
    });
    updateData.subTopicId = data.subTopicId;
    updateData.sortOrder = (newMax._max.sortOrder ?? -1) + 1;

    const result = await prisma.$transaction(async (tx) => {
      await tx.problem.updateMany({
        where: {
          topicId: current.topicId,
          subTopicId: current.subTopicId,
          sortOrder: { gt: current.sortOrder },
        },
        data: { sortOrder: { decrement: 1 } },
      });
      return tx.problem.update({ where: { id }, data: updateData });
    });

    return result;
  }

  return prisma.problem.update({ where: { id }, data: updateData });
}

export async function deleteProblem(id: string): Promise<void> {
  const current = await prisma.problem.findUnique({ where: { id } });
  if (!current) return;

  await prisma.$transaction([
    prisma.problem.delete({ where: { id } }),
    prisma.problem.updateMany({
      where: {
        topicId: current.topicId,
        subTopicId: current.subTopicId,
        sortOrder: { gt: current.sortOrder },
      },
      data: { sortOrder: { decrement: 1 } },
    }),
  ]);
}

export async function updateProblemStatus(
  id: string,
  status: string,
  lastSolvedAt?: Date | null
): Promise<ProblemScalarFields> {
  const data: Record<string, unknown> = { status };
  if (lastSolvedAt !== undefined) data.lastSolvedAt = lastSolvedAt;
  return prisma.problem.update({ where: { id }, data });
}

export async function updateProblemReviewCount(
  id: string,
  reviewCount: number
): Promise<ProblemScalarFields> {
  return prisma.problem.update({
    where: { id },
    data: { reviewCount, lastReviewedAt: new Date() },
  });
}

export async function updateProblemSortOrder(
  id: string,
  sortOrder: number
): Promise<ProblemScalarFields> {
  return prisma.problem.update({
    where: { id },
    data: { sortOrder },
  });
}

export async function reorderProblems(
  problemIds: string[]
): Promise<void> {
  if (problemIds.length === 0) return;

  await prisma.$transaction(
    problemIds.map((id, index) =>
      prisma.problem.update({
        where: { id },
        data: { sortOrder: index },
      })
    ),
    { maxWait: 5000, timeout: 10000 }
  );
}
