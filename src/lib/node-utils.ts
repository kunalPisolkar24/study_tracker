import type { NodeStoreItem, TreeNode, BreadcrumbItem, NodeFilterState, NodeStatus, NodeConfidence } from "@/types/node";

export const MAX_INLINE_DEPTH = 2;

function sortNodes(nodes: NodeStoreItem[]): NodeStoreItem[] {
  return [...nodes].sort((a, b) => a.orderIndex - b.orderIndex);
}

export function buildTree(
  allNodes: NodeStoreItem[],
  parentId: string | null,
  depth: number,
): TreeNode[] {
  const children = sortNodes(allNodes.filter((n) => n.parentId === parentId));
  return children.map((node) => ({
    node,
    depth,
    children: buildTree(allNodes, node.id, depth + 1),
  }));
}

export function getLeafDescendants(allNodes: NodeStoreItem[], nodeId: string): NodeStoreItem[] {
  const directChildren = allNodes.filter((n) => n.parentId === nodeId);
  if (directChildren.length === 0) {
    return [allNodes.find((n) => n.id === nodeId)!].filter(Boolean);
  }
  return directChildren.flatMap((child) => getLeafDescendants(allNodes, child.id));
}

export function computeProgress(allNodes: NodeStoreItem[], nodeId: string): { total: number; done: number; percent: number } {
  const leaves = getLeafDescendants(allNodes, nodeId);
  const total = leaves.length;
  const done = leaves.filter((l) => l.status === "done").length;
  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function computeWeakCount(allNodes: NodeStoreItem[], nodeId: string): number {
  const leaves = getLeafDescendants(allNodes, nodeId);
  return leaves.filter((l) => l.confidence === "weak").length;
}

export function getAncestors(allNodes: NodeStoreItem[], nodeId: string): NodeStoreItem[] {
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

export function computeDerivedStatus(allNodes: NodeStoreItem[], nodeId: string): NodeStatus {
  const leaves = getLeafDescendants(allNodes, nodeId);
  if (leaves.length === 0) return "not_started";
  const allDone = leaves.every((l) => l.status === "done");
  const allNotStarted = leaves.every((l) => l.status === "not_started" || l.status === null);
  if (allDone) return "done";
  if (allNotStarted) return "not_started";
  return "in_progress";
}

export function isLeaf(allNodes: NodeStoreItem[], nodeId: string): boolean {
  return !allNodes.some((n) => n.parentId === nodeId);
}

export function shouldDrillIn(depth: number): boolean {
  return depth > MAX_INLINE_DEPTH;
}

export function applyFilterAndSort(
  tree: TreeNode[],
  filter: NodeFilterState,
  allNodes: NodeStoreItem[],
): TreeNode[] {
  return tree.filter((tn) => nodeMatchesFilter(tn.node.id, filter, allNodes));
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

export function deriveStatusLabel(status: NodeStatus | null): string {
  if (!status) return "Not Started";
  return status === "not_started" ? "Not Started" : status === "in_progress" ? "In Progress" : "Done";
}

export function deriveStatusClass(status: NodeStatus | null): string {
  switch (status) {
    case "done":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400";
    case "in_progress":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400";
    default:
      return "border-dashed text-muted-foreground";
  }
}

export function deriveConfidenceClass(confidence: NodeConfidence | null): string {
  switch (confidence) {
    case "strong":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400";
    case "ok":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400";
    case "weak":
      return "bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-500/15 dark:text-red-400";
    default:
      return "border-dashed text-muted-foreground";
  }
}

export function deriveStatusIconClass(status: NodeStatus | null): string {
  switch (status) {
    case "done":
      return "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400";
    case "in_progress":
      return "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400";
    default:
      return "bg-muted-foreground/10 text-muted-foreground";
  }
}

export function deriveConfidenceIconClass(confidence: NodeConfidence | null): string {
  switch (confidence) {
    case "strong":
      return "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400";
    case "ok":
      return "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400";
    case "weak":
      return "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400";
    default:
      return "bg-muted/50 text-muted-foreground/60";
  }
}
