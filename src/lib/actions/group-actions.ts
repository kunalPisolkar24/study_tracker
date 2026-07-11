"use server";

import { auth } from "@/lib/auth/auth";
import { workspaceGroupService } from "@/lib/services/workspace-group-service";
import type { WorkspaceGroupStoreItem } from "@/types/workspace";
import type { CreateWorkspaceGroupInput } from "@/lib/workspace/workspace-schemas";

export async function createGroupAction(
  input: CreateWorkspaceGroupInput,
): Promise<WorkspaceGroupStoreItem> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return workspaceGroupService.create(input, session.user.id);
}

export async function updateGroupAction(
  id: string,
  input: CreateWorkspaceGroupInput,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await workspaceGroupService.update(id, input, session.user.id);
}

export async function deleteGroupAction(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await workspaceGroupService.remove(id, session.user.id);
}

export async function fetchGroupsAction(): Promise<WorkspaceGroupStoreItem[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return workspaceGroupService.list(session.user.id);
}
