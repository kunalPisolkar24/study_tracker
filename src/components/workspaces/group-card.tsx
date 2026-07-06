"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Edit04Icon } from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { WorkspaceGroupStoreItem } from "@/types/workspace";

interface GroupCardProps {
  group: WorkspaceGroupStoreItem;
  workspaceCount: number;
  isEditing?: boolean;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function GroupCard({
  group,
  workspaceCount,
  isEditing = false,
  onOpen,
  onEdit,
  onDelete,
}: GroupCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="break-words text-base">{group.name}</CardTitle>
          {isEditing && (
          <div className="flex shrink-0 gap-1">
            <span
              className="flex items-center justify-center size-8 md:size-7 rounded cursor-pointer bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
              onClick={() => onEdit(group.id)}
              role="button"
              tabIndex={0}
              aria-label={`Edit ${group.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onEdit(group.id);
                }
              }}
            >
              <HugeiconsIcon icon={Edit04Icon} className="size-4" />
            </span>
            <span
              className="flex items-center justify-center size-8 md:size-7 rounded cursor-pointer bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400"
              onClick={() => onDelete(group.id)}
              role="button"
              tabIndex={0}
              aria-label={`Delete ${group.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDelete(group.id);
                }
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
            </span>
          </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">
          {workspaceCount} {workspaceCount === 1 ? "workspace" : "workspaces"}
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="sm" onClick={() => onOpen(group.id)}>
          Open
        </Button>
      </CardFooter>
    </Card>
  );
}
