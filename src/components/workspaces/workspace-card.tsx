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
import { Badge } from "@/components/ui/badge";
import type { WorkspaceStoreItem } from "@/types/workspace";

interface WorkspaceCardProps {
  workspace: WorkspaceStoreItem;
  groupName?: string;
  isEditing?: boolean;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function WorkspaceCard({
  workspace,
  groupName,
  isEditing = false,
  onOpen,
  onEdit,
  onDelete,
}: WorkspaceCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="break-words text-base">{workspace.name}</CardTitle>
          {isEditing && (
          <div className="flex shrink-0 gap-1">
            <span
              className="flex items-center justify-center size-8 md:size-7 rounded cursor-pointer bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
              onClick={() => onEdit(workspace.id)}
              role="button"
              tabIndex={0}
              aria-label={`Edit ${workspace.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onEdit(workspace.id);
                }
              }}
            >
              <HugeiconsIcon icon={Edit04Icon} className="size-4" />
            </span>
            <span
              className="flex items-center justify-center size-8 md:size-7 rounded cursor-pointer bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400"
              onClick={() => onDelete(workspace.id)}
              role="button"
              tabIndex={0}
              aria-label={`Delete ${workspace.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDelete(workspace.id);
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
        {groupName && (
          <Badge variant="secondary" className="text-xs">
            {groupName}
          </Badge>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="sm" onClick={() => onOpen(workspace.id)}>
          Open
        </Button>
      </CardFooter>
    </Card>
  );
}
