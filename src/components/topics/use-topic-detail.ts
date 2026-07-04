"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useTopicStore } from "@/stores/topic-store";
import {
  computeTopicCardViewModel,
  computeSubtopicViewModel,
} from "@/lib/topic-view-models";
import {
  computeBatchChanges,
  updateProblemInDraft,
} from "@/lib/topic-diff";
import { moveSubTopicInArray } from "@/lib/topic-factories";
import type {
  SubTopicStoreItem,
  ProblemStoreItem,
  TopicStoreItem,
} from "@/types/topics";
import * as topicService from "@/lib/services/topic-service";
import * as subTopicService from "@/lib/services/subtopic-service";
import * as problemService from "@/lib/services/problem-service";

type DialogState =
  | { type: "idle" }
  | { type: "createSubTopic" }
  | { type: "editSubTopic"; target: SubTopicStoreItem }
  | { type: "createProblem"; subTopicId?: string }
  | { type: "editProblem"; target: ProblemStoreItem }
  | { type: "notes"; target: ProblemStoreItem }
  | { type: "delete"; entityType: "subtopic" | "problem"; target: { id: string; name: string } };

export function useTopicDetail(topicId: string) {
  const hydrated = useTopicStore((s) => s.hydrated);
  const topic = useTopicStore((s) => s.topics.find((t) => t.id === topicId));
  const {
    addSubTopic,
    updateSubTopic,
    removeSubTopic,
    addProblem,
    updateProblem,
    removeProblem,
    updateProblemStatus,
    updateProblemReviewCount,
    moveProblem,
    replaceTopic,
  } = useTopicStore();

  const [dialog, setDialog] = useState<DialogState>({ type: "idle" });
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TopicStoreItem | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const displayTopic = isEditing && draft ? draft : topic;

  const topicViewModel = useMemo(
    () => (displayTopic ? computeTopicCardViewModel(displayTopic) : null),
    [displayTopic]
  );

  const displayDirectProblems = displayTopic?.problems ?? [];
  const subtopicViewModels = useMemo(
    () => displayTopic?.subtopics.map(computeSubtopicViewModel) ?? [],
    [displayTopic?.subtopics]
  );

  const hasSubtopics = (displayTopic?.subtopics.length ?? 0) > 0;
  const hasDirectProblems = (displayDirectProblems?.length ?? 0) > 0;
  const hasAnyContent = hasSubtopics || hasDirectProblems;

  async function handleCreateSubTopic(input: { name: string; description?: string }): Promise<boolean> {
    return addSubTopic(topicId, input);
  }

  async function handleEditSubTopic(input: { name: string; description?: string }): Promise<boolean> {
    if (dialog.type !== "editSubTopic") return false;
    if (isEditing) {
      handleDraftSubTopicEdit(dialog.target.id, input);
      return true;
    }
    updateSubTopic(topicId, dialog.target.id, input);
    toast.success("Sub-topic updated successfully");
    return true;
  }

  function handleDeleteSubTopic() {
    if (dialog.type !== "delete" || dialog.entityType !== "subtopic") return;
    if (isEditing) {
      setDraft((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtopics: prev.subtopics.filter((st) => st.id !== dialog.target.id),
        };
      });
      setHasChanges(true);
      setDialog({ type: "idle" });
      return;
    }
    removeSubTopic(topicId, dialog.target.id);
    setDialog({ type: "idle" });
    toast.success("Sub-topic deleted successfully");
  }

  async function handleCreateProblem(input: {
    title: string;
    url?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    subTopicId?: string | null;
    notes?: string;
  }): Promise<boolean> {
    return addProblem(topicId, {
      ...input,
      subTopicId: input.subTopicId ?? undefined,
    });
  }

  async function handleEditProblem(input: {
    title: string;
    url?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    subTopicId?: string | null;
    notes?: string;
  }): Promise<boolean> {
    if (dialog.type !== "editProblem") return false;
    if (isEditing) {
      handleDraftProblemEdit(dialog.target.id, input);
      return true;
    }
    updateProblem(topicId, dialog.target.id, input);
    toast.success("Problem updated successfully");
    return true;
  }

  function handleDeleteProblem() {
    if (dialog.type !== "delete" || dialog.entityType !== "problem") return;
    if (isEditing) {
      setDraft((prev) => {
        if (!prev) return prev;
        const removeFromList = (problems: ProblemStoreItem[]) =>
          problems.filter((p) => p.id !== dialog.target.id);
        return {
          ...prev,
          problems: removeFromList(prev.problems),
          subtopics: prev.subtopics.map((st) => ({
            ...st,
            problems: removeFromList(st.problems),
          })),
        };
      });
      setHasChanges(true);
      setDialog({ type: "idle" });
      return;
    }
    removeProblem(topicId, dialog.target.id);
    setDialog({ type: "idle" });
    toast.success("Problem deleted successfully");
  }

  function handleProblemStatusChange(
    problemId: string,
    status: ProblemStoreItem["status"]
  ) {
    updateProblemStatus(topicId, problemId, status);
    if (isEditing && draft) {
      setDraft((prev) => {
        if (!prev) return prev;
        return updateProblemInDraft(prev, problemId, { status });
      });
    }
  }

  function handleProblemReviewCountChange(problemId: string, count: number) {
    updateProblemReviewCount(topicId, problemId, count);
    if (isEditing && draft) {
      setDraft((prev) => {
        if (!prev) return prev;
        return updateProblemInDraft(prev, problemId, { reviewCount: count });
      });
    }
  }

  function handleProblemMoveUp(problemId: string) {
    if (isEditing) {
      moveProblemInDraft(problemId, "up");
      return;
    }
    moveProblem(topicId, problemId, "up");
  }

  function handleProblemMoveDown(problemId: string) {
    if (isEditing) {
      moveProblemInDraft(problemId, "down");
      return;
    }
    moveProblem(topicId, problemId, "down");
  }

  function handleSubTopicMoveUp(subTopicId: string) {
    if (isEditing) {
      moveSubTopicInDraft(subTopicId, "up");
    }
  }

  function handleSubTopicMoveDown(subTopicId: string) {
    if (isEditing) {
      moveSubTopicInDraft(subTopicId, "down");
    }
  }

  function handleEnterEditMode() {
    if (!topic) return;
    setDraft(structuredClone(topic));
    setHasChanges(false);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    if (hasChanges) {
      setShowUnsavedDialog(true);
    } else {
      setIsEditing(false);
      setDraft(null);
    }
  }

  function handleDiscardChanges() {
    setShowUnsavedDialog(false);
    setIsEditing(false);
    setDraft(null);
    setHasChanges(false);
  }

  async function handleSave() {
    if (!topic || !draft) return;

    const changes = computeBatchChanges(topic, draft);
    if (!changes.hasAny) {
      setIsEditing(false);
      setDraft(null);
      setHasChanges(false);
      return;
    }

    setIsSaving(true);
    try {
      const otherOperations: Promise<unknown>[] = [];

      for (const st of changes.subtopicUpdates) {
        otherOperations.push(subTopicService.updateSubTopic(st.id, st.input));
      }
      for (const id of changes.subtopicDeletes) {
        otherOperations.push(subTopicService.deleteSubTopic(id));
      }
      for (const p of changes.problemUpdates) {
        otherOperations.push(problemService.updateProblem(p.id, p.input));
      }
      for (const id of changes.problemDeletes) {
        otherOperations.push(problemService.deleteProblem(id));
      }

      const otherResults = await Promise.allSettled(otherOperations);
      let allOk = otherResults.every(
        (r) => r.status === "fulfilled" && r.value !== null && r.value !== false
      );

      for (const ids of changes.problemReorders) {
        const result = await problemService.reorderProblems(ids);
        if (result === null || result === false) {
          allOk = false;
        }
      }

      for (const ids of changes.subtopicReorders) {
        const result = await subTopicService.reorderSubtopics(topicId, ids);
        if (result === null || result === false) {
          allOk = false;
        }
      }

      const dbTopics = await topicService.getTopics();
      const updatedTopic = dbTopics.find((t: TopicStoreItem) => t.id === topicId);
      if (updatedTopic) {
        replaceTopic(topicId, updatedTopic);
      }

      if (allOk) {
        setIsEditing(false);
        setDraft(null);
        setHasChanges(false);
        toast.success("Changes saved successfully");
      } else {
        toast.error("Some changes failed to save");
      }
    } catch {
      const dbTopics = await topicService.getTopics();
      const updatedTopic = dbTopics.find((t: TopicStoreItem) => t.id === topicId);
      if (updatedTopic) {
        replaceTopic(topicId, updatedTopic);
      }
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }

  function moveProblemInDraft(problemId: string, direction: "up" | "down") {
    setDraft((prev) => {
      if (!prev) return prev;
      const moveInList = (problems: ProblemStoreItem[]) => {
        const idx = problems.findIndex((p) => p.id === problemId);
        if (idx === -1) return problems;
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= problems.length) return problems;
        const copy = [...problems];
        [copy[idx], copy[targetIdx]] = [copy[targetIdx], copy[idx]];
        return copy;
      };
      const directMoved = moveInList(prev.problems);
      if (directMoved !== prev.problems) {
        return { ...prev, problems: directMoved };
      }
      for (let i = 0; i < prev.subtopics.length; i++) {
        const moved = moveInList(prev.subtopics[i].problems);
        if (moved !== prev.subtopics[i].problems) {
          const subtopics = prev.subtopics.map((st, si) =>
            si === i ? { ...st, problems: moved } : st
          );
          return { ...prev, subtopics };
        }
      }
      return prev;
    });
    setHasChanges(true);
  }

  function moveSubTopicInDraft(subTopicId: string, direction: "up" | "down") {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subtopics: moveSubTopicInArray(prev.subtopics, subTopicId, direction),
      };
    });
    setHasChanges(true);
  }

  function handleDraftSubTopicEdit(
    subtopicId: string,
    input: { name: string; description?: string }
  ) {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subtopics: prev.subtopics.map((st) =>
          st.id === subtopicId ? { ...st, ...input } : st
        ),
      };
    });
    setHasChanges(true);
  }

  function handleDraftProblemEdit(
    problemId: string,
    input: {
      title: string;
      url?: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      subTopicId?: string | null;
      notes?: string;
    }
  ) {
    setDraft((prev) => {
      if (!prev) return prev;

      const directIdx = prev.problems.findIndex((p) => p.id === problemId);
      const subTopicIdx = directIdx === -1
        ? prev.subtopics.findIndex((st) => st.problems.some((p) => p.id === problemId))
        : -1;
      if (directIdx === -1 && subTopicIdx === -1) return prev;

      const currentProblem = directIdx !== -1
        ? prev.problems[directIdx]
        : prev.subtopics[subTopicIdx].problems.find((p) => p.id === problemId)!;

      const newSubTopicId = input.subTopicId ?? null;
      const subTopicChanged = currentProblem.subTopicId !== newSubTopicId;

      const updatedProblem: ProblemStoreItem = {
        ...currentProblem,
        title: input.title,
        url: input.url,
        difficulty: input.difficulty,
        subTopicId: newSubTopicId,
        notes: input.notes,
      };

      if (!subTopicChanged) {
        const updateInList = (problems: ProblemStoreItem[]) =>
          problems.map((p) => (p.id === problemId ? updatedProblem : p));
        return {
          ...prev,
          problems: updateInList(prev.problems),
          subtopics: prev.subtopics.map((st) => ({
            ...st,
            problems: updateInList(st.problems),
          })),
        };
      }

      const afterRemove = {
        ...prev,
        problems: prev.problems.filter((p) => p.id !== problemId),
        subtopics: prev.subtopics.map((st) => ({
          ...st,
          problems: st.problems.filter((p) => p.id !== problemId),
        })),
      };

      if (newSubTopicId === null) {
        return { ...afterRemove, problems: [...afterRemove.problems, updatedProblem] };
      }

      return {
        ...afterRemove,
        subtopics: afterRemove.subtopics.map((st) =>
          st.id === newSubTopicId
            ? { ...st, problems: [...st.problems, updatedProblem] }
            : st
        ),
      };
    });
    setHasChanges(true);
  }

  return {
    hydrated,
    topic,
    displayTopic,
    topicViewModel,
    displayDirectProblems,
    subtopicViewModels,
    hasSubtopics,
    hasDirectProblems,
    hasAnyContent,
    isEditing,
    isSaving,
    hasChanges,
    dialog,
    setDialog,
    showUnsavedDialog,
    setShowUnsavedDialog,
    handleCreateSubTopic,
    handleEditSubTopic,
    handleDeleteSubTopic,
    handleCreateProblem,
    handleEditProblem,
    handleDeleteProblem,
    handleProblemStatusChange,
    handleProblemReviewCountChange,
    handleProblemMoveUp,
    handleProblemMoveDown,
    handleSubTopicMoveUp,
    handleSubTopicMoveDown,
    handleEnterEditMode,
    handleCancelEdit,
    handleDiscardChanges,
    handleSave,
  };
}
