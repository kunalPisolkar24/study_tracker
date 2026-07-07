import type { NodeStoreItem, TreeNode, BreadcrumbItem, NodeFilterState, NodeStatus, NodeConfidence } from "@/types/node";

export const MAX_INLINE_DEPTH = 2;

interface TreeIndex {
  childrenMap: Map<string | null, NodeStoreItem[]>;
  nodeMap: Map<string, NodeStoreItem>;
}

/** Builds a children+node map index from a flat node list for O(1) lookups. */
function buildTreeIndex(allNodes: NodeStoreItem[]): TreeIndex {
  const childrenMap = new Map<string | null, NodeStoreItem[]>();
  const nodeMap = new Map<string, NodeStoreItem>();
  for (const node of allNodes) {
    const parentId = node.parentId ?? null;
    if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
    childrenMap.get(parentId)!.push(node);
    nodeMap.set(node.id, node);
  }
  for (const [, children] of childrenMap) {
    children.sort((a, b) => a.orderIndex - b.orderIndex);
  }
  return { childrenMap, nodeMap };
}

/** Recursively collects leaf nodes (nodes without children) under `nodeId`. */
function collectLeafDescendants(
  childrenMap: Map<string | null, NodeStoreItem[]>,
  nodeId: string,
): NodeStoreItem[] {
  const directChildren = childrenMap.get(nodeId);
  if (!directChildren || directChildren.length === 0) return [];
  const result: NodeStoreItem[] = [];
  for (const child of directChildren) {
    const grandChildren = childrenMap.get(child.id);
    if (!grandChildren || grandChildren.length === 0) {
      result.push(child);
    } else {
      result.push(...collectLeafDescendants(childrenMap, child.id));
    }
  }
  return result;
}

/** Converts a flat node list into a nested `TreeNode[]` starting from `parentId`. */
export function buildTree(
  allNodes: NodeStoreItem[],
  parentId: string | null,
  depth: number,
): TreeNode[] {
  const { childrenMap } = buildTreeIndex(allNodes);
  function build(parent: string | null, d: number): TreeNode[] {
    const children = childrenMap.get(parent) ?? [];
    return children.map((node) => ({
      node,
      depth: d,
      children: build(node.id, d + 1),
    }));
  }
  return build(parentId, depth);
}

/** Returns all leaf descendants (or the node itself if it has no children). */
function getLeafDescendants(allNodes: NodeStoreItem[], nodeId: string): NodeStoreItem[] {
  const { childrenMap, nodeMap } = buildTreeIndex(allNodes);
  const directChildren = childrenMap.get(nodeId);
  if (!directChildren || directChildren.length === 0) {
    const self = nodeMap.get(nodeId);
    return self ? [self] : [];
  }
  return collectLeafDescendants(childrenMap, nodeId);
}

/** Returns the count of total/done leaf nodes under `nodeId` with a percentage. */
export function computeProgress(allNodes: NodeStoreItem[], nodeId: string): { total: number; done: number; percent: number } {
  const leaves = getLeafDescendants(allNodes, nodeId);
  const total = leaves.length;
  const done = leaves.filter((l) => l.status === "done").length;
  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

/** Walks up the parent chain from `nodeId` and returns ancestors from root to parent. */
function getAncestors(allNodes: NodeStoreItem[], nodeId: string): NodeStoreItem[] {
  const result: NodeStoreItem[] = [];
  let current = allNodes.find((n) => n.id === nodeId);
  while (current?.parentId) {
    const parent = allNodes.find((n) => n.id === current!.parentId);
    if (parent) {
      result.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }
  return result;
}

export function getBreadcrumb(
  workspaceName: string,
  workspaceId: string,
  allNodes: NodeStoreItem[],
  focusedNodeId?: string,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { id: "workspaces", title: "Workspaces", href: "/workspaces" },
    { id: workspaceId, title: workspaceName, href: `/workspaces/${workspaceId}` },
  ];

  if (focusedNodeId) {
    const ancestors = getAncestors(allNodes, focusedNodeId);
    for (const a of ancestors) {
      items.push({
        id: a.id,
        title: a.title,
        href: `/workspaces/${workspaceId}/${a.id}`,
      });
    }
    const focusNode = allNodes.find((n) => n.id === focusedNodeId);
    if (focusNode) {
      items.push({
        id: focusNode.id,
        title: focusNode.title,
        href: `/workspaces/${workspaceId}/${focusNode.id}`,
      });
    }
  }

  return items;
}

function isLeaf(allNodes: NodeStoreItem[], nodeId: string): boolean {
  return !allNodes.some((n) => n.parentId === nodeId);
}

export function applyFilterAndSort(
  tree: TreeNode[],
  filter: NodeFilterState,
  allNodes: NodeStoreItem[],
): TreeNode[] {
  const isActive = filter.status !== "all" || filter.confidence !== "all";
  if (!isActive) return tree;

  function filterNode(tn: TreeNode): TreeNode | null {
    const filteredChildren = tn.children
      .map(filterNode)
      .filter((n): n is TreeNode => n !== null);

    if (tn.children.length === 0) {
      return nodeMatchesFilter(tn.node.id, filter, allNodes) ? tn : null;
    }
    return filteredChildren.length > 0 ? { ...tn, children: filteredChildren } : null;
  }

  return tree.map(filterNode).filter((n): n is TreeNode => n !== null);
}

function nodeMatchesFilter(nodeId: string, filter: NodeFilterState, allNodes: NodeStoreItem[]): boolean {
  const leaf = isLeaf(allNodes, nodeId);
  if (leaf) {
    const node = allNodes.find((n) => n.id === nodeId)!;
    if (filter.status !== "all" && node.status !== filter.status) return false;
    if (filter.confidence !== "all" && node.confidence !== filter.confidence) return false;
    return true;
  }
  const leaves = getLeafDescendants(allNodes, nodeId);
  return leaves.some((l) => {
    if (filter.status !== "all" && l.status !== filter.status) return false;
    if (filter.confidence !== "all" && l.confidence !== filter.confidence) return false;
    return true;
  });
}

const STATUS_CLASSES: Record<string, string> = {
  done: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
  in_progress: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
};

const CONFIDENCE_CLASSES: Record<string, string> = {
  strong: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
  ok: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400",
  weak: "bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-500/15 dark:text-red-400",
};

export function deriveStatusClass(status: NodeStatus | null): string {
  return status ? STATUS_CLASSES[status] ?? "" : "border-dashed text-muted-foreground";
}

export function deriveConfidenceClass(confidence: NodeConfidence | null): string {
  return confidence ? CONFIDENCE_CLASSES[confidence] ?? "" : "border-dashed text-muted-foreground";
}
