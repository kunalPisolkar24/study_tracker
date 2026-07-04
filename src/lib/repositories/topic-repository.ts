import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const topicInclude = {
  subTopics: {
    orderBy: { sortOrder: "asc" },
    include: { problems: { orderBy: { sortOrder: "asc" } } },
  },
  problems: {
    where: { subTopicId: null },
    orderBy: { sortOrder: "asc" },
  },
} satisfies Prisma.TopicInclude;

export type TopicWithRelations = Prisma.TopicGetPayload<{ include: typeof topicInclude }>;

export async function findTopicsByUserId(userId: string): Promise<TopicWithRelations[]> {
  return prisma.topic.findMany({
    where: { userId },
    include: topicInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function createTopic(
  userId: string,
  data: { name: string; description?: string | null }
): Promise<TopicWithRelations> {
  return prisma.topic.create({
    data: { userId, name: data.name, description: data.description ?? null },
    include: topicInclude,
  });
}

export async function updateTopic(
  id: string,
  userId: string,
  data: { name?: string; description?: string | null }
): Promise<TopicWithRelations> {
  return prisma.topic.update({
    where: { id, userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
    include: topicInclude,
  });
}

export async function deleteTopic(id: string, userId: string): Promise<void> {
  await prisma.topic.delete({ where: { id, userId } });
}
