"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowLeftIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { GroupDetailSkeleton } from "@/components/skeletons/group-detail-skeleton";
import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { WorkspaceFormDialog } from "@/components/workspaces/workspace-form-dialog";
import { AddWorkspaceDialog } from "@/components/workspaces/add-workspace-dialog";
import type { CreateWorkspaceInput } from "@/lib/workspace/workspace-schemas";

interface GroupDetailClientProps {
  groupId: string;
}

export function GroupDetailClient({ groupId }: GroupDetailClientProps) {
  const router = useRouter();
  const hydrated = useWorkspaceStore((s) => s.hydrated);
  const { workspaceGroups, workspaces, addWorkspace, updateWorkspace, removeWorkspace, reassignWorkspace } = useWorkspaceStore();

  const group = workspaceGroups.find((g) => g.id === groupId);
  const groupWorkspaces = workspaces.filter((w) => w.groupId === groupId);

  const [isAddToGroupOpen, setIsAddToGroupOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: string;
    name: string;
    groupId?: string | null;
  } | null>(null);

  if (!hydrated) return <GroupDetailSkeleton />;

  if (!group) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <p className="text-lg font-medium">Group not found</p>
          <p className="text-sm text-muted-foreground">
            This group doesn&apos;t exist or has been deleted.
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push("/groups")}>
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  async function handleAddToGroup(workspaceId: string) {
    await reassignWorkspace(workspaceId, groupId);
  }

  async function handleCreate(input: CreateWorkspaceInput): Promise<boolean> {
    await addWorkspace({ ...input, groupId });
    toast.success("Workspace created successfully");
    return true;
  }

  async function handleEdit(input: CreateWorkspaceInput): Promise<boolean> {
    if (!editTarget) return false;
    await updateWorkspace(editTarget.id, input);
    setEditTarget(null);
    toast.success("Workspace updated successfully");
    return true;
  }

  async function handleDelete(id: string) {
    await removeWorkspace(id);
    toast.success("Workspace removed successfully");
  }

  function handleOpen(id: string) {
    router.push(`/workspaces/${id}`);
  }

  function getGroupName(): string | undefined {
    return group!.name;
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start gap-4 sm:items-center">
        <Button variant="ghost" size="icon" onClick={() => router.push("/groups")}>
          <HugeiconsIcon icon={ArrowLeftIcon} />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {groupWorkspaces.length} {groupWorkspaces.length === 1 ? "workspace" : "workspaces"}
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsAddToGroupOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} />
            Add Workspace
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={() => setIsCreateOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} />
            Create
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex-1">
        {groupWorkspaces.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-lg font-medium">No workspaces in this group</p>
            <p className="text-sm text-muted-foreground">
              Add existing workspaces or create a new one.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAddToGroupOpen(true)}>
                <HugeiconsIcon icon={Add01Icon} />
                Add Workspace
              </Button>
              <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                <HugeiconsIcon icon={Add01Icon} />
                Create
              </Button>
            </div>
          </div>
        )}

        {groupWorkspaces.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                groupName={getGroupName()}
                onOpen={handleOpen}
                onEdit={(id) => {
                  const w = workspaces.find((x) => x.id === id);
                  if (w) setEditTarget({ id: w.id, name: w.name, groupId: w.groupId });
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <AddWorkspaceDialog
        open={isAddToGroupOpen}
        onOpenChange={setIsAddToGroupOpen}
        onAdd={handleAddToGroup}
      />

      <WorkspaceFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      <WorkspaceFormDialog
        key={editTarget?.id ?? "no-edit"}
        mode="edit"
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        onSubmit={handleEdit}
        initialValues={
          editTarget
            ? { name: editTarget.name, groupId: editTarget.groupId }
            : undefined
        }
      />
    </div>
  );
}
