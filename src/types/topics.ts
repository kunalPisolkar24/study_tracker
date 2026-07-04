export interface TopicStoreItem {
  id: string;
  name: string;
  description?: string;
  subtopics: SubTopicStoreItem[];
  problems: ProblemStoreItem[];
}

export interface SubTopicStoreItem {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  problems: ProblemStoreItem[];
}

export interface ProblemStoreItem {
  id: string;
  title: string;
  url?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "TODO" | "ATTEMPTED" | "SOLVED" | "MARKED_FOR_REVIEW";
  subTopicId?: string | null;
  notes?: string;
  reviewCount: number;
  sortOrder: number;
  solvedAt?: string;
}

export interface TopicCardViewModel {
  id: string;
  name: string;
  description?: string;
  totalProblems: number;
  solvedProblems: number;
  progressPercent: number;
}

export interface SubtopicViewModel {
  id: string;
  name: string;
  description?: string;
  totalProblems: number;
  solvedProblems: number;
  progressPercent: number;
}
