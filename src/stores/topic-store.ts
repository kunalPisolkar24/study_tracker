"use client";

import { create } from "zustand";
import type { TopicStoreItem, ProblemStoreItem } from "@/types/topics";
import type {
  CreateTopicInput,
  UpdateTopicInput,
  CreateSubTopicInput,
  UpdateSubTopicInput,
  CreateProblemInput,
  UpdateProblemInput,
} from "@/lib/schemas";
import {
  createTopicService,
  updateTopicService,
  createSubTopicService,
  updateSubTopicService,
  createProblemService,
  updateProblemService,
  moveProblemInArray,
} from "@/lib/topic-factories";
import * as topicService from "@/lib/services/topic-service";
import * as subTopicService from "@/lib/services/subtopic-service";
import * as problemService from "@/lib/services/problem-service";
import { moveProblemBetweenContainers } from "@/lib/topic-diff";

interface TopicStoreState {
  topics: TopicStoreItem[];
  hydrated: boolean;
  hydrating: boolean;
  hydrationError: boolean;
}

interface TopicStoreActions {
  hydrate: () => Promise<void>;
  addTopic: (input: CreateTopicInput) => Promise<boolean>;
  updateTopic: (id: string, input: UpdateTopicInput) => void;
  removeTopic: (id: string) => void;
  addSubTopic: (topicId: string, input: Omit<CreateSubTopicInput, "topicId">) => Promise<boolean>;
  updateSubTopic: (topicId: string, subTopicId: string, input: UpdateSubTopicInput) => void;
  removeSubTopic: (topicId: string, subTopicId: string) => void;
  addProblem: (topicId: string, input: Omit<CreateProblemInput, "topicId">) => Promise<boolean>;
  updateProblem: (topicId: string, problemId: string, input: UpdateProblemInput) => void;
  removeProblem: (topicId: string, problemId: string) => void;
  updateProblemStatus: (topicId: string, problemId: string, status: ProblemStoreItem["status"]) => void;
  updateProblemReviewCount: (topicId: string, problemId: string, reviewCount: number) => void;
  moveProblem: (topicId: string, problemId: string, direction: "up" | "down") => Promise<void>;
  replaceTopic: (topicId: string, updated: TopicStoreItem) => void;
}

type TopicStore = TopicStoreState & TopicStoreActions;

function findProblemContainer(
  topics: TopicStoreItem[],
  topicId: string,
  problemId: string
): { topicIdx: number; subTopicIdx: number | null; problemIdx: number } | null {
  const topicIdx = topics.findIndex((t) => t.id === topicId);
  if (topicIdx === -1) return null;

  const topic = topics[topicIdx];
  const directIdx = topic.problems.findIndex((p) => p.id === problemId);
  if (directIdx !== -1) return { topicIdx, subTopicIdx: null, problemIdx: directIdx };

  for (let s = 0; s < topic.subtopics.length; s++) {
    const pIdx = topic.subtopics[s].problems.findIndex((p) => p.id === problemId);
    if (pIdx !== -1) return { topicIdx, subTopicIdx: s, problemIdx: pIdx };
  }

  return null;
}

function mapProblemInContainers(
  topics: TopicStoreItem[],
  topicId: string,
  problemId: string,
  updater: (problem: ProblemStoreItem) => ProblemStoreItem
): TopicStoreItem[] {
  const container = findProblemContainer(topics, topicId, problemId);
  if (!container) return topics;

  return topics.map((t, ti) => {
    if (ti !== container.topicIdx) return t;
    if (container.subTopicIdx === null) {
      return {
        ...t,
        problems: t.problems.map((p) =>
          p.id === problemId ? updater(p) : p
        ),
      };
    }
    return {
      ...t,
      subtopics: t.subtopics.map((s, si) =>
        si !== container.subTopicIdx
          ? s
          : { ...s, problems: s.problems.map((p) => p.id === problemId ? updater(p) : p) }
      ),
    };
  });
}

function removeProblemFromContainers(
  topics: TopicStoreItem[],
  topicId: string,
  problemId: string
): TopicStoreItem[] {
  const container = findProblemContainer(topics, topicId, problemId);
  if (!container) return topics;

  return topics.map((t, ti) => {
    if (ti !== container.topicIdx) return t;
    if (container.subTopicIdx === null) {
      return {
        ...t,
        problems: t.problems.filter((p) => p.id !== problemId),
      };
    }
    return {
      ...t,
      subtopics: t.subtopics.map((s, si) =>
        si !== container.subTopicIdx
          ? s
          : { ...s, problems: s.problems.filter((p) => p.id !== problemId) }
      ),
    };
  });
}

function createDebouncedProblemUpdate<T>(
  set: (fn: ((state: TopicStoreState) => Partial<TopicStoreState>) | Partial<TopicStoreState>) => void,
  get: () => TopicStoreState,
  applyUpdate: (value: T) => (problem: ProblemStoreItem) => ProblemStoreItem,
  persist: (problemId: string, value: T) => Promise<unknown>,
  delay = 300
): (topicId: string, problemId: string, value: T) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingProblemId: string | null = null;
  let pendingValue: T | null = null;
  let snapshot: TopicStoreItem[] = [];

  return (topicId, problemId, value) => {
    if (timer === null) {
      snapshot = get().topics;
    }

    set((state) => ({
      topics: mapProblemInContainers(
        state.topics,
        topicId,
        problemId,
        applyUpdate(value)
      ),
    }));

    pendingProblemId = problemId;
    pendingValue = value;

    if (timer !== null) clearTimeout(timer);

    timer = setTimeout(async () => {
      const id = pendingProblemId!;
      const val = pendingValue!;
      const snap = snapshot;
      timer = null;
      pendingProblemId = null;
      pendingValue = null;

      const result = await persist(id, val);
      if (!result) set({ topics: snap });
    }, delay);
  };
}

export const useTopicStore = create<TopicStore>((set, get) => ({
  topics: [],
  hydrated: false,
  hydrating: false,
  hydrationError: false,

  hydrate: async () => {
    if (get().hydrated) return;
    set({ hydrating: true });
    try {
      const dbTopics = await topicService.getTopics();
      if (dbTopics.length > 0) {
        set({ topics: dbTopics, hydrated: true, hydrating: false, hydrationError: false });
      } else {
        set({ hydrated: true, hydrating: false, hydrationError: false });
      }
    } catch {
      set({ hydrated: true, hydrating: false, hydrationError: true });
    }
  },

  addTopic: async (input) => {
    const snapshot = get().topics;
    const newTopic = createTopicService(input);
    set((state) => ({ topics: [...state.topics, newTopic] }));
    try {
      const dbTopic = await topicService.createTopic(input);
      if (dbTopic) {
        set((state) => ({
          topics: state.topics.map((t) => (t.id === newTopic.id ? dbTopic : t)),
        }));
        return true;
      }
      set({ topics: snapshot });
      return false;
    } catch {
      set({ topics: snapshot });
      return false;
    }
  },

  updateTopic: (id, input) => {
    const snapshot = get().topics;
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === id ? updateTopicService(t, input) : t
      ),
    }));
    topicService.updateTopic(id, input).then((dbTopic) => {
      if (!dbTopic) set({ topics: snapshot });
    });
  },

  removeTopic: (id) => {
    const snapshot = get().topics;
    set((state) => ({
      topics: state.topics.filter((t) => t.id !== id),
    }));
    topicService.deleteTopic(id).then((success) => {
      if (!success) set({ topics: snapshot });
    });
  },

  addSubTopic: async (topicId, input) => {
    const snapshot = get().topics;
    const topic = get().topics.find((t) => t.id === topicId);
    const newSubTopic = createSubTopicService({ ...input, topicId }, topic?.subtopics);
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId
          ? { ...t, subtopics: [...t.subtopics, newSubTopic] }
          : t
      ),
    }));
    try {
      const dbSubTopic = await subTopicService.createSubTopic(topicId, input);
      if (dbSubTopic) {
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  subtopics: t.subtopics.map((s) =>
                    s.id === newSubTopic.id ? dbSubTopic : s
                  ),
                }
              : t
          ),
        }));
        return true;
      }
      set({ topics: snapshot });
      return false;
    } catch {
      set({ topics: snapshot });
      return false;
    }
  },

  updateSubTopic: (topicId, subTopicId, input) => {
    const snapshot = get().topics;
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id !== topicId
          ? t
          : {
              ...t,
              subtopics: t.subtopics.map((s) =>
                s.id === subTopicId ? updateSubTopicService(s, input) : s
              ),
            }
      ),
    }));
    subTopicService.updateSubTopic(subTopicId, input).then((dbSubTopic) => {
      if (!dbSubTopic) set({ topics: snapshot });
    });
  },

  removeSubTopic: (topicId, subTopicId) => {
    const snapshot = get().topics;
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId
          ? { ...t, subtopics: t.subtopics.filter((s) => s.id !== subTopicId) }
          : t
      ),
    }));
    subTopicService.deleteSubTopic(subTopicId).then((success) => {
      if (!success) set({ topics: snapshot });
    });
  },

  addProblem: async (topicId, input) => {
    const snapshot = get().topics;
    const topic = get().topics.find((t) => t.id === topicId);
    const existingProblems = topic
      ? input.subTopicId
        ? topic.subtopics.find((s) => s.id === input.subTopicId)?.problems
        : topic.problems
      : undefined;
    const newProblem = createProblemService({ ...input, topicId }, existingProblems);
    set((state) => ({
      topics: state.topics.map((t) => {
        if (t.id !== topicId) return t;
        if (input.subTopicId) {
          return {
            ...t,
            subtopics: t.subtopics.map((s) =>
              s.id === input.subTopicId
                ? { ...s, problems: [...s.problems, newProblem] }
                : s
            ),
          };
        }
        return { ...t, problems: [...t.problems, newProblem] };
      }),
    }));
    try {
      const dbProblem = await problemService.createProblem(topicId, input);
      if (dbProblem) {
        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            const updateProblemInList = (problems: ProblemStoreItem[]) =>
              problems.map((p) => (p.id === newProblem.id ? dbProblem : p));
            if (input.subTopicId) {
              return {
                ...t,
                subtopics: t.subtopics.map((s) =>
                  s.id === input.subTopicId
                    ? { ...s, problems: updateProblemInList(s.problems) }
                    : s
                ),
              };
            }
            return { ...t, problems: updateProblemInList(t.problems) };
          }),
        }));
        return true;
      }
      set({ topics: snapshot });
      return false;
    } catch {
      set({ topics: snapshot });
      return false;
    }
  },

  updateProblem: (topicId, problemId, input) => {
    const snapshot = get().topics;

    if (input.subTopicId !== undefined) {
      set((state) => {
        const container = findProblemContainer(state.topics, topicId, problemId);
        if (!container) return state;

        const { topicIdx, subTopicIdx, problemIdx } = container;
        const topic = state.topics[topicIdx];

        const oldProblem = subTopicIdx === null
          ? topic.problems[problemIdx]
          : topic.subtopics[subTopicIdx].problems[problemIdx];

        if (oldProblem.subTopicId === input.subTopicId) {
          return {
            topics: mapProblemInContainers(
              state.topics, topicId, problemId,
              (p) => updateProblemService(p, input)
            ),
          };
        }

        const updatedProblem = updateProblemService(oldProblem, input);

        return {
          topics: moveProblemBetweenContainers(
            state.topics, topicIdx, problemId,
            subTopicIdx, input.subTopicId!, updatedProblem
          ),
        };
      });
    } else {
      set((state) => ({
        topics: mapProblemInContainers(
          state.topics, topicId, problemId,
          (p) => updateProblemService(p, input)
        ),
      }));
    }

    problemService.updateProblem(problemId, input).then((dbProblem) => {
      if (!dbProblem) set({ topics: snapshot });
    });
  },

  removeProblem: (topicId, problemId) => {
    const snapshot = get().topics;
    set((state) => ({
      topics: removeProblemFromContainers(state.topics, topicId, problemId),
    }));
    problemService.deleteProblem(problemId).then((success) => {
      if (!success) set({ topics: snapshot });
    });
  },

  updateProblemStatus: createDebouncedProblemUpdate(
    set, get,
    (status) => (p) => ({
      ...p,
      status,
      ...(status === "SOLVED" ? { solvedAt: new Date().toISOString() } : {}),
    }),
    (id, status) => problemService.updateProblemStatus(id, status),
  ),

  updateProblemReviewCount: createDebouncedProblemUpdate(
    set, get,
    (reviewCount) => (p) => ({ ...p, reviewCount }),
    (id, reviewCount) => problemService.updateProblemReviewCount(id, reviewCount),
  ),

  moveProblem: (() => {
    let reorderTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingProblemIds: string[] = [];

    return async function moveProblem(
      this: void,
      topicId: string,
      problemId: string,
      direction: "up" | "down"
    ) {
      const container = findProblemContainer(get().topics, topicId, problemId);
      if (!container) return;
      const { topicIdx, subTopicIdx, problemIdx } = container;

      const problems = subTopicIdx === null
        ? get().topics[topicIdx].problems
        : get().topics[topicIdx].subtopics[subTopicIdx].problems;

      const targetIdx = direction === "up" ? problemIdx - 1 : problemIdx + 1;
      if (targetIdx < 0 || targetIdx >= problems.length) return;

      set((state) => ({
        topics: state.topics.map((t, ti) => {
          if (ti !== topicIdx) return t;
          if (subTopicIdx === null) {
            return {
              ...t,
              problems: moveProblemInArray(t.problems, problemId, direction),
            };
          }
          return {
            ...t,
            subtopics: t.subtopics.map((s, si) =>
              si !== subTopicIdx
                ? s
                : { ...s, problems: moveProblemInArray(s.problems, problemId, direction) }
            ),
          };
        }),
      }));

      const updatedState = get().topics;
      pendingProblemIds = (subTopicIdx === null
        ? updatedState[topicIdx].problems
        : updatedState[topicIdx].subtopics[subTopicIdx].problems
      ).map((p) => p.id);

      if (reorderTimer !== null) {
        clearTimeout(reorderTimer);
      }

      reorderTimer = setTimeout(async () => {
        const idsToReorder = pendingProblemIds;
        pendingProblemIds = [];

        const success = await problemService.reorderProblems(idsToReorder);

        if (!success) {
          const dbTopics = await topicService.getTopics();
          if (dbTopics.length > 0) {
            set({ topics: dbTopics });
          }
        }
      }, 300);
    };
  })(),

  replaceTopic: (topicId, updated) => {
    set((state) => ({
      topics: state.topics.map((t) => (t.id === topicId ? updated : t)),
    }));
  },
}));
