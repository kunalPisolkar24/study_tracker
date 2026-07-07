"use client";

import { useState, useCallback } from "react";
import {
  Tree,
  TreeItem,
  TreeItemLabel,
  TreeDragLine,
} from "@/components/reui/tree";
import { useWorkspaceTree, VIRTUAL_ROOT } from "@/lib/workspace/tree/tree-data";
import { useTouchDrag } from "@/hooks/use-touch-drag";
import { MAX_INLINE_DEPTH } from "@/lib/workspace/node-utils";
import { cn } from "@/lib/shared/utils";
import { TreeDragHandle } from "@/components/tree/tree-drag-handle";
import { TreeStatusBadge } from "@/components/tree/tree-status-badge";
import { TreeConfidenceBadge } from "@/components/tree/tree-confidence-badge";
import { TreeProgressBar } from "@/components/tree/tree-progress-bar";
import { TreeActionButtons } from "@/components/tree/tree-action-buttons";
import type { NodeStoreItem } from "@/types/node";
import type { ItemInstance, TreeInstance } from "@headless-tree/core";
import type { HeadlessItemData } from "@/lib/workspace/tree/tree-adapter";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";

const INDENT = 16;

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
  const tree = useWorkspaceTree(workspaceNodes, onReorder, onDrillIn);
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

  return (
    <div ref={treeContainerRefCallback}>
      <Tree
        tree={tree}
        indent={INDENT}
        className="relative before:absolute before:inset-0 before:-ms-2 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
      >
        <TreeDragLine />
        {treeItems.map((item) => {
          const node = workspaceNodes.find((n) => n.id === item.getId());
          return (
            <TreeItem key={item.getId()} item={item}>
              <TreeNodeContent
                item={item}
                node={node}
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

interface TreeNodeContentProps {
  item: ItemInstance<HeadlessItemData>;
  node: NodeStoreItem | undefined;
  workspaceNodes: NodeStoreItem[];
  isEditing: boolean;
  onDrillIn: (nodeId: string) => void;
  onSelect: (node: NodeStoreItem) => void;
  onEdit: (node: NodeStoreItem) => void;
  onDelete: (node: NodeStoreItem) => void;
  onAddChild: (node: NodeStoreItem) => void;
}

function TreeNodeContent({
  item,
  node,
  workspaceNodes,
  isEditing,
  onDrillIn,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
}: TreeNodeContentProps) {
  const hasChildren = (item.getItemData()?.children?.length ?? 0) > 0;
  const depth = item.getItemMeta().level - 1;
  const isDeepNode = depth > MAX_INLINE_DEPTH && hasChildren;
  const isLeafNode = !hasChildren;
  const progress = hasChildren && node
    ? computeProgress(workspaceNodes, item.getId())
    : undefined;
  const nodeTitle: string = item.getItemData()?.name ?? "";

  return (
    <TreeItemLabel
      className={cn(
        "ps-0! flex w-full",
        "hover:bg-muted",
        isLeafNode && node && "cursor-pointer",
        "before:bg-background relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10",
      )}
      onClick={() => {
        if (isLeafNode && node) onSelect(node);
        else if (isDeepNode && node) onDrillIn(item.getId());
      }}
    >
      {isEditing && (
        <TreeDragHandle getDragHandleProps={item.getDragHandleProps} />
      )}

      {isDeepNode ? (
        <span className="flex shrink-0 items-center justify-center size-5 me-1">
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            className="size-4 text-primary"
          />
        </span>
      ) : null}

      <span className={cn("truncate font-medium min-w-0 text-base", isLeafNode && "ms-1.5")}>
        {nodeTitle}
      </span>

      {isLeafNode && node && (node.status || node.confidence) && (
        <span className="flex items-center gap-1.5 shrink-0 ms-1.5">
          {node.status && <TreeStatusBadge status={node.status} />}
          {node.confidence && <TreeConfidenceBadge confidence={node.confidence} />}
        </span>
      )}

      {!isLeafNode && progress && (
        <TreeProgressBar percent={progress.percent} />
      )}

      {isEditing && node && (
        <TreeActionButtons
          onAddChild={() => onAddChild(node)}
          onEdit={() => onEdit(node)}
          onDelete={() => onDelete(node)}
        />
      )}
    </TreeItemLabel>
  );
}

function computeProgress(
  allNodes: NodeStoreItem[],
  nodeId: string,
): { total: number; done: number; percent: number } | undefined {
  const leaves = getLeafDescendants(allNodes, nodeId);
  const total = leaves.length;
  if (total === 0) return undefined;
  const done = leaves.filter((l) => l.status === "done").length;
  return { total, done, percent: Math.round((done / total) * 100) };
}

function getLeafDescendants(allNodes: NodeStoreItem[], nodeId: string): NodeStoreItem[] {
  const directChildren = allNodes.filter((n) => n.parentId === nodeId);
  if (directChildren.length === 0) {
    const self = allNodes.find((n) => n.id === nodeId);
    return self ? [self] : [];
  }
  return directChildren.flatMap((child) => getLeafDescendants(allNodes, child.id));
}
