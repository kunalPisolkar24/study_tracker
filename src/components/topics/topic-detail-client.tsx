"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowLeft01Icon, Loading02Icon, PencilIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useTopicDetail } from "@/components/topics/use-topic-detail";
import { SubtopicSection } from "@/components/topics/subtopic-section";
import { ProblemRow } from "@/components/topics/problem-row";
import { SubtopicFormDialog } from "@/components/topics/subtopic-form-dialog";
import { ProblemFormDialog } from "@/components/topics/problem-form-dialog";
import { DeleteConfirmationDialog } from "@/components/topics/delete-confirmation-dialog";
import { UnsavedChangesDialog } from "@/components/topics/unsaved-changes-dialog";
import { NotesDialog } from "@/components/topics/notes-dialog";
import { TopicDetailSkeleton } from "@/components/topics/topic-skeleton";

interface TopicsDetailClientProps {
  topicId: string;
}

export function TopicsDetailClient({ topicId }: TopicsDetailClientProps) {
  const {
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
  } = useTopicDetail(topicId);

  if (!hydrated) {
    return <TopicDetailSkeleton />;
  }

  if (!topic || !topicViewModel) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-lg font-medium">Topic not found</p>
        <p className="text-sm text-muted-foreground">
          The topic you are looking for does not exist.
        </p>
        <Button variant="outline" asChild>
          <Link href="/topics">
            <HugeiconsIcon icon={ArrowLeft01Icon} />
            Back to Topics
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight">{topic.name}</h1>
        {topic.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {topic.description}
          </p>
        )}
      </div>

      <div className="mb-6 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall Progress</span>
          <span>
            {topicViewModel.solvedProblems}/{topicViewModel.totalProblems}
          </span>
        </div>
        <Progress value={topicViewModel.progressPercent} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isEditing}
          onClick={() => setDialog({ type: "createSubTopic" })}
        >
          <HugeiconsIcon icon={Add01Icon} />
          Add Sub-topic
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isEditing}
          onClick={() => setDialog({ type: "createProblem" })}
        >
          <HugeiconsIcon icon={Add01Icon} />
          Add Problem
        </Button>
        <div className="ml-auto flex gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="default"
                disabled={isSaving || !hasChanges}
                onClick={handleSave}
              >
                {isSaving && <HugeiconsIcon icon={Loading02Icon} className="size-3 animate-spin" />}
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isSaving}
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEnterEditMode}
            >
              <HugeiconsIcon icon={PencilIcon} className="size-3" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="flex-1 space-y-8">
        {hasSubtopics &&
          displayTopic!.subtopics.map((subtopic, idx) => {
            const vm = subtopicViewModels.find((v) => v.id === subtopic.id);
            if (!vm) return null;
            return (
              <SubtopicSection
                key={subtopic.id}
                subtopic={subtopic}
                viewModel={vm}
                isEditing={isEditing}
                isFirst={idx === 0}
                isLast={idx === displayTopic!.subtopics.length - 1}
                onMoveUp={handleSubTopicMoveUp}
                onMoveDown={handleSubTopicMoveDown}
                onEdit={(st) => setDialog({ type: "editSubTopic", target: st })}
                onDelete={(st) =>
                  setDialog({
                    type: "delete",
                    entityType: "subtopic",
                    target: { id: st.id, name: st.name },
                  })
                }
                onProblemStatusChange={handleProblemStatusChange}
                onProblemReviewCountChange={handleProblemReviewCountChange}
                onProblemMoveUp={handleProblemMoveUp}
                onProblemMoveDown={handleProblemMoveDown}
                onProblemNotesClick={(p) =>
                  setDialog({ type: "notes", target: p })
                }
                onProblemEdit={(p) =>
                  setDialog({ type: "editProblem", target: p })
                }
                onProblemDelete={(p) =>
                  setDialog({
                    type: "delete",
                    entityType: "problem",
                    target: { id: p.id, name: p.title },
                  })
                }
              />
            );
          })}

        {hasDirectProblems && (
          <div className="overflow-x-auto">
            <div className="flex w-max min-w-full flex-col gap-3">
            <h2 className="text-base font-medium">Direct Problems</h2>
            {displayDirectProblems.map((problem, idx) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                isEditing={isEditing}
                isFirst={idx === 0}
                isLast={idx === displayDirectProblems.length - 1}
                onStatusChange={handleProblemStatusChange}
                onReviewCountChange={handleProblemReviewCountChange}
                onMoveUp={handleProblemMoveUp}
                onMoveDown={handleProblemMoveDown}
                onNotesClick={(p) =>
                  setDialog({ type: "notes", target: p })
                }
                onEdit={(p) =>
                  setDialog({ type: "editProblem", target: p })
                }
                onDelete={(p) =>
                  setDialog({
                    type: "delete",
                    entityType: "problem",
                    target: { id: p.id, name: p.title },
                  })
                }
              />
            ))}
            </div>
          </div>
        )}

        {!hasAnyContent && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-lg font-medium">No problems yet</p>
            <p className="text-sm text-muted-foreground">
              Add a sub-topic or a problem to get started.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isEditing}
                onClick={() => setDialog({ type: "createSubTopic" })}
              >
                <HugeiconsIcon icon={Add01Icon} />
                Add Sub-topic
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isEditing}
                onClick={() => setDialog({ type: "createProblem" })}
              >
                <HugeiconsIcon icon={Add01Icon} />
                Add Problem
              </Button>
            </div>
          </div>
        )}
      </div>

      <SubtopicFormDialog
        key={
          dialog.type === "editSubTopic" ? dialog.target.id : "create-subtopic"
        }
        mode={dialog.type === "editSubTopic" ? "edit" : "create"}
        open={dialog.type === "createSubTopic" || dialog.type === "editSubTopic"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "idle" });
        }}
        onSubmit={
          dialog.type === "editSubTopic"
            ? handleEditSubTopic
            : handleCreateSubTopic
        }
        initialValues={
          dialog.type === "editSubTopic"
            ? {
                name: dialog.target.name,
                description: dialog.target.description,
              }
            : undefined
        }
      />

      <ProblemFormDialog
        key={
          dialog.type === "editProblem" ? dialog.target.id : "create-problem"
        }
        mode={dialog.type === "editProblem" ? "edit" : "create"}
        open={dialog.type === "createProblem" || dialog.type === "editProblem"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "idle" });
        }}
        onSubmit={
          dialog.type === "editProblem"
            ? handleEditProblem
            : handleCreateProblem
        }
        subtopics={displayTopic?.subtopics ?? []}
        initialValues={
          dialog.type === "editProblem"
            ? {
                title: dialog.target.title,
                url: dialog.target.url,
                difficulty: dialog.target.difficulty,
                subTopicId: dialog.target.subTopicId,
                notes: dialog.target.notes,
              }
            : dialog.type === "createProblem"
              ? {
                  title: "",
                  difficulty: "EASY" as const,
                }
              : undefined
        }
      />

      <DeleteConfirmationDialog
        open={dialog.type === "delete"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "idle" });
        }}
        title={
          dialog.type === "delete" && dialog.entityType === "subtopic"
            ? "Delete Sub-topic"
            : "Delete Problem"
        }
        description={
          dialog.type === "delete"
            ? dialog.entityType === "subtopic"
              ? `Are you sure you want to delete "${dialog.target.name}"? This will also remove all problems within this sub-topic.`
              : `Are you sure you want to delete "${dialog.target.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={
          dialog.type === "delete"
            ? dialog.entityType === "subtopic"
              ? handleDeleteSubTopic
              : handleDeleteProblem
            : () => {}
        }
      />

      <NotesDialog
        key={dialog.type === "notes" ? dialog.target.id : "notes"}
        open={dialog.type === "notes"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "idle" });
        }}
        problemTitle={dialog.type === "notes" ? dialog.target.title : ""}
        notes={dialog.type === "notes" ? (dialog.target.notes ?? "") : ""}
      />

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={(open) => {
          if (!open) setShowUnsavedDialog(false);
        }}
        onDiscard={handleDiscardChanges}
      />
    </div>
  );
}
