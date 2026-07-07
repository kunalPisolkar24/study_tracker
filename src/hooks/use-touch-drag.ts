"use client";

import { useRef, useCallback, useEffect } from "react";
import type { TreeInstance, ItemInstance } from "@headless-tree/core";
import { isOrderedDragTarget } from "@headless-tree/core";
import { useDragGhost } from "@/hooks/use-drag-ghost";
import {
  computeOrderedReorder,
  computeIntoFolderReorder,
  compileReorderResult,
} from "@/lib/workspace/tree/tree-reorder";
import { VIRTUAL_ROOT } from "@/lib/workspace/tree/tree-adapter";

function buildOrderedDragTarget(
  item: ItemInstance<any>,
  position: "above" | "below",
  tree: TouchTree,
): Record<string, unknown> | null {
  const parent = item.getParent();
  if (!parent) return null;

  const childIndex = item.getIndexInParent() + (position === "below" ? 1 : 0);
  const itemMeta = item.getItemMeta();
  const draggedItems = tree.getState().dnd?.draggedItems;

  const children = parent.getChildren();
  let beforeCount = 0;
  for (let i = 0; i < childIndex; i++) {
    if (draggedItems?.some((di: any) => di.getId() === children[i]?.getId())) {
      beforeCount++;
    }
  }

  return {
    item: parent,
    childIndex,
    insertionIndex: childIndex - beforeCount,
    dragLineIndex: itemMeta.index + (position === "below" ? 1 : 0),
    dragLineLevel: itemMeta.level,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TouchTree = TreeInstance<any>;

interface TouchDragOptions {
  tree: TouchTree | null;
  onReorder: (parentId: string | null, orderedChildIds: string[]) => void;
  enabled: boolean;
  containerEl: HTMLElement | null;
}

export function useTouchDrag({
  tree,
  onReorder,
  enabled,
  containerEl,
}: TouchDragOptions) {
  const isDraggingRef = useRef(false);
  const draggedItemRef = useRef<ItemInstance<any> | null>(null);
  const treeRef = useRef(tree);
  const onReorderRef = useRef(onReorder);
  const ghost = useDragGhost();

  useEffect(() => {
    treeRef.current = tree;
  }, [tree]);

  useEffect(() => {
    onReorderRef.current = onReorder;
  }, [onReorder]);

  const cleanupRef = useRef<() => void>(() => {});

  cleanupRef.current = () => {
    if (isDraggingRef.current && treeRef.current) {
      treeRef.current.applySubStateUpdate("dnd", null);
    }
    ghost.remove();
    isDraggingRef.current = false;
    draggedItemRef.current = null;
  };

  useEffect(() => {
    if (!containerEl || !enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const dragHandle = target.closest('[aria-label="Drag to reorder"]');
      if (!dragHandle) return;

      const treeItemEl = (dragHandle as HTMLElement).closest(
        '[data-slot="tree-item"]',
      );
      if (!treeItemEl) return;

      const t = treeRef.current;
      if (!t) return;

      const items = t.getItems();
      const item = items.find((i: any) => i.getElement() === treeItemEl);
      if (!item) return;

      e.preventDefault();

      const touch = e.touches[0];
      isDraggingRef.current = true;
      draggedItemRef.current = item;

      const el = item.getElement();
      if (el) {
        ghost.create(el, touch.clientX, touch.clientY);
      }

      t.applySubStateUpdate("dnd", {
        draggedItems: [item],
        draggingOverItem: item,
      } as never);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;

      e.preventDefault();
      const touch = e.touches[0];

      const currentDragged = draggedItemRef.current;
      if (currentDragged) {
        const el = currentDragged.getElement();
        if (el) {
          ghost.updatePosition(touch.clientX, touch.clientY, el.offsetWidth);
        }
      }

      const hitEl = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!hitEl) return;

      let current = hitEl as HTMLElement | null;
      while (current) {
        if (current.getAttribute("data-slot") === "tree-item") break;
        current = current.parentElement;
      }
      if (!current) return;

      const t = treeRef.current;
      if (!t) return;

      const targetItem = t
        .getItems()
        .find((i: any) => i.getElement() === current);
      if (!targetItem) return;

      const bb = current.getBoundingClientRect();
      const relY = (touch.clientY - bb.top) / bb.height;
      const config = t.getConfig();
      const reorderArea = config.reorderAreaPercentage ?? 0.3;

      const draggedItems = t.getState().dnd?.draggedItems;
      const isDraggingSelfOrDescendant = draggedItems?.some(
        (di: any) =>
          targetItem.getId() === di.getId() ||
          targetItem.isDescendentOf(di.getId()),
      );
      const canDropOnItem =
        !isDraggingSelfOrDescendant &&
        (config.canDrop?.(draggedItems ?? [], { item: targetItem }) ?? true);

      let dragTarget: Record<string, unknown> | null = null;

      if (targetItem.isExpanded() && targetItem.isFolder()) {
        if (relY < reorderArea) {
          dragTarget = buildOrderedDragTarget(targetItem, "above", t);
        } else if (canDropOnItem) {
          dragTarget = { item: targetItem };
        }
      } else {
        if (relY < reorderArea) {
          dragTarget = buildOrderedDragTarget(targetItem, "above", t);
        } else if (relY > 1 - reorderArea) {
          dragTarget = buildOrderedDragTarget(targetItem, "below", t);
        } else if (targetItem.isFolder() && canDropOnItem) {
          dragTarget = { item: targetItem };
        } else {
          dragTarget = buildOrderedDragTarget(targetItem, "below", t);
        }
      }

      if (dragTarget) {
        t.applySubStateUpdate("dnd", {
          dragTarget,
          draggingOverItem: targetItem,
        } as never);
      }
    };

    const handleTouchEnd = () => {
      if (!isDraggingRef.current) return;

      const t = treeRef.current;
      const dndState = t?.getState().dnd;
      const dragTarget = dndState?.dragTarget;

      if (dragTarget) {
        const draggedItems = dndState?.draggedItems;
        if (draggedItems && draggedItems.length > 0) {
          const draggedIds = draggedItems.map((i: ItemInstance<any>) => i.getId());

          if (isOrderedDragTarget(dragTarget)) {
            const parent = dragTarget.item as ItemInstance<any>;
            const allChildren = parent.getChildren().map((c: ItemInstance<any>) => c.getId());
            const result = computeOrderedReorder(
              allChildren,
              draggedIds,
              dragTarget.insertionIndex,
            );
            const compiled = compileReorderResult(
              parent.getId(),
              VIRTUAL_ROOT,
              result.childIds,
            );
            onReorderRef.current(compiled.parentId, compiled.orderedChildIds);
          } else {
            const allChildren = dragTarget.item
              .getChildren()
              .map((c: ItemInstance<any>) => c.getId());
            const result = computeIntoFolderReorder(allChildren, draggedIds);
            const compiled = compileReorderResult(
              dragTarget.item.getId(),
              VIRTUAL_ROOT,
              result.childIds,
            );
            onReorderRef.current(compiled.parentId, compiled.orderedChildIds);
          }
        }
      }

      cleanupRef.current?.();
    };

    containerEl.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    containerEl.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    containerEl.addEventListener("touchend", handleTouchEnd);
    containerEl.addEventListener("touchcancel", cleanupRef.current);

    return () => {
      containerEl.removeEventListener("touchstart", handleTouchStart);
      containerEl.removeEventListener("touchmove", handleTouchMove);
      containerEl.removeEventListener("touchend", handleTouchEnd);
      containerEl.removeEventListener("touchcancel", cleanupRef.current);
      cleanupRef.current?.();
    };
  }, [enabled, containerEl, ghost]);
}
