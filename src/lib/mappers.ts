import type {
  TopicStoreItem,
  SubTopicStoreItem,
  ProblemStoreItem,
} from "@/types/topics";

export function mapPrismaProblem(p: {
  id: string;
  title: string;
  url: string | null;
  difficulty: string;
  status: string;
  reviewCount: number;
  sortOrder: number;
  notes: string | null;
  lastSolvedAt: Date | null;
  subTopicId: string | null;
}): ProblemStoreItem {
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

export function mapPrismaTopic(t: {
  id: string;
  name: string;
  description: string | null;
  subTopics: Array<{
    id: string;
    name: string;
    description: string | null;
    sortOrder: number;
    problems: Array<{
      id: string;
      title: string;
      url: string | null;
      difficulty: string;
      status: string;
      reviewCount: number;
      sortOrder: number;
      notes: string | null;
      lastSolvedAt: Date | null;
      subTopicId: string | null;
    }>;
  }>;
  problems: Array<{
    id: string;
    title: string;
    url: string | null;
    difficulty: string;
    status: string;
    reviewCount: number;
    sortOrder: number;
    notes: string | null;
    lastSolvedAt: Date | null;
    subTopicId: string | null;
  }>;
}): TopicStoreItem {
  return {
    id: t.id,
    name: t.name,
    description: t.description ?? undefined,
    subtopics: t.subTopics.map((st) => ({
      id: st.id,
      name: st.name,
      description: st.description ?? undefined,
      sortOrder: st.sortOrder,
      problems: st.problems.map(mapPrismaProblem),
    })),
    problems: t.problems.map(mapPrismaProblem),
  };
}

export function mapPrismaSubTopic(st: {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  problems: Array<{
    id: string;
    title: string;
    url: string | null;
    difficulty: string;
    status: string;
    reviewCount: number;
    sortOrder: number;
    notes: string | null;
    lastSolvedAt: Date | null;
    subTopicId: string | null;
  }>;
}): SubTopicStoreItem {
  return {
    id: st.id,
    name: st.name,
    description: st.description ?? undefined,
    sortOrder: st.sortOrder,
    problems: st.problems.map(mapPrismaProblem),
  };
}
