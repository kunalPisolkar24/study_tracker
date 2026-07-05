"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowRight01Icon, ArrowRight02Icon, ArrowUp01Icon, Delete02Icon, Edit04Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { deriveStatusLabel, deriveStatusClass, deriveConfidenceClass, shouldDrillIn } from "@/lib/node-utils";
import type { NodeStoreItem, TreeNode } from "@/types/node";

interface NodeRowProps {
  node: NodeStoreItem;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  isEditing: boolean;
  isFirst: boolean;
  isLast: boolean;
  progress?: { total: number; done: number; percent: number };
  weakCount?: number;
  onToggle: () => void;
  onDrillIn: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function NodeRow({
  node,
  depth,
  isExpanded,
  hasChildren,
  isEditing,
  isFirst,
  isLast,
  progress,
  weakCount,
  onToggle,
  onDrillIn,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: NodeRowProps) {
  const drillIn = shouldDrillIn(depth) && hasChildren;
  const isLeafNode = !hasChildren;

  return (
    <div
      className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-accent/30"
      style={{ paddingLeft: `${12 + depth * 20}px` }}
    >
      {isEditing && (
        <div className="flex shrink-0 flex-col gap-0.5">
          <Button variant="ghost" size="icon-xs" disabled={isFirst} onClick={onMoveUp} aria-label="Move up">
            <HugeiconsIcon icon={ArrowUp01Icon} className="size-3" />
          </Button>
          <Button variant="ghost" size="icon-xs" disabled={isLast} onClick={onMoveDown} aria-label="Move down">
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
          </Button>
        </div>
      )}

      <button
        type="button"
        className="flex shrink-0 items-center justify-center size-5"
        onClick={drillIn ? onDrillIn : onToggle}
        aria-label={drillIn ? "Drill in" : isExpanded ? "Collapse" : "Expand"}
      >
        {hasChildren ? (
          <HugeiconsIcon
            icon={drillIn ? ArrowRight02Icon : isExpanded ? ArrowDown01Icon : ArrowRight01Icon}
            className={cn("size-4 text-muted-foreground", drillIn && "text-primary")}
          />
        ) : (
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
        )}
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate font-medium">{node.title}</span>

        {isLeafNode && (node.status || node.confidence) && (
          <span className="hidden sm:flex items-center gap-1.5 ml-auto">
            {node.status && (
              <Badge variant="outline" className={cn("text-xs", deriveStatusClass(node.status))}>
                {deriveStatusLabel(node.status)}
              </Badge>
            )}
            {node.confidence && (
              <Badge variant="outline" className={cn("text-xs", deriveConfidenceClass(node.confidence))}>
                {node.confidence.charAt(0).toUpperCase() + node.confidence.slice(1)}
              </Badge>
            )}
          </span>
        )}
      </div>

      {!isLeafNode && progress && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="whitespace-nowrap">{progress.percent}%</span>
          <div className="hidden w-16 sm:block">
            <Progress value={progress.percent} className="h-1.5" />
          </div>
          {weakCount !== undefined && weakCount > 0 && (
            <span className="whitespace-nowrap text-red-500">{weakCount} weak</span>
          )}
        </div>
      )}

      {isEditing && (
        <div className="flex shrink-0 gap-0.5">
          <Button variant="ghost" size="icon-xs" onClick={onEdit} aria-label="Edit">
            <HugeiconsIcon icon={Edit04Icon} className="size-3" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onDelete} aria-label="Delete">
            <HugeiconsIcon icon={Delete02Icon} className="size-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
