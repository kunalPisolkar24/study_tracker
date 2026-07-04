"use server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { mapPrismaTopic } from "@/lib/mappers";
import * as topicRepo from "@/lib/repositories/topic-repository";
import type { TopicStoreItem } from "@/types/topics";
import type { CreateTopicInput, UpdateTopicInput } from "@/lib/schemas";

export type TopicRepository = typeof topicRepo;

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getTopics(): Promise<TopicStoreItem[]> {
  try {
    const userId = await getUserId();
    if (!userId) return [];

    const topics = await topicRepo.findTopicsByUserId(userId);
    return topics.map(mapPrismaTopic);
  } catch (error) {
    logger.error("Failed to fetch topics", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export async function createTopic(
  input: CreateTopicInput
): Promise<TopicStoreItem | null> {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    const topic = await topicRepo.createTopic(userId, {
      name: input.name,
      description: input.description,
    });
    return mapPrismaTopic(topic);
  } catch (error) {
    logger.error("Failed to create topic", {
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function updateTopic(
  id: string,
  input: UpdateTopicInput
): Promise<TopicStoreItem | null> {
  try {
    const userId = await getUserId();
    if (!userId) return null;

    const topic = await topicRepo.updateTopic(id, userId, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description ?? null,
      }),
    });
    return mapPrismaTopic(topic);
  } catch (error) {
    logger.error("Failed to update topic", {
      id,
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function deleteTopic(id: string): Promise<boolean> {
  try {
    const userId = await getUserId();
    if (!userId) return false;

    await topicRepo.deleteTopic(id, userId);
    return true;
  } catch (error) {
    logger.error("Failed to delete topic", {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
