"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Edit02Icon, Loading02Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { GroupCard } from "@/components/workspaces/group-card";
import { GroupFormDialog } from "@/components/workspaces/group-form-dialog";
import { DeleteConfirmationDialog } from "@/components/topics/delete-confirmation-dialog";
import type { CreateWorkspaceGroupInput } from "@/lib/workspace-schemas";

export function GroupsPageClient() {
  const router = useRouter();
  const { workspaceGroups, workspaces, addGroup, updateGroup, removeGroup } = useWorkspaceStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  async function handleCreate(input: CreateWorkspaceGroupInput): Promise<boolean> {
    addGroup(input);
    toast.success("Group created successfully");
    return true;
  }

  async function handleEdit(input: CreateWorkspaceGroupInput): Promise<boolean> {
    if (!editTarget) return false;
    updateGroup(editTarget.id, input);
    setEditTarget(null);
    toast.success("Group updated successfully");
    return true;
  }

  function handleDelete(id: string) {
    const g = workspaceGroups.find((x) => x.id === id);
    if (g) setDeleteTarget({ id: g.id, name: g.name });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    removeGroup(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Group deleted successfully");
  }

  function handleOpen(id: string) {
    router.push(`/groups/${id}`);
  }

  const hasGroups = workspaceGroups.length > 0;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspace Groups</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize your workspaces into groups.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
          >
            <HugeiconsIcon icon={isEditing ? Loading02Icon : Edit02Icon} className="size-3" />
            {isEditing ? "Done" : "Edit"}
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} />
            Create
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex-1">
        {!hasGroups && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-lg font-medium">No groups yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first group to organize your workspaces.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
            >
              <HugeiconsIcon icon={Add01Icon} />
              Create your first group
            </Button>
          </div>
        )}

        {hasGroups && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspaceGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                workspaceCount={workspaces.filter((w) => w.groupId === group.id).length}
                isEditing={isEditing}
                onOpen={handleOpen}
                onEdit={(id) => {
                  const g = workspaceGroups.find((x) => x.id === id);
                  if (g) setEditTarget({ id: g.id, name: g.name });
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <GroupFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      <GroupFormDialog
        key={editTarget?.id ?? "no-edit"}
        mode="edit"
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        onSubmit={handleEdit}
        initialValues={editTarget ? { name: editTarget.name } : undefined}
      />

      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Group"
        description={deleteTarget
          ? (() => {
              const count = workspaces.filter((w) => w.groupId === deleteTarget.id).length;
              const base = `Are you sure you want to delete "${deleteTarget.name}"?`;
              return count > 0
                ? `${base} ${count} workspace${count === 1 ? "" : "s"} will become ungrouped. This action cannot be undone.`
                : `${base} This action cannot be undone.`;
            })()
          : ""}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
