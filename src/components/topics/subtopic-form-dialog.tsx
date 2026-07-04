"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { createSubTopicSchema, updateSubTopicSchema } from "@/lib/schemas";
import { useFormDialog } from "@/components/topics/use-form-dialog";

const createSubTopicFormSchema = z.object({
  name: createSubTopicSchema.shape.name,
  description: createSubTopicSchema.shape.description,
});

interface SubtopicFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { name: string; description?: string }) => Promise<boolean>;
  initialValues?: {
    name: string;
    description?: string;
  };
}

export function SubtopicFormDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: SubtopicFormDialogProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const { isSubmitting, submit } = useFormDialog();

  const isEdit = mode === "edit";

  async function handleSubmit() {
    setErrors({});
    const schema = isEdit ? updateSubTopicSchema : createSubTopicFormSchema;
    const result = schema.safeParse({
      name: name.trim() || undefined,
      description: description.trim() || undefined,
    });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.name?.[0]) {
        setErrors({ name: fieldErrors.name[0] });
      }
      return;
    }

    const values = {
      name: result.data.name ?? name.trim(),
      description: result.data.description ?? (description.trim() || undefined),
    };

    if (isEdit) {
      onSubmit(values);
      onOpenChange(false);
    } else {
      const ok = await submit(
        () => onSubmit(values),
        { errorMessage: "Failed to create sub-topic" }
      );
      if (ok) {
        setName("");
        setDescription("");
        onOpenChange(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Sub-topic" : "Create Sub-topic"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the sub-topic details below."
              : "Add a new sub-topic to organize problems."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="st-name">Name</Label>
            <Input
              id="st-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Two Sum Variants"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="st-description">Description</Label>
            <Textarea
              id="st-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this sub-topic..."
              disabled={isSubmitting}
            />
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
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
