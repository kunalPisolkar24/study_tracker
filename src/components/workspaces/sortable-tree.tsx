"use client";

import { useState, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Archive04Icon,
  ArrowRight02Icon,
  Tick02Icon,
  Delete02Icon,
  DragDropVerticalIcon,
  Edit04Icon,
  FullSignalIcon,
  HourglassIcon,
  LowSignalIcon,
  MediumSignalIcon,
} from "@hugeicons/core-free-icons";
import {
  Tree,
  TreeItem,
  TreeItemLabel,
  TreeDragLine,
} from "@/components/reui/tree";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  computeProgress,
  deriveConfidenceIconClass,
  deriveStatusIconClass,
  deriveStatusLabel,
  MAX_INLINE_DEPTH,
} from "@/lib/node-utils";
import { useWorkspaceTree, VIRTUAL_ROOT } from "@/lib/tree-data";
import { useTouchDrag } from "@/hooks/use-touch-drag";
import type { NodeConfidence, NodeStatus, NodeStoreItem } from "@/types/node";
import type { ItemInstance, TreeInstance } from "@headless-tree/core";
const INDENT = 16;
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
  onAddChild: (node: NodeStoreItem) => void;
  onReorder: (parentId: string | null, orderedChildIds: string[]) => void;
}

export function SortableTree({
  workspaceNodes,
  isEditing,
  onDrillIn,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  onReorder,
}: SortableTreeProps) {
  const tree: TreeInstance<HeadlessItem> = useWorkspaceTree(workspaceNodes, onReorder, onDrillIn);
  const [treeContainerEl, setTreeContainerEl] = useState<HTMLElement | null>(null);
  const treeContainerRefCallback = useCallback((el: HTMLDivElement | null) => {
    setTreeContainerEl(el);
  }, []);
  useTouchDrag({ tree, onReorder, enabled: isEditing, containerEl: treeContainerEl });

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

  const treeItems = tree.getItems().filter((item) => item.getId() !== VIRTUAL_ROOT);
  const itemMetaMap = new Map<string, { isLastChild: boolean; ancestorIsLastChild: boolean[] }>();
  for (let i = 0; i < treeItems.length; i++) {
    const item = treeItems[i];
    const itemLevel = item.getItemMeta().level;
    const nextItem = treeItems[i + 1];
    const isLastChild = !nextItem || nextItem.getItemMeta().level < itemLevel;
    itemMetaMap.set(item.getId(), { isLastChild, ancestorIsLastChild: [] });
  }
  const stack: { level: number; isLastChild: boolean }[] = [];
  for (const item of treeItems) {
    const itemLevel = item.getItemMeta().level;
    while (stack.length > 0 && stack[stack.length - 1].level >= itemLevel) {
      stack.pop();
    }
    const meta = itemMetaMap.get(item.getId())!;
    meta.ancestorIsLastChild = stack.map((s) => s.isLastChild);
    stack.push({ level: itemLevel, isLastChild: meta.isLastChild });
  }

  return (
    <div ref={treeContainerRefCallback}>
      <Tree
        tree={tree}
        indent={INDENT}
        className="relative"
      >
        <TreeDragLine />
        {treeItems.map((item: ItemInstance<HeadlessItem>) => {
          const meta = itemMetaMap.get(item.getId())!;
          return (
            <TreeItem
              key={item.getId()}
              item={item}
              isLastChild={meta.isLastChild}
              ancestorIsLastChild={meta.ancestorIsLastChild}
            >
              <TreeItemContent
                item={item}
                workspaceNodes={workspaceNodes}
                isEditing={isEditing}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onDrillIn={onDrillIn}
              />
            </TreeItem>
          );
        })}
      </Tree>
    </div>
  );
}

function getStatusIcon(status: NodeStatus) {
  switch (status) {
    case "done":
        return Tick02Icon;
    case "in_progress":
      return HourglassIcon;
    case "not_started":
      return Archive04Icon;
  }
}

function getConfidenceIcon(confidence: NodeConfidence) {
  switch (confidence) {
    case "strong":
      return FullSignalIcon;
    case "ok":
      return MediumSignalIcon;
    case "weak":
      return LowSignalIcon;
  }
}

interface TreeItemContentProps {
  item: ItemInstance<HeadlessItem>;
  workspaceNodes: NodeStoreItem[];
  isEditing: boolean;
  onDrillIn: (nodeId: string) => void;
  onSelect: (node: NodeStoreItem) => void;
  onEdit: (node: NodeStoreItem) => void;
  onDelete: (node: NodeStoreItem) => void;
  onAddChild: (node: NodeStoreItem) => void;
}

function TreeItemContent({
  item,
  workspaceNodes,
  isEditing,
  onDrillIn,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
}: TreeItemContentProps) {
  const node = workspaceNodes.find((n) => n.id === item.getId());
  const hasChildren = (item.getItemData()?.children?.length ?? 0) > 0;
  const depth = item.getItemMeta().level - 1;
  const isDeepNode = depth > MAX_INLINE_DEPTH && hasChildren;
  const isLeafNode = !hasChildren;
  const progress = hasChildren
    ? computeProgress(workspaceNodes, item.getId())
    : undefined;
  const nodeTitle: string = item.getItemData()?.name ?? "";

  return (
    <TreeItemLabel
      className={cn(
        "ps-0! flex w-full",
        "hover:bg-muted",
        isLeafNode && node && "cursor-pointer",
      )}
      onClick={() => {
        if (isLeafNode && node) onSelect(node);
        else if (isDeepNode && node) onDrillIn(item.getId());
      }}
    >
      {isEditing && (
        <span
          {...item.getDragHandleProps()}
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
      )}

      {isDeepNode ? (
        <span className="flex shrink-0 items-center justify-center size-5 me-1">
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            className="size-4 text-primary"
          />
        </span>
      ) : null}

      <span className={cn("truncate font-medium min-w-0", isLeafNode && "ms-1.5")}>{nodeTitle}</span>

      {isLeafNode && node && (node.status || node.confidence) && (
        <span className="flex items-center gap-1 shrink-0 ms-1.5">
          {node.status && (
            <span
              className={cn(
                "group inline-flex items-center h-5 rounded transition-all duration-200 gap-1 overflow-hidden cursor-default",
                "max-w-[20px] hover:max-w-[160px] hover:pr-1.5",
                deriveStatusIconClass(node.status),
              )}
              aria-label={deriveStatusLabel(node.status)}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <HugeiconsIcon icon={getStatusIcon(node.status)} className="size-3" {...(node.status === "in_progress" ? { strokeWidth: 2 } : {})} />
              </span>
              <span className="text-xs whitespace-nowrap font-medium">{deriveStatusLabel(node.status)}</span>
            </span>
          )}
          {node.confidence && (
            <span
              className={cn(
                "group inline-flex items-center h-5 rounded transition-all duration-200 gap-1 overflow-hidden cursor-default",
                "max-w-[20px] hover:max-w-[160px] hover:pr-1.5",
                deriveConfidenceIconClass(node.confidence),
              )}
              aria-label={node.confidence.charAt(0).toUpperCase() + node.confidence.slice(1)}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <HugeiconsIcon icon={getConfidenceIcon(node.confidence)} className="size-3" />
              </span>
              <span className="text-xs whitespace-nowrap font-medium">{node.confidence.charAt(0).toUpperCase() + node.confidence.slice(1)}</span>
            </span>
          )}
        </span>
      )}

      {!isLeafNode && progress && (
        <span className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap ms-auto me-2">
          <span>{progress.percent}%</span>
          <span className="hidden w-16 sm:block">
            <Progress value={progress.percent} className="h-1.5" />
          </span>
        </span>
      )}

      {isEditing && node && (
        <span className="flex shrink-0 gap-0.5">
          <span
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-xs" }),
              "min-w-8 min-h-8 md:min-w-0 md:min-h-0",
              "cursor-pointer",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onAddChild(node);
              }
            }}
            aria-label="Add Child"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-3" />
          </span>
          <span
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-xs" }),
              "min-w-8 min-h-8 md:min-w-0 md:min-h-0",
              "cursor-pointer",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onEdit(node);
              }
            }}
            aria-label="Edit"
          >
            <HugeiconsIcon icon={Edit04Icon} className="size-3" />
          </span>
          <span
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-xs" }),
              "min-w-8 min-h-8 md:min-w-0 md:min-h-0",
              "cursor-pointer",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onDelete(node);
              }
            }}
            aria-label="Delete"
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-3" />
          </span>
        </span>
      )}
    </TreeItemLabel>
  );
}
