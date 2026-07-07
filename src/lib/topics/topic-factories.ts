import {
  createTopicSchema,
  updateTopicSchema,
  createSubTopicSchema,
  updateSubTopicSchema,
  createProblemSchema,
  updateProblemSchema,
  type CreateTopicInput,
  type UpdateTopicInput,
  type CreateSubTopicInput,
  type UpdateSubTopicInput,
  type CreateProblemInput,
  type UpdateProblemInput,
} from "@/lib/schemas";
import type {
  TopicStoreItem,
  SubTopicStoreItem,
  ProblemStoreItem,
} from "@/types/topics";

function generateId(): string {
  return crypto.randomUUID();
}

export function createTopicService(input: CreateTopicInput): TopicStoreItem {
  const parsed = createTopicSchema.parse(input);
  return {
    id: generateId(),
    name: parsed.name,
    description: parsed.description,
    subtopics: [],
    problems: [],
  };
}

export function updateTopicService(
  topic: TopicStoreItem,
  input: UpdateTopicInput
): TopicStoreItem {
  const parsed = updateTopicSchema.parse(input);
  return {
    ...topic,
    ...(parsed.name !== undefined && { name: parsed.name }),
    ...(parsed.description !== undefined && { description: parsed.description }),
  };
}

export function createSubTopicService(
  input: CreateSubTopicInput,
  existingSubtopics?: Pick<SubTopicStoreItem, "sortOrder">[]
): SubTopicStoreItem {
  const parsed = createSubTopicSchema.parse(input);
  const maxSortOrder = existingSubtopics && existingSubtopics.length > 0
    ? Math.max(...existingSubtopics.map((s) => s.sortOrder))
    : -1;
  return {
    id: generateId(),
    name: parsed.name,
    description: parsed.description,
    sortOrder: maxSortOrder + 1,
    problems: [],
  };
}

export function updateSubTopicService(
  subTopic: SubTopicStoreItem,
  input: UpdateSubTopicInput
): SubTopicStoreItem {
  const parsed = updateSubTopicSchema.parse(input);
  return {
    ...subTopic,
    ...(parsed.name !== undefined && { name: parsed.name }),
    ...(parsed.description !== undefined && {
      description: parsed.description,
    }),
  };
}

export function createProblemService(
  input: CreateProblemInput,
  existingProblems?: Pick<ProblemStoreItem, "sortOrder">[]
): ProblemStoreItem {
  const parsed = createProblemSchema.parse(input);
  const maxSortOrder = existingProblems && existingProblems.length > 0
    ? Math.max(...existingProblems.map((p) => p.sortOrder))
    : -1;
  return {
    id: generateId(),
    title: parsed.title,
    url: parsed.url || undefined,
    difficulty: parsed.difficulty,
    status: "TODO",
    subTopicId: parsed.subTopicId || null,
    notes: parsed.notes,
    reviewCount: 0,
    sortOrder: maxSortOrder + 1,
  };
}

export function updateProblemService(
  problem: ProblemStoreItem,
  input: UpdateProblemInput
): ProblemStoreItem {
  const parsed = updateProblemSchema.parse(input);
  return {
    ...problem,
    ...(parsed.title !== undefined && { title: parsed.title }),
    ...(parsed.url !== undefined && { url: parsed.url || undefined }),
    ...(parsed.difficulty !== undefined && { difficulty: parsed.difficulty }),
    ...(parsed.subTopicId !== undefined && { subTopicId: parsed.subTopicId }),
    ...(parsed.notes !== undefined && { notes: parsed.notes }),
  };
}

export function moveProblemInArray(
  problems: ProblemStoreItem[],
  problemId: string,
  direction: "up" | "down"
): ProblemStoreItem[] {
  const idx = problems.findIndex((p) => p.id === problemId);
  if (idx === -1) return problems;
  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= problems.length) return problems;
  const copy = [...problems];
  [copy[idx], copy[targetIdx]] = [copy[targetIdx], copy[idx]];
  return copy;
}

export function moveSubTopicInArray(
  subtopics: SubTopicStoreItem[],
  subTopicId: string,
  direction: "up" | "down"
): SubTopicStoreItem[] {
  const idx = subtopics.findIndex((s) => s.id === subTopicId);
  if (idx === -1) return subtopics;
  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= subtopics.length) return subtopics;
  const copy = [...subtopics];
  [copy[idx], copy[targetIdx]] = [copy[targetIdx], copy[idx]];
  return copy;
}
