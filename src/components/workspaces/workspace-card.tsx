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
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function WorkspaceCard({
  workspace,
  groupName,
  onOpen,
  onEdit,
  onDelete,
}: WorkspaceCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{workspace.name}</CardTitle>
          <div className="flex shrink-0 gap-0.5">
              <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(workspace.id)}
              aria-label={`Edit ${workspace.name}`}
            >
              <HugeiconsIcon icon={Edit04Icon} className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(workspace.id)}
              aria-label={`Delete ${workspace.name}`}
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
            </Button>
          </div>
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
