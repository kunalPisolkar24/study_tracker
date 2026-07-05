export interface WorkspaceGroupStoreItem {
  id: string;
  name: string;
  orderIndex: number;
  createdAt: string;
}

export interface WorkspaceStoreItem {
  id: string;
  name: string;
  groupId: string | null;
  orderIndex: number;
  createdAt: string;
}
