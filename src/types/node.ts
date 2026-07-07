export type NodeStatus = "not_started" | "in_progress" | "done";

export type NodeActivityAction =
  | "created"
  | "marked_done"
  | "marked_in_progress"
  | "marked_not_started"
  | "confidence_changed"
  | "reviewed";

export interface NodeActivityEntry {
  id: string;
  nodeId: string;
  workspaceId: string;
  action: NodeActivityAction;
  timestamp: string;
}

export type NodeConfidence = "weak" | "ok" | "strong";

export interface NodeStoreItem {
  id: string;
  workspaceId: string;
  parentId: string | null;
  title: string;
  status: NodeStatus | null;
  confidence: NodeConfidence | null;
  notes: string;
  lastReviewedAt: string | null;
  orderIndex: number;
  createdAt: string;
}

export interface CreateNodeInput {
  workspaceId: string;
  parentId?: string | null;
  title: string;
}

export interface UpdateNodeInput {
  title?: string;
  status?: NodeStatus | null;
  confidence?: NodeConfidence | null;
  notes?: string;
}

export interface TreeNode {
  node: NodeStoreItem;
  children: TreeNode[];
  depth: number;
}

export interface BreadcrumbItem {
  id: string;
  title: string;
  href: string;
}

export interface NodeFilterState {
  status: "all" | NodeStatus;
  confidence: "all" | NodeConfidence;
}

export const STATUS_VALUES: NodeStatus[] = ["not_started", "in_progress", "done"];

export const CONFIDENCE_VALUES: NodeConfidence[] = ["weak", "ok", "strong"];

export const STATUS_LABELS: Record<NodeStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  done: "Done",
};

export const CONFIDENCE_LABELS: Record<NodeConfidence, string> = {
  weak: "Weak",
  ok: "OK",
  strong: "Strong",
};
