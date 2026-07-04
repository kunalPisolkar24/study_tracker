"use server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { logActivity } from "@/lib/services/activity-service";
import type { ProblemStoreItem } from "@/types/topics";

export type ActivityServiceForProblems = Pick<typeof import("@/lib/services/activity-service"), "logActivity">;
import type { CreateProblemInput, UpdateProblemInput } from "@/lib/schemas";
import * as problemRepo from "@/lib/repositories/problem-repository";

export type ProblemRepository = typeof problemRepo;

function mapProblem(p: problemRepo.ProblemScalarFields): ProblemStoreItem {
  return {
    id: p.id,
    title: p.title,
    url: p.url ?? undefined,
    difficulty: p.difficulty as ProblemStoreItem["difficulty"],
    status: p.status as ProblemStoreItem["status"],
    reviewCount: p.reviewCount,
    sortOrder: p.sortOrder,
    notes: p.notes ?? undefined,
    solvedAt: p.lastSolvedAt?.toISOString() ?? undefined,
    subTopicId: p.subTopicId,
  };
}

export async function createProblem(
  topicId: string,
  input: Omit<CreateProblemInput, "topicId">
): Promise<ProblemStoreItem | null> {
  try {
    const problem = await problemRepo.createProblem(topicId, {
      subTopicId: input.subTopicId ?? null,
      title: input.title,
      url: input.url ?? null,
      difficulty: input.difficulty,
      notes: input.notes ?? null,
    });
    return mapProblem(problem);
  } catch (error) {
    logger.error("Failed to create problem", {
      topicId,
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function updateProblem(
  problemId: string,
  input: UpdateProblemInput
): Promise<ProblemStoreItem | null> {
  try {
    const data: {
      title?: string;
      url?: string | null;
      difficulty?: string;
      subTopicId?: string | null;
      notes?: string | null;
    } = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.url !== undefined) data.url = input.url || null;
    if (input.difficulty !== undefined) data.difficulty = input.difficulty;
    if (input.subTopicId !== undefined) data.subTopicId = input.subTopicId;
    if (input.notes !== undefined) data.notes = input.notes || null;

    const problem = await problemRepo.updateProblem(problemId, data);
    return mapProblem(problem);
  } catch (error) {
    logger.error("Failed to update problem", {
      problemId,
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function deleteProblem(problemId: string): Promise<boolean> {
  try {
    await problemRepo.deleteProblem(problemId);
    return true;
  } catch (error) {
    logger.error("Failed to delete problem", {
      problemId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function updateProblemStatus(
  problemId: string,
  status: ProblemStoreItem["status"]
): Promise<ProblemStoreItem | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const now = status === "SOLVED" ? new Date() : null;
    const problem = await problemRepo.updateProblemStatus(problemId, status, now);

    if (status === "SOLVED") {
      await logActivity(problemId, "SOLVED");
    }

    return mapProblem(problem);
  } catch (error) {
    logger.error("Failed to update problem status", {
      problemId,
      status,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function reorderProblem(
  problemId: string,
  sortOrder: number
): Promise<ProblemStoreItem | null> {
  try {
    const problem = await problemRepo.updateProblemSortOrder(problemId, sortOrder);
    return mapProblem(problem);
  } catch (error) {
    logger.error("Failed to reorder problem", {
      problemId,
      sortOrder,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function reorderProblems(
  problemIds: string[]
): Promise<boolean> {
  try {
    await problemRepo.reorderProblems(problemIds);
    return true;
  } catch (error) {
    logger.error("Failed to reorder problems", {
      problemIds,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function updateProblemReviewCount(
  problemId: string,
  reviewCount: number
): Promise<ProblemStoreItem | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const problem = await problemRepo.updateProblemReviewCount(problemId, reviewCount);

    await logActivity(problemId, "REVIEWED");

    return mapProblem(problem);
  } catch (error) {
    logger.error("Failed to update problem review count", {
      problemId,
      reviewCount,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
