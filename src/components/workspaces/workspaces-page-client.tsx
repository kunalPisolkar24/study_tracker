"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { WorkspaceFormDialog } from "@/components/workspaces/workspace-form-dialog";
import type { CreateWorkspaceInput } from "@/lib/workspace-schemas";

const PAGE_SIZE = 6;
const DEBOUNCE_MS = 300;

export function WorkspacesPageClient() {
  const router = useRouter();
  const { workspaces, workspaceGroups, addWorkspace, updateWorkspace, removeWorkspace } = useWorkspaceStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: string;
    name: string;
    groupId?: string | null;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredWorkspaces = workspaces.filter((w) => {
    if (!debouncedQuery.trim()) return true;
    const q = debouncedQuery.toLowerCase();
    return w.name.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredWorkspaces.length / PAGE_SIZE));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const start = (clampedPage - 1) * PAGE_SIZE;
  const paginatedWorkspaces = filteredWorkspaces.slice(start, start + PAGE_SIZE);

  function getGroupName(groupId: string | null): string | undefined {
    if (!groupId) return undefined;
    return workspaceGroups.find((g) => g.id === groupId)?.name;
  }

  async function handleCreate(input: CreateWorkspaceInput): Promise<boolean> {
    addWorkspace(input);
    toast.success("Workspace created successfully");
    return true;
  }

  async function handleEdit(input: CreateWorkspaceInput): Promise<boolean> {
    if (!editTarget) return false;
    updateWorkspace(editTarget.id, input);
    setEditTarget(null);
    toast.success("Workspace updated successfully");
    return true;
  }

  function handleDelete(id: string) {
    removeWorkspace(id);
    toast.success("Workspace deleted successfully");
  }

  function handleOpen(id: string) {
    router.push(`/workspaces/${id}`);
  }

  const hasWorkspaces = workspaces.length > 0;
  const hasFilteredResults = paginatedWorkspaces.length > 0;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and manage your workspaces here.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <HugeiconsIcon icon={Add01Icon} />
          Create
        </Button>
      </div>

      <Separator className="my-6" />

      {hasWorkspaces && (
        <div className="mb-6">
          <Input
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="flex-1">
        {!hasWorkspaces && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-lg font-medium">No workspaces yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first workspace to start tracking your progress.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
            >
              <HugeiconsIcon icon={Add01Icon} />
              Create your first workspace
            </Button>
          </div>
        )}

        {hasWorkspaces && !hasFilteredResults && (
          <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm text-muted-foreground">
              No workspaces match your search. Try a different query.
            </p>
            <Button variant="link" size="sm" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>
        )}

        {hasFilteredResults && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  groupName={getGroupName(workspace.groupId)}
                  onOpen={handleOpen}
                  onEdit={(id) => {
                    const w = workspaces.find((x) => x.id === id);
                    if (w) setEditTarget({ id: w.id, name: w.name, groupId: w.groupId });
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <Button
                        variant={p === clampedPage ? "outline" : "ghost"}
                        size="sm"
                        className="min-w-8"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

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
