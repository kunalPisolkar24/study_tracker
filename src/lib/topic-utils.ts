import type { TopicStoreItem, ProblemStoreItem } from "@/types/topics";

export function getAllProblems(topic: TopicStoreItem): ProblemStoreItem[] {
  const all = [...topic.problems];
  for (const subtopic of topic.subtopics) {
    all.push(...subtopic.problems);
  }
  return all;
}

export function filterTopics(
  topics: TopicStoreItem[],
  query: string
): TopicStoreItem[] {
  if (!query.trim()) return topics;
  const lowerQuery = query.toLowerCase();
  return topics.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      (t.description?.toLowerCase().includes(lowerQuery) ?? false)
  );
}

export function paginateTopics<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const start = (clampedPage - 1) * pageSize;
  const paginatedItems = items.slice(start, start + pageSize);
  return { items: paginatedItems, totalPages, currentPage: clampedPage };
}
