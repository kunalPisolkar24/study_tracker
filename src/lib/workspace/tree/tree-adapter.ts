import type { NodeStoreItem } from "@/types/node";

export const VIRTUAL_ROOT = "__virtual-root__";

export interface HeadlessItemData {
  name: string;
  children?: string[];
}

export function buildTreeItems(
  nodes: NodeStoreItem[],
): Record<string, HeadlessItemData> {
  const sorted = [...nodes].sort((a, b) => a.orderIndex - b.orderIndex);
  const result: Record<string, HeadlessItemData> = {};
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

export function createDataLoader(items: Record<string, HeadlessItemData>) {
  return {
    getItem: (itemId: string): HeadlessItemData =>
      items[itemId] ?? { name: itemId, children: [] },
    getChildren: (itemId: string): string[] =>
      items[itemId]?.children ?? [],
  };
}


