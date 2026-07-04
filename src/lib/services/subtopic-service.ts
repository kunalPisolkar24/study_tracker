"use server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { mapPrismaSubTopic } from "@/lib/mappers";
import * as subTopicRepo from "@/lib/repositories/subtopic-repository";
import * as topicRepo from "@/lib/repositories/topic-repository";
import type { SubTopicStoreItem } from "@/types/topics";
import type { CreateSubTopicInput, UpdateSubTopicInput } from "@/lib/schemas";

export type SubTopicRepository = typeof subTopicRepo;

export async function createSubTopic(
  topicId: string,
  input: Omit<CreateSubTopicInput, "topicId">
): Promise<SubTopicStoreItem | null> {
  try {
    const userId = (await auth())?.user?.id;
    if (!userId) return null;

    const topic = await topicRepo.findTopicsByUserId(userId);
    const ownsTopic = topic.some((t) => t.id === topicId);
    if (!ownsTopic) return null;

    const subTopic = await subTopicRepo.createSubTopic(topicId, {
      name: input.name,
      description: input.description,
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
    const subTopic = await subTopicRepo.updateSubTopic(subTopicId, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description ?? null,
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
