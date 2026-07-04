import type {
  TopicStoreItem,
  SubTopicStoreItem,
  TopicCardViewModel,
  SubtopicViewModel,
} from "@/types/topics";
import { getAllProblems } from "@/lib/topic-utils";

export function computeTopicCardViewModel(
  topic: TopicStoreItem
): TopicCardViewModel {
  const allProblems = getAllProblems(topic);
  const totalProblems = allProblems.length;
  const solvedProblems = allProblems.filter(
    (p) => p.status === "SOLVED"
  ).length;
  const progressPercent =
    totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return {
    id: topic.id,
    name: topic.name,
    description: topic.description,
    totalProblems,
    solvedProblems,
    progressPercent,
  };
}

export function computeSubtopicViewModel(
  subtopic: SubTopicStoreItem
): SubtopicViewModel {
  const totalProblems = subtopic.problems.length;
  const solvedProblems = subtopic.problems.filter(
    (p) => p.status === "SOLVED"
  ).length;
  const progressPercent =
    totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return {
    id: subtopic.id,
    name: subtopic.name,
    description: subtopic.description,
    totalProblems,
    solvedProblems,
    progressPercent,
  };
}
