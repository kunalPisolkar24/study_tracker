import { useTopicStore } from "@/stores/topic-store";
import type {
  CreateTopicInput,
  UpdateTopicInput,
  CreateSubTopicInput,
  UpdateSubTopicInput,
  CreateProblemInput,
  UpdateProblemInput,
} from "@/lib/schemas";

export function useTopics() {
  return useTopicStore((s) => s.topics);
}

export function useTopicById(id: string) {
  return useTopicStore((s) => s.topics.find((t) => t.id === id));
}

export function useTopicActions() {
  return useTopicStore((s) => ({
    addTopic: s.addTopic as (input: CreateTopicInput) => Promise<boolean>,
    updateTopic: s.updateTopic as (id: string, input: UpdateTopicInput) => void,
    removeTopic: s.removeTopic as (id: string) => void,
    addSubTopic: s.addSubTopic as (topicId: string, input: Omit<CreateSubTopicInput, "topicId">) => Promise<boolean>,
    updateSubTopic: s.updateSubTopic as (topicId: string, subTopicId: string, input: UpdateSubTopicInput) => void,
    removeSubTopic: s.removeSubTopic as (topicId: string, subTopicId: string) => void,
    addProblem: s.addProblem as (topicId: string, input: Omit<CreateProblemInput, "topicId">) => Promise<boolean>,
    updateProblem: s.updateProblem as (topicId: string, problemId: string, input: UpdateProblemInput) => void,
    removeProblem: s.removeProblem as (topicId: string, problemId: string) => void,
    updateProblemStatus: s.updateProblemStatus as (topicId: string, problemId: string, status: import("@/types/topics").ProblemStoreItem["status"]) => void,
    updateProblemReviewCount: s.updateProblemReviewCount as (topicId: string, problemId: string, reviewCount: number) => void,
    moveProblem: s.moveProblem as (topicId: string, problemId: string, direction: "up" | "down") => Promise<void>,
  }));
}
