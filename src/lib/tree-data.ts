"use client";

import { useRef, useEffect, useMemo } from "react";
import { useTree } from "@headless-tree/react";
import {
  syncDataLoaderFeature,
  hotkeysCoreFeature,
  dragAndDropFeature,
  createOnDropHandler,
  isOrderedDragTarget,
  type ItemInstance,
} from "@headless-tree/core";
import type { NodeStoreItem } from "@/types/node";

export const VIRTUAL_ROOT = "__virtual-root__";
const MAX_INLINE_DEPTH = 2;
const INDENT = 16;

interface HeadlessItem {
  name: string;
  children?: string[];
}

function buildItems(nodes: NodeStoreItem[]): Record<string, HeadlessItem> {
  const sorted = [...nodes].sort((a, b) => a.orderIndex - b.orderIndex);
  const result: Record<string, HeadlessItem> = {};

  const nodeIds = new Set(nodes.map((n) => n.id));

  const topLevelIds = sorted
    .filter((n) => n.parentId === null || !nodeIds.has(n.parentId))
    .map((n) => n.id);
  result[VIRTUAL_ROOT] = { name: "", children: topLevelIds };

  for (const node of sorted) {
    result[node.id] = { name: node.title, children: [] };
  }

  for (const node of sorted) {
    if (node.parentId && result[node.parentId]) {
      result[node.parentId].children!.push(node.id);
    }
  }

  return result;
}

export function useWorkspaceTree(
  workspaceNodes: NodeStoreItem[],
  onReorder: (parentId: string | null, orderedChildIds: string[]) => void,
  onDrillIn: (nodeId: string) => void,
) {
  const items = useMemo(() => buildItems(workspaceNodes), [workspaceNodes]);

  const dataLoader = useMemo(
    () => ({
      getItem: (itemId: string) =>
        items[itemId] ?? { name: itemId, children: [] },
      getChildren: (itemId: string) =>
        items[itemId]?.children ?? [],
    }),
    [items],
  );

  const onReorderRef = useRef(onReorder);
  const onDrillInRef = useRef(onDrillIn);

  const tree = useTree<HeadlessItem>({
    initialState: {
      expandedItems: [],
    },
    rootItemId: VIRTUAL_ROOT,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => {
      const level = item.getItemMeta().level - 1;
      if (level > MAX_INLINE_DEPTH) return false;
      return (item.getItemData()?.children?.length ?? 0) > 0;
    },
    onPrimaryAction: (item) => {
      const level = item.getItemMeta().level - 1;
      const hasChildren = (item.getItemData()?.children?.length ?? 0) > 0;
      if (level > MAX_INLINE_DEPTH && hasChildren) {
        onDrillInRef.current(item.getId());
      }
    },
    dataLoader,
    indent: INDENT,
    canDrop: (_items, target) => {
      return isOrderedDragTarget(target);
    },
    onDrop: createOnDropHandler(
      // eslint-disable-next-line react-hooks/refs
      (parentItem: ItemInstance<HeadlessItem>, newChildrenIds: string[]) => {
        const parentId =
          parentItem.getId() === VIRTUAL_ROOT
            ? null
            : parentItem.getId();
        onReorderRef.current(parentId, newChildrenIds);
      },
    ),
    seperateDragHandle: true,
    canDrag: () => true,
    features: [
      syncDataLoaderFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
    ],
  });

  useEffect(() => {
    tree.rebuildTree();
  }, [items, tree]);

  useEffect(() => {
    onReorderRef.current = onReorder;
  }, [onReorder]);

  useEffect(() => {
    onDrillInRef.current = onDrillIn;
  }, [onDrillIn]);

  return tree;
}
