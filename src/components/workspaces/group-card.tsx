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
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function GroupCard({
  group,
  workspaceCount,
  onOpen,
  onEdit,
  onDelete,
}: GroupCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{group.name}</CardTitle>
          <div className="flex shrink-0 gap-0.5">
              <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(group.id)}
              aria-label={`Edit ${group.name}`}
            >
              <HugeiconsIcon icon={Edit04Icon} className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(group.id)}
              aria-label={`Delete ${group.name}`}
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
            </Button>
          </div>
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
