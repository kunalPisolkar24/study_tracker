"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
import { useTree } from "@headless-tree/react";
import {
  syncDataLoaderFeature,
  hotkeysCoreFeature,
  dragAndDropFeature,
  keyboardDragAndDropFeature,
  isOrderedDragTarget,
  type ItemInstance,
  type DragTarget,
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
    onDrop: async (
      items: ItemInstance<HeadlessItemData>[],
      target: DragTarget<HeadlessItemData>,
    ) => {
      const itemIds = items.map((i) => i.getId());

      if (isOrderedDragTarget(target)) {
        // Same-parent reorder: compute final order in one pass
        const allChildren = target.item
          .getChildren()
          .map((c) => c.getId());
        const withoutDragged = allChildren.filter(
          (id) => !itemIds.includes(id),
        );
        const newChildren = [
          ...withoutDragged.slice(0, target.insertionIndex),
          ...itemIds,
          ...withoutDragged.slice(target.insertionIndex),
        ];
        const result = compileReorderResult(
          target.item.getId(),
          VIRTUAL_ROOT,
          newChildren,
        );
        onReorderRef.current(result.parentId, result.orderedChildIds);

        if ("updateCachedChildrenIds" in target.item) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (target.item as any).updateCachedChildrenIds(newChildren);
        }
        tree.rebuildTree();
      } else {
        // Into-folder drop: remove from old parents, append to new parent
        const uniqueParents = [
          ...new Set(items.map((item) => item.getParent())),
        ];
        for (const parent of uniqueParents) {
          if (!parent) continue;
          const siblings = parent.getChildren().map((c) => c.getId());
          const newSiblingIds = siblings.filter(
            (id) => !itemIds.includes(id),
          );
          if (parent.getId() !== target.item.getId()) {
            const result = compileReorderResult(
              parent.getId(),
              VIRTUAL_ROOT,
              newSiblingIds,
            );
            onReorderRef.current(result.parentId, result.orderedChildIds);
          }
          if ("updateCachedChildrenIds" in parent) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (parent as any).updateCachedChildrenIds(newSiblingIds);
          }
        }

        await target.item
          .getTree()
          .waitForItemChildrenLoaded(target.item.getId());
        const oldChildrenIds = target.item
          .getTree()
          .retrieveChildrenIds(target.item.getId());
        const newChildren = [...oldChildrenIds, ...itemIds];
        const result = compileReorderResult(
          target.item.getId(),
          VIRTUAL_ROOT,
          newChildren,
        );
        onReorderRef.current(result.parentId, result.orderedChildIds);
        if ("updateCachedChildrenIds" in target.item) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (target.item as any).updateCachedChildrenIds(newChildren);
        }
        tree.rebuildTree();
      }
    },
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
