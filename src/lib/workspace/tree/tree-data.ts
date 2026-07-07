"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
import { useTree } from "@headless-tree/react";
import {
  syncDataLoaderFeature,
  hotkeysCoreFeature,
  dragAndDropFeature,
  keyboardDragAndDropFeature,
  createOnDropHandler,
  isOrderedDragTarget,
  type ItemInstance,
} from "@headless-tree/core";
import type { NodeStoreItem } from "@/types/node";
import {
  buildTreeItems,
  createDataLoader,
  VIRTUAL_ROOT,
  type HeadlessItemData,
} from "@/lib/workspace/tree/tree-adapter";
import { compileReorderResult } from "@/lib/workspace/tree/tree-reorder";

export { VIRTUAL_ROOT };

export const MAX_INLINE_DEPTH = 2;
const INDENT = 16;

export function useWorkspaceTree(
  workspaceNodes: NodeStoreItem[],
  onReorder: (parentId: string | null, orderedChildIds: string[]) => void,
  onDrillIn: (nodeId: string) => void,
) {
  const items = useMemo(() => buildTreeItems(workspaceNodes), [workspaceNodes]);

  const dataLoader = useMemo(() => createDataLoader(items), [items]);

  const onReorderRef = useRef(onReorder);
  const onDrillInRef = useRef(onDrillIn);

  const isFolder = useCallback((item: ItemInstance<HeadlessItemData>) => {
    const level = item.getItemMeta().level - 1;
    if (level > MAX_INLINE_DEPTH) return false;
    return (item.getItemData()?.children?.length ?? 0) > 0;
  }, []);

  const tree = useTree<HeadlessItemData>({
    initialState: {
      expandedItems: [],
    },
    rootItemId: VIRTUAL_ROOT,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: isFolder,
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
      if (isOrderedDragTarget(target)) return true;
      return target.item.isFolder();
    },
    onDrop: createOnDropHandler(
      (parentItem: ItemInstance<HeadlessItemData>, newChildrenIds: string[]) => {
        const result = compileReorderResult(
          parentItem.getId(),
          VIRTUAL_ROOT,
          newChildrenIds,
        );
        onReorderRef.current(result.parentId, result.orderedChildIds);
      },
    ),
    seperateDragHandle: true,
    canDrag: () => true,
    features: [
      syncDataLoaderFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  });

  useEffect(() => {
    const dndState = tree.getState().dnd;
    const isDragging =
      dndState?.draggedItems && dndState.draggedItems.length > 0;
    if (isDragging) return;
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
