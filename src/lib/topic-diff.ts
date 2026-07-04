import type {
  TopicStoreItem,
  ProblemStoreItem,
} from "@/types/topics";
import type {
  UpdateSubTopicInput,
  UpdateProblemInput,
} from "@/lib/schemas";
import { getAllProblems } from "@/lib/topic-utils";

export function updateProblemInDraft(
  draft: TopicStoreItem,
  problemId: string,
  updates: Partial<Pick<ProblemStoreItem, "status" | "reviewCount">>
): TopicStoreItem {
  const updateInList = (problems: ProblemStoreItem[]) =>
    problems.map((p) => (p.id === problemId ? { ...p, ...updates } : p));

  return {
    ...draft,
    problems: updateInList(draft.problems),
    subtopics: draft.subtopics.map((st) => ({
      ...st,
      problems: updateInList(st.problems),
    })),
  };
}

export interface BatchChanges {
  subtopicUpdates: Array<{ id: string; input: UpdateSubTopicInput }>;
  subtopicDeletes: string[];
  problemUpdates: Array<{ id: string; input: UpdateProblemInput }>;
  problemDeletes: string[];
  problemReorders: string[][];
  subtopicReorders: string[][];
  hasAny: boolean;
}

export function moveProblemBetweenContainers(
  topics: TopicStoreItem[],
  topicIdx: number,
  problemId: string,
  sourceSubTopicIdx: number | null,
  targetSubTopicId: string | null,
  updatedProblem: ProblemStoreItem
): TopicStoreItem[] {
  return topics.map((t, ti) => {
    if (ti !== topicIdx) return t;

    let updatedTopic = t;

    if (sourceSubTopicIdx === null) {
      updatedTopic = {
        ...updatedTopic,
        problems: updatedTopic.problems.filter((p) => p.id !== problemId),
      };
    } else {
      updatedTopic = {
        ...updatedTopic,
        subtopics: updatedTopic.subtopics.map((s, si) =>
          si !== sourceSubTopicIdx
            ? s
            : { ...s, problems: s.problems.filter((p) => p.id !== problemId) }
        ),
      };
    }

    if (targetSubTopicId === null) {
      return {
        ...updatedTopic,
        problems: [...updatedTopic.problems, updatedProblem],
      };
    }

    return {
      ...updatedTopic,
      subtopics: updatedTopic.subtopics.map((s) =>
        s.id !== targetSubTopicId
          ? s
          : { ...s, problems: [...s.problems, updatedProblem] }
      ),
    };
  });
}

export function computeBatchChanges(
  original: TopicStoreItem,
  draft: TopicStoreItem
): BatchChanges {
  const subtopicUpdates: BatchChanges["subtopicUpdates"] = [];
  const subtopicDeletes: BatchChanges["subtopicDeletes"] = [];
  const problemUpdates: BatchChanges["problemUpdates"] = [];
  const problemDeletes: BatchChanges["problemDeletes"] = [];
  const problemReorders: BatchChanges["problemReorders"] = [];
  const subtopicReorders: BatchChanges["subtopicReorders"] = [];

  for (const origSt of original.subtopics) {
    if (!draft.subtopics.find((s) => s.id === origSt.id)) {
      subtopicDeletes.push(origSt.id);
    }
  }

  for (const draftSt of draft.subtopics) {
    const origSt = original.subtopics.find((s) => s.id === draftSt.id);
    if (origSt) {
      const changes: UpdateSubTopicInput = {};
      if (origSt.name !== draftSt.name) changes.name = draftSt.name;
      if (origSt.description !== draftSt.description) changes.description = draftSt.description;
      if (Object.keys(changes).length > 0) {
        subtopicUpdates.push({ id: draftSt.id, input: changes });
      }
    }
  }

  const deletedSubtopicIds = new Set(subtopicDeletes);
  const allOriginal = getAllProblems(original);
  const allDraft = getAllProblems(draft);

  for (const origP of allOriginal) {
    if (!allDraft.find((p) => p.id === origP.id)) {
      if (origP.subTopicId && deletedSubtopicIds.has(origP.subTopicId)) continue;
      problemDeletes.push(origP.id);
    }
  }

  for (const draftP of allDraft) {
    const origP = allOriginal.find((p) => p.id === draftP.id);
    if (origP) {
      const changes: UpdateProblemInput = {};
      if (origP.title !== draftP.title) changes.title = draftP.title;
      if (origP.url !== draftP.url) changes.url = draftP.url;
      if (origP.difficulty !== draftP.difficulty) changes.difficulty = draftP.difficulty;
      if (origP.subTopicId !== draftP.subTopicId) changes.subTopicId = draftP.subTopicId ?? null;
      if (origP.notes !== draftP.notes) changes.notes = draftP.notes;
      if (Object.keys(changes).length > 0) {
        problemUpdates.push({ id: draftP.id, input: changes });
      }
    }
  }

  function checkContainer(origProblems: ProblemStoreItem[], draftProblems: ProblemStoreItem[]) {
    const origIds = origProblems.map((p) => p.id);
    const draftIds = draftProblems.map((p) => p.id);
    const changed =
      origIds.length !== draftIds.length ||
      origIds.some((id, i) => id !== draftIds[i]);
    if (changed && draftIds.length > 0) {
      problemReorders.push(draftIds);
    }
  }

  checkContainer(original.problems, draft.problems);

  for (const draftSt of draft.subtopics) {
    const origSt = original.subtopics.find((s) => s.id === draftSt.id);
    if (origSt) {
      checkContainer(origSt.problems, draftSt.problems);
    }
  }

  const origSubTopicIds = original.subtopics.map((s) => s.id);
  const draftSubTopicIds = draft.subtopics.map((s) => s.id);
  const subTopicOrderChanged =
    origSubTopicIds.length !== draftSubTopicIds.length ||
    origSubTopicIds.some((id, i) => id !== draftSubTopicIds[i]);
  if (subTopicOrderChanged && draftSubTopicIds.length > 0) {
    subtopicReorders.push(draftSubTopicIds);
  }

  const hasAny =
    subtopicUpdates.length > 0 ||
    subtopicDeletes.length > 0 ||
    problemUpdates.length > 0 ||
    problemDeletes.length > 0 ||
    problemReorders.length > 0 ||
    subtopicReorders.length > 0;

  return {
    subtopicUpdates,
    subtopicDeletes,
    problemUpdates,
    problemDeletes,
    problemReorders,
    subtopicReorders,
    hasAny,
  };
}
