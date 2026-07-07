"use server";

import { auth } from "@/lib/auth/auth";
import { workspaceService } from "@/lib/services/workspace-service";
import type { WorkspaceStoreItem } from "@/types/workspace";
import type { CreateWorkspaceInput } from "@/lib/workspace/workspace-schemas";

export async function createWorkspaceAction(
  input: CreateWorkspaceInput & { groupId?: string | null },
): Promise<WorkspaceStoreItem> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return workspaceService.create(input, session.user.id);
}

export async function updateWorkspaceAction(
  id: string,
  input: CreateWorkspaceInput,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await workspaceService.update(id, input, session.user.id);
}

export async function deleteWorkspaceAction(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await workspaceService.remove(id, session.user.id);
}

export async function reassignWorkspaceAction(
  id: string,
  groupId: string | null,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await workspaceService.reassign(id, groupId, session.user.id);
}

export async function fetchWorkspacesAction(): Promise<WorkspaceStoreItem[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return workspaceService.list(session.user.id);
}
