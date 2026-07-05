"use client";

import { useState, useCallback } from "react";
import { NodeRow } from "@/components/workspaces/node-row";
import { computeProgress, computeWeakCount } from "@/lib/node-utils";
import type { NodeStoreItem, TreeNode as TreeNodeType } from "@/types/node";

interface NodeTreeProps {
  tree: TreeNodeType[];
  allNodes: NodeStoreItem[];
  isEditing: boolean;
  onDrillIn: (nodeId: string) => void;
  onEdit: (node: NodeStoreItem) => void;
  onDelete: (node: NodeStoreItem) => void;
  onMoveUp: (nodeId: string, parentId: string | null) => void;
  onMoveDown: (nodeId: string, parentId: string | null) => void;
}

export function NodeTree({
  tree,
  allNodes,
  isEditing,
  onDrillIn,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: NodeTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = useCallback((nodeId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-lg font-medium">No topics yet</p>
        <p className="text-sm text-muted-foreground">
          Add a topic to start building your tree.
        </p>
      </div>
    );
  }

  function renderNodes(nodes: TreeNodeType[], siblingParentId: string | null) {
    return nodes.map((tn, idx) => {
      const isExpanded = expanded.has(tn.node.id);
      const hasChildren = tn.children.length > 0;

      return (
        <div key={tn.node.id} className="space-y-1">
          <NodeRow
            node={tn.node}
            depth={tn.depth}
            isExpanded={isExpanded}
            hasChildren={hasChildren}
            isEditing={isEditing}
            isFirst={idx === 0}
            isLast={idx === nodes.length - 1}
            progress={hasChildren ? computeProgress(allNodes, tn.node.id) : undefined}
            weakCount={hasChildren ? computeWeakCount(allNodes, tn.node.id) : undefined}
            onToggle={() => toggle(tn.node.id)}
            onDrillIn={() => onDrillIn(tn.node.id)}
            onEdit={() => onEdit(tn.node)}
            onDelete={() => onDelete(tn.node)}
            onMoveUp={() => onMoveUp(tn.node.id, siblingParentId)}
            onMoveDown={() => onMoveDown(tn.node.id, siblingParentId)}
          />
          {isExpanded && hasChildren && (
            <div className="space-y-1">
              {renderNodes(tn.children, tn.node.id)}
            </div>
          )}
        </div>
      );
    });
  }

  return <div className="space-y-1">{renderNodes(tree, null)}</div>;
}
