"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { createWorkspaceSchema, updateWorkspaceSchema } from "@/lib/workspace-schemas";
import type { CreateWorkspaceInput } from "@/lib/workspace-schemas";

interface WorkspaceFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateWorkspaceInput) => Promise<boolean>;
  initialValues?: {
    name: string;
    groupId?: string | null;
  };
}

export function WorkspaceFormDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: WorkspaceFormDialogProps) {
  const groups = useWorkspaceStore((s) => s.workspaceGroups);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [groupId, setGroupId] = useState<string | null>(initialValues?.groupId ?? null);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Workspace" : "Create Workspace";
  const descriptionText = isEdit
    ? "Update the workspace details below."
    : "Add a new workspace to start tracking your progress.";

  async function handleSubmit() {
    setErrors({});
    const schema = isEdit ? updateWorkspaceSchema : createWorkspaceSchema;
    const result = schema.safeParse({
      name: name.trim() || undefined,
      groupId,
    });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.name?.[0]) {
        setErrors({ name: fieldErrors.name[0] });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onSubmit(result.data as CreateWorkspaceInput);
      if (ok) {
        setName("");
        setGroupId(null);
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Computer Networks"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspace-group">Group</Label>
            <Select
              value={groupId ?? "ungrouped"}
              onValueChange={(val) => setGroupId(val === "ungrouped" ? null : val)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="workspace-group">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ungrouped">Uncategorized</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />}
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
