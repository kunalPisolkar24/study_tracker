"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowLeftIcon, Edit02Icon, SaveIcon, PieChart09Icon } from "@hugeicons/core-free-icons";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodeStore } from "@/stores/node-store";
import { WorkspaceDetailSkeleton } from "@/components/skeletons/workspace-detail-skeleton";
import { SortableTree } from "@/components/tree/sortable-tree";
import { NodeFormDialog } from "@/components/workspaces/node-form-dialog";
import { NodeDetailDrawer } from "@/components/workspaces/node-detail-drawer";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { FilterSortBar } from "@/components/workspaces/filter-sort-bar";
import {
  buildTree,
  computeProgress,
  applyFilterAndSort,
} from "@/lib/workspace/node-utils";
import type { NodeStoreItem, TreeNode } from "@/types/node";

interface WorkspaceDetailClientProps {
  workspaceId: string;
  focusedNodeId?: string;
}

export function WorkspaceDetailClient({ workspaceId, focusedNodeId }: WorkspaceDetailClientProps) {
  const router = useRouter();
  const wsHydrated = useWorkspaceStore((s) => s.hydrated);
  const nodeHydrated = useNodeStore((s) => s.hydrated);
  const workspace = useWorkspaceStore((s) => s.workspaces.find((w) => w.id === workspaceId));
  const allNodes = useNodeStore((s) => s.nodes);

  const addNode = useNodeStore((s) => s.addNode);
  const updateNode = useNodeStore((s) => s.updateNode);
  const removeNode = useNodeStore((s) => s.removeNode);
  const reorderSiblings = useNodeStore((s) => s.reorderSiblings);

  const filter = useNodeStore((s) => s.filter);
  const setFilter = useNodeStore((s) => s.setFilter);

  const workspaceNodes = useMemo(
    () => allNodes.filter((n) => n.workspaceId === workspaceId),
    [allNodes, workspaceId],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [dialog, setDialog] = useState<
    { type: "idle" }
    | { type: "create"; parentId?: string }
    | { type: "edit"; target: NodeStoreItem }
    | { type: "detail"; target: NodeStoreItem }
    | { type: "delete"; target: NodeStoreItem }
  >({ type: "idle" });

  const rootNode = focusedNodeId ? workspaceNodes.find((n) => n.id === focusedNodeId) : null;

  const rawTree = useMemo(
    () => buildTree(workspaceNodes, rootNode?.id ?? null, 0),
    [workspaceNodes, rootNode],
  );

  const filteredTree = useMemo(
    () => applyFilterAndSort(rawTree, filter, workspaceNodes),
    [rawTree, filter, workspaceNodes],
  );

  const displayNodes = useMemo(() => {
    const ids = new Set<string>();
    function collectIds(tree: TreeNode[]) {
      for (const tn of tree) {
        ids.add(tn.node.id);
        collectIds(tn.children);
      }
    }
    collectIds(filteredTree);
    if (rootNode) {
      ids.add(rootNode.id);
    }
    return workspaceNodes.filter((n) => ids.has(n.id));
  }, [filteredTree, workspaceNodes, rootNode]);

  const progress = useMemo(() => {
    if (rootNode) return computeProgress(workspaceNodes, rootNode.id).percent;
    if (workspaceNodes.length === 0) return 0;
    const topLevel = workspaceNodes.filter((n) => n.parentId === null);
    const totals = topLevel.map((n) => computeProgress(workspaceNodes, n.id));
    const total = totals.reduce((s, t) => s + t.total, 0);
    const done = totals.reduce((s, t) => s + t.done, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [workspaceNodes, rootNode]);

  const handleCreate = useCallback(
    async (title: string) => {
      await addNode({
        workspaceId,
        parentId: dialog.type === "create" ? dialog.parentId ?? null : null,
        title,
      });
      return true;
    },
    [addNode, workspaceId, dialog],
  );

  const handleEdit = useCallback(
    async (title: string) => {
      if (dialog.type !== "edit") return false;
      await updateNode(dialog.target.id, { title });
      return true;
    },
    [updateNode, dialog],
  );

  const handleDetailSave = useCallback(
    async (id: string, updates: Parameters<typeof updateNode>[1]) => {
      await updateNode(id, updates);
    },
    [updateNode],
  );

  const handleDelete = useCallback(async () => {
    if (dialog.type !== "delete") return;
    await removeNode(dialog.target.id);
    if (focusedNodeId === dialog.target.id) {
      router.push(`/workspaces/${workspaceId}`);
    }
    setDialog({ type: "idle" });
  }, [dialog, removeNode, focusedNodeId, workspaceId, router]);

  const handleDrillIn = useCallback(
    (nodeId: string) => {
      router.push(`/workspaces/${workspaceId}/${nodeId}`);
    },
    [router, workspaceId],
  );

  const handleReorder = useCallback(
    async (parentId: string | null, orderedChildIds: string[]) => {
      await reorderSiblings(parentId, workspaceId, orderedChildIds);
    },
    [reorderSiblings, workspaceId],
  );

  const handleAddChild = useCallback(
    (node: NodeStoreItem) => {
      setDialog({ type: "create", parentId: node.id });
    },
    [],
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 56);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!wsHydrated || !nodeHydrated) return <WorkspaceDetailSkeleton />;

  if (!workspace) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-lg font-medium">Workspace not found</p>
        <p className="text-sm text-muted-foreground">This workspace does not exist.</p>
        <Button variant="outline" asChild>
          <Link href="/workspaces">
            <HugeiconsIcon icon={ArrowLeftIcon} />
            Back to Workspaces
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col">
      <div
        ref={headerRef}
        className={`sticky top-14 z-20 px-4 sm:px-6 lg:px-8 transition-all duration-200 border-b bg-background ${
          isCompact
            ? "py-1.5 sm:py-2"
            : "pt-8 pb-4"
        }`}
      >
        <div className={`flex items-center justify-between gap-4 ${
          isCompact ? "flex-row" : "flex-col sm:flex-row flex-wrap items-start"
        }`}>
          <div className="min-w-0 flex-1">
            <h1 className={`font-bold tracking-tight truncate ${
              isCompact ? "text-sm" : "text-2xl"
            }`}>
              {rootNode?.title ?? workspace.name}
            </h1>
            {!isCompact && rootNode && (
              <p className="mt-1 text-sm text-muted-foreground">
                {workspace.name}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {!isCompact && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                <span>{progress}%</span>
                <Progress value={progress} className="h-1.5 w-16" />
              </span>
            )}
            <Button
              size={isCompact ? "xs" : "sm"}
              variant="outline"
              asChild
            >
              <Link href={`/workspaces/${workspaceId}/dashboard`}>
                <HugeiconsIcon icon={PieChart09Icon} />
                {isCompact ? (
                  <span className="sr-only">Dashboard</span>
                ) : (
                  "Dashboard"
                )}
              </Link>
            </Button>
            <Button
              size={isCompact ? "xs" : "sm"}
              variant="outline"
              onClick={() => setDialog({ type: "create" })}
            >
              <HugeiconsIcon icon={Add01Icon} />
              {isCompact ? (
                <span className="sr-only">Add Topic</span>
              ) : (
                "Add Topic"
              )}
            </Button>
            <Button
              size={isCompact ? "xs" : "sm"}
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              <HugeiconsIcon icon={isEditing ? SaveIcon : Edit02Icon} className="size-3" />
              {isCompact ? (
                <span className="sr-only">{isEditing ? "Save" : "Edit"}</span>
              ) : (
                isEditing ? "Save" : "Edit"
              )}
            </Button>
            <FilterSortBar
              filter={filter}
              onChange={setFilter}
              compact={isCompact}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8">
        <SortableTree
          workspaceNodes={displayNodes}
          isEditing={isEditing}
          onDrillIn={handleDrillIn}
          onSelect={(node) => setDialog({ type: "detail", target: node })}
          onEdit={(node) => setDialog({ type: "edit", target: node })}
          onDelete={(node) => setDialog({ type: "delete", target: node })}
          onAddChild={handleAddChild}
          onReorder={handleReorder}
        />
      </div>

      <NodeFormDialog
        mode="create"
        open={dialog.type === "create"}
        onOpenChange={(o) => { if (!o) setDialog({ type: "idle" }); }}
        onSubmit={handleCreate}
      />

      <NodeFormDialog
        key={dialog.type === "edit" ? dialog.target.id : "no-edit"}
        mode="edit"
        open={dialog.type === "edit"}
        onOpenChange={(o) => { if (!o) setDialog({ type: "idle" }); }}
        onSubmit={handleEdit}
        initialValue={dialog.type === "edit" ? dialog.target.title : ""}
      />

      {dialog.type === "detail" && dialog.target && (
        <NodeDetailDrawer
          key={dialog.target.id}
          open
          onOpenChange={(o) => { if (!o) setDialog({ type: "idle" }); }}
          node={dialog.target}
          onSave={handleDetailSave}
        />
      )}

      <DeleteConfirmationDialog
        open={dialog.type === "delete"}
        onOpenChange={(o) => { if (!o) setDialog({ type: "idle" }); }}
        title="Delete Topic"
        description={
          dialog.type === "delete"
            ? `Are you sure you want to delete "${dialog.target.title}"? This will also remove all children.`
            : ""
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
