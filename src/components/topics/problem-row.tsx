"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, ExternalLink, Pencil, Trash2, StickyNote } from "lucide-react";
import { STATUS_CYCLE, STATUS_STYLES, DIFFICULTY_STYLES } from "@/lib/constants";
import type { ProblemStoreItem } from "@/types/topics";
import { cn } from "@/lib/utils";

function nextStatus(current: ProblemStoreItem["status"]): ProblemStoreItem["status"] {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

interface ProblemRowProps {
  problem: ProblemStoreItem;
  isEditing: boolean;
  isFirst: boolean;
  isLast: boolean;
  onStatusChange: (problemId: string, status: ProblemStoreItem["status"]) => void;
  onReviewCountChange: (problemId: string, count: number) => void;
  onMoveUp: (problemId: string) => void;
  onMoveDown: (problemId: string) => void;
  onNotesClick: (problem: ProblemStoreItem) => void;
  onEdit: (problem: ProblemStoreItem) => void;
  onDelete: (problem: ProblemStoreItem) => void;
}

export function ProblemRow({
  problem,
  isEditing,
  isFirst,
  isLast,
  onStatusChange,
  onReviewCountChange,
  onMoveUp,
  onMoveDown,
  onNotesClick,
  onEdit,
  onDelete,
}: ProblemRowProps) {
  const statusStyle = STATUS_STYLES[problem.status];
  const difficultyStyle = DIFFICULTY_STYLES[problem.difficulty];
  const isInReview = problem.status === "MARKED_FOR_REVIEW";

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
      {isEditing && (
        <div className="flex shrink-0 flex-col gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            disabled={isFirst}
            onClick={() => onMoveUp(problem.id)}
            aria-label="Move up"
          >
            <ArrowUp className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            disabled={isLast}
            onClick={() => onMoveDown(problem.id)}
            aria-label="Move down"
          >
            <ArrowDown className="size-3" />
          </Button>
        </div>
      )}

      <div className="flex flex-1 items-center gap-2">
        {problem.url ? (
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap font-medium underline-offset-2 hover:underline"
          >
            {problem.title}
            <ExternalLink className="ml-1 inline size-3 text-muted-foreground" />
          </a>
        ) : (
          <span className="whitespace-nowrap font-medium">{problem.title}</span>
        )}
      </div>

      <Badge
        variant="outline"
        className={cn("cursor-pointer select-none", statusStyle.className)}
        onClick={() => onStatusChange(problem.id, nextStatus(problem.status))}
        title="Click to cycle status"
      >
        {statusStyle.label}
      </Badge>

      <Badge variant="outline" className={cn(difficultyStyle.className)}>
        {difficultyStyle.label}
      </Badge>

      <Button
        variant="ghost"
        size="icon-xs"
        disabled={!problem.notes}
        onClick={() => onNotesClick(problem)}
        aria-label="View notes"
        className={cn(!problem.notes && "opacity-30")}
      >
        <StickyNote className="size-3" />
      </Button>

      {isInReview ? (
        <div className="flex w-16 items-center gap-1">
          <Input
            type="number"
            min={0}
            value={problem.reviewCount}
            onChange={(e) =>
              onReviewCountChange(problem.id, Math.max(0, Number(e.target.value)))
            }
            className="h-7 w-12 px-1 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      ) : (
        <span className="flex w-16 items-center justify-center text-xs text-muted-foreground">
          —
        </span>
      )}

      {isEditing && (
        <div className="flex shrink-0 gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(problem)}
            aria-label="Edit problem"
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete(problem)}
            aria-label="Delete problem"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
