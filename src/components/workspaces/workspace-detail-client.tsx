"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowLeftIcon, Edit02Icon, SaveIcon, PieChart09Icon } from "@hugeicons/core-free-icons";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodeStore } from "@/stores/node-store";
import { SortableTree } from "@/components/workspaces/sortable-tree";
import { NodeFormDialog } from "@/components/workspaces/node-form-dialog";
import { NodeDetailDrawer } from "@/components/workspaces/node-detail-drawer";
import { DeleteConfirmationDialog } from "@/components/topics/delete-confirmation-dialog";
import { FilterSortBar } from "@/components/workspaces/filter-sort-bar";
import {
  buildTree,
  computeProgress,
  applyFilterAndSort,
} from "@/lib/node-utils";
import type { NodeStoreItem, NodeFilterState, TreeNode } from "@/types/node";

interface WorkspaceDetailClientProps {
  workspaceId: string;
  focusedNodeId?: string;
}

export function WorkspaceDetailClient({ workspaceId, focusedNodeId }: WorkspaceDetailClientProps) {
  const router = useRouter();
  const workspace = useWorkspaceStore((s) => s.workspaces.find((w) => w.id === workspaceId));
  const allNodes = useNodeStore((s) => s.nodes);
  const addNode = useNodeStore((s) => s.addNode);
  const updateNode = useNodeStore((s) => s.updateNode);
  const removeNode = useNodeStore((s) => s.removeNode);
  const reorderSiblings = useNodeStore((s) => s.reorderSiblings);

  const workspaceNodes = useMemo(
    () => allNodes.filter((n) => n.workspaceId === workspaceId),
    [allNodes, workspaceId],
  );

  const [filter, setFilter] = useState<NodeFilterState>({
    status: "all",
    confidence: "all",
  });

  const [isEditing, setIsEditing] = useState(false);
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
      addNode({
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
      updateNode(dialog.target.id, { title });
      return true;
    },
    [updateNode, dialog],
  );

  const handleDetailSave = useCallback(
    (id: string, updates: Parameters<typeof updateNode>[1]) => {
      updateNode(id, updates);
    },
    [updateNode],
  );

  const handleDelete = useCallback(() => {
    if (dialog.type !== "delete") return;
    removeNode(dialog.target.id);
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
    (parentId: string | null, orderedChildIds: string[]) => {
      reorderSiblings(parentId, workspaceId, orderedChildIds);
    },
    [reorderSiblings, workspaceId],
  );

  const handleAddChild = useCallback(
    (node: NodeStoreItem) => {
      setDialog({ type: "create", parentId: node.id });
    },
    [],
  );

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
    <div className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{rootNode?.title ?? workspace.name}</h1>
          {rootNode && (
            <p className="mt-1 text-sm text-muted-foreground">
              {workspace.name}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
            <span>{progress}%</span>
            <Progress value={progress} className="h-1.5 w-16" />
          </span>
          <Button
            size="sm"
            variant="outline"
            asChild
          >
            <Link href={`/workspaces/${workspaceId}/dashboard`}>
              <HugeiconsIcon icon={PieChart09Icon} />
              Dashboard
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialog({ type: "create" })}
          >
            <HugeiconsIcon icon={Add01Icon} />
            Add Topic
          </Button>
          <Button
            size="sm"
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
          >
            <HugeiconsIcon icon={isEditing ? SaveIcon : Edit02Icon} className="size-3" />
            {isEditing ? "Save" : "Edit"}
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <FilterSortBar
        filter={filter}
        onChange={setFilter}
      />

      <div className="mt-6 flex-1">
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
