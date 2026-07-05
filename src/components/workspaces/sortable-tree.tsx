"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Delete02Icon,
  Edit04Icon,
  DragDropVerticalIcon,
} from "@hugeicons/core-free-icons";
import {
  Tree,
  TreeItem,
  TreeItemLabel,
  TreeDragLine,
} from "@/components/reui/tree";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  computeProgress,
  computeWeakCount,
  deriveStatusLabel,
  deriveStatusClass,
  deriveConfidenceClass,
} from "@/lib/node-utils";
import { useWorkspaceTree, VIRTUAL_ROOT } from "@/lib/tree-data";
import type { NodeStoreItem } from "@/types/node";
import type { ItemInstance, TreeInstance } from "@headless-tree/core";
interface HeadlessItem {
  name: string;
  children?: string[];
}

interface SortableTreeProps {
  workspaceNodes: NodeStoreItem[];
  isEditing: boolean;
  onDrillIn: (nodeId: string) => void;
  onSelect: (node: NodeStoreItem) => void;
  onEdit: (node: NodeStoreItem) => void;
  onDelete: (node: NodeStoreItem) => void;
  onReorder: (parentId: string | null, orderedChildIds: string[]) => void;
}

export function SortableTree({
  workspaceNodes,
  isEditing,
  onDrillIn,
  onSelect,
  onEdit,
  onDelete,
  onReorder,
}: SortableTreeProps) {
  const tree: TreeInstance<HeadlessItem> = useWorkspaceTree(workspaceNodes, onReorder, onDrillIn);

  if (workspaceNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-lg font-medium">No topics yet</p>
        <p className="text-sm text-muted-foreground">
          Add a topic to start building your tree.
        </p>
      </div>
    );
  }

  return (
    <Tree
      tree={tree}
      indent={16}
      className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
    >
      <TreeDragLine />
      {tree.getItems().map((item: ItemInstance<HeadlessItem>) => {
        if (item.getId() === VIRTUAL_ROOT) return null;
        return (
          <TreeItem
            key={item.getId()}
            item={item}
          >
            <TreeItemContent
              item={item}
              workspaceNodes={workspaceNodes}
              isEditing={isEditing}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </TreeItem>
        );
      })}
    </Tree>
  );
}

interface TreeItemContentProps {
  item: ItemInstance<HeadlessItem>;
  workspaceNodes: NodeStoreItem[];
  isEditing: boolean;
  onSelect: (node: NodeStoreItem) => void;
  onEdit: (node: NodeStoreItem) => void;
  onDelete: (node: NodeStoreItem) => void;
}

function TreeItemContent({
  item,
  workspaceNodes,
  isEditing,
  onSelect,
  onEdit,
  onDelete,
}: TreeItemContentProps) {
  const node = workspaceNodes.find((n) => n.id === item.getId());
  const hasChildren = (item.getItemData()?.children?.length ?? 0) > 0;
  const depth = item.getItemMeta().level - 1;
  const isDeepNode = depth > 2 && hasChildren;
  const isLeafNode = !hasChildren;
  const progress = hasChildren
    ? computeProgress(workspaceNodes, item.getId())
    : undefined;
  const weakCount = hasChildren
    ? computeWeakCount(workspaceNodes, item.getId())
    : undefined;
  const nodeTitle: string = item.getItemData()?.name ?? "";

  return (
    <TreeItemLabel
      className={cn(
        "ps-0! flex w-full",
        "hover:bg-accent/30",
        isLeafNode && node && "cursor-pointer",
      )}
      onClick={() => {
        if (isLeafNode && node) onSelect(node);
      }}
    >
      {isEditing && (
        <span
          {...item.getDragHandleProps()}
          className={cn(
            "flex shrink-0 cursor-grab items-center justify-center rounded p-1 me-1",
            "text-muted-foreground hover:text-foreground active:cursor-grabbing",
          )}
          aria-label="Drag to reorder"
        >
          <HugeiconsIcon icon={DragDropVerticalIcon} className="size-3.5" />
        </span>
      )}

      {isDeepNode ? (
        <span className="flex shrink-0 items-center justify-center size-5 me-1">
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            className="size-4 text-primary"
          />
        </span>
      ) : isLeafNode ? (
        <span className="flex shrink-0 items-center justify-center size-5 me-1">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
        </span>
      ) : null}

      <span className="truncate font-medium min-w-0">{nodeTitle}</span>

      {isLeafNode && node && (node.status || node.confidence) && (
        <span className="hidden sm:flex items-center gap-1.5 ms-auto me-2">
          {node.status && (
            <Badge
              variant="outline"
              className={cn("text-xs whitespace-nowrap", deriveStatusClass(node.status))}
            >
              {deriveStatusLabel(node.status)}
            </Badge>
          )}
          {node.confidence && (
            <Badge
              variant="outline"
              className={cn("text-xs whitespace-nowrap", deriveConfidenceClass(node.confidence))}
            >
              {node.confidence.charAt(0).toUpperCase() +
                node.confidence.slice(1)}
            </Badge>
          )}
        </span>
      )}

      {!isLeafNode && progress && (
        <span className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap ms-auto me-2">
          <span>{progress.percent}%</span>
          <span className="hidden w-16 sm:block">
            <Progress value={progress.percent} className="h-1.5" />
          </span>
          {weakCount !== undefined && weakCount > 0 && (
            <span className="text-red-500">{weakCount} weak</span>
          )}
        </span>
      )}

      {isEditing && node && (
        <span className="flex shrink-0 gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            aria-label="Edit"
          >
            <HugeiconsIcon icon={Edit04Icon} className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node);
            }}
            aria-label="Delete"
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-3" />
          </Button>
        </span>
      )}
    </TreeItemLabel>
  );
}
