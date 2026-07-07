export interface OrderedDragTarget {
  parentId: string | null;
  childIds: string[];
}

export interface IntoFolderDragTarget {
  parentId: string;
  childIds: string[];
}

export type ReorderResult = OrderedDragTarget;

export function computeOrderedReorder(
  allChildrenIds: string[],
  draggedIds: string[],
  insertionIndex: number,
): ReorderResult {
  const withoutDragged = allChildrenIds.filter(
    (id) => !draggedIds.includes(id),
  );
  const newOrder = [
    ...withoutDragged.slice(0, insertionIndex),
    ...draggedIds,
    ...withoutDragged.slice(insertionIndex),
  ];
  return { parentId: null, childIds: newOrder };
}

export function computeIntoFolderReorder(
  allChildrenIds: string[],
  draggedIds: string[],
): ReorderResult {
  const newOrder = [
    ...allChildrenIds.filter((id) => !draggedIds.includes(id)),
    ...draggedIds,
  ];
  return { parentId: null, childIds: newOrder };
}

export function compileReorderResult(
  parentItemId: string,
  virtualRootId: string,
  childIds: string[],
): { parentId: string | null; orderedChildIds: string[] } {
  return {
    parentId: parentItemId === virtualRootId ? null : parentItemId,
    orderedChildIds: childIds,
  };
}
