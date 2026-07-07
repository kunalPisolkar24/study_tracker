"use server";

import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/shared/logger";
import { prisma } from "@/lib/shared/prisma";
import { mapPrismaSubTopic } from "@/lib/topics/mappers";
import * as subTopicRepo from "@/lib/topics/repositories/subtopic-repository";
import * as topicRepo from "@/lib/topics/repositories/topic-repository";
import { createSubTopicSchema, updateSubTopicSchema } from "@/lib/topics/schemas";
import type { SubTopicStoreItem } from "@/types/topics";
import type { CreateSubTopicInput, UpdateSubTopicInput } from "@/lib/topics/schemas";

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function userOwnsTopic(userId: string, topicId: string): Promise<boolean> {
  const topic = await topicRepo.findTopicsByUserId(userId);
  return topic.some((t) => t.id === topicId);
}

async function userOwnsSubTopic(userId: string, subTopicId: string): Promise<string | null> {
  const subTopic = await prisma.subTopic.findUnique({
    where: { id: subTopicId },
    select: { topicId: true },
  });
  if (!subTopic) return null;
  const ownsTopic = await userOwnsTopic(userId, subTopic.topicId);
  return ownsTopic ? subTopic.topicId : null;
}

export async function createSubTopic(
  topicId: string,
  input: Omit<CreateSubTopicInput, "topicId">
): Promise<SubTopicStoreItem | null> {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    const ownsTopic = await userOwnsTopic(userId, topicId);
    if (!ownsTopic) return null;

    const parsed = createSubTopicSchema.safeParse({ ...input, topicId });
    if (!parsed.success) {
      logger.warn("createSubTopic validation failed", { errors: parsed.error.flatten() });
      return null;
    }

    const subTopic = await subTopicRepo.createSubTopic(topicId, {
      name: parsed.data.name,
      description: parsed.data.description,
    });
    return mapPrismaSubTopic(subTopic);
  } catch (error) {
    logger.error("Failed to create sub topic", {
      topicId,
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function updateSubTopic(
  subTopicId: string,
  input: UpdateSubTopicInput
): Promise<SubTopicStoreItem | null> {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    const topicId = await userOwnsSubTopic(userId, subTopicId);
    if (!topicId) return null;

    const parsed = updateSubTopicSchema.safeParse(input);
    if (!parsed.success) {
      logger.warn("updateSubTopic validation failed", { errors: parsed.error.flatten() });
      return null;
    }

    const subTopic = await subTopicRepo.updateSubTopic(subTopicId, {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && {
        description: parsed.data.description ?? null,
      }),
    });
    return mapPrismaSubTopic(subTopic);
  } catch (error) {
    logger.error("Failed to update sub topic", {
      subTopicId,
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function deleteSubTopic(subTopicId: string): Promise<boolean> {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    const topicId = await userOwnsSubTopic(userId, subTopicId);
    if (!topicId) return false;

    await subTopicRepo.deleteSubTopic(subTopicId);
    return true;
  } catch (error) {
    logger.error("Failed to delete sub topic", {
      subTopicId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function reorderSubtopics(
  topicId: string,
  subTopicIds: string[]
): Promise<boolean> {
  try {
    await subTopicRepo.reorderSubtopics(topicId, subTopicIds);
    return true;
  } catch (error) {
    logger.error("Failed to reorder subtopics", {
      topicId,
      subTopicIds,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
