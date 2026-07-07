"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaceStore } from "@/stores/workspace-store";

interface AddWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (workspaceId: string) => void;
}

export function AddWorkspaceDialog({
  open,
  onOpenChange,
  onAdd,
}: AddWorkspaceDialogProps) {
  const { workspaces } = useWorkspaceStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const availableWorkspaces = useMemo(
    () => workspaces.filter((w) => w.groupId === null),
    [workspaces],
  );

  function handleAdd() {
    if (!selectedId) return;
    onAdd(selectedId);
    setSelectedId(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Workspace to Group</DialogTitle>
          <DialogDescription>
            Select an ungrouped workspace to add to this group.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {availableWorkspaces.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No ungrouped workspaces available. Create a new workspace first.
            </p>
          ) : (
            <Select
              value={selectedId ?? ""}
              onValueChange={setSelectedId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a workspace..." />
              </SelectTrigger>
              <SelectContent>
                {availableWorkspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedId}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
