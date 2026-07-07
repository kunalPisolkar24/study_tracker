"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/shared/utils";

interface TreeDragHandleProps {
  getDragHandleProps: () => Record<string, unknown>;
}

export function TreeDragHandle({ getDragHandleProps }: TreeDragHandleProps) {
  return (
    <span
      {...getDragHandleProps()}
      className={cn(
        "flex shrink-0 cursor-grab items-center justify-center rounded me-1",
        "min-w-9 min-h-9 md:min-w-0 md:min-h-0",
        "touch-none",
        "text-muted-foreground hover:text-foreground active:cursor-grabbing",
      )}
      aria-label="Drag to reorder"
    >
      <HugeiconsIcon icon={DragDropVerticalIcon} className="size-3.5" />
    </span>
  );
}
