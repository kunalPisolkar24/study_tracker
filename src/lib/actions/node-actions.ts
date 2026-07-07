"use server";

import { auth } from "@/lib/auth/auth";
import { nodeService } from "@/lib/services/node-service";
import type { CreateNodeInput, UpdateNodeInput, NodeStoreItem, NodeActivityEntry } from "@/types/node";

export async function addNodeAction(input: CreateNodeInput): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return nodeService.addNode(input, session.user.id);
}

export async function updateNodeAction(id: string, input: UpdateNodeInput): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await nodeService.updateNode(id, input, session.user.id);
}

export async function removeNodeAction(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await nodeService.removeNode(id, session.user.id);
}

export async function reorderSiblingsAction(
  parentId: string | null,
  workspaceId: string,
  orderedIds: string[],
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await nodeService.reorderSiblings(parentId, workspaceId, orderedIds, session.user.id);
}

export async function fetchWorkspaceNodesAction(
  workspaceId: string,
): Promise<NodeStoreItem[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return nodeService.getWorkspaceNodes(workspaceId, session.user.id);
}

export async function fetchNodeActivityLogsAction(
  workspaceId: string,
): Promise<NodeActivityEntry[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return nodeService.getActivityLogs(workspaceId, session.user.id);
}

export async function fetchAllNodesAction(): Promise<NodeStoreItem[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return nodeService.getAllNodes(session.user.id);
}

export async function fetchAllActivityLogsAction(): Promise<NodeActivityEntry[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return nodeService.getAllActivityLogs(session.user.id);
}
