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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { createProblemSchema, updateProblemSchema } from "@/lib/schemas";
import { useFormDialog } from "@/components/topics/use-form-dialog";
import type { SubTopicStoreItem } from "@/types/topics";

const createProblemFormSchema = z.object({
  title: createProblemSchema.shape.title,
  url: createProblemSchema.shape.url,
  difficulty: createProblemSchema.shape.difficulty,
  subTopicId: createProblemSchema.shape.subTopicId,
  notes: createProblemSchema.shape.notes,
});

interface ProblemFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    title: string;
    url?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    subTopicId?: string | null;
    notes?: string;
  }) => Promise<boolean>;
  subtopics: SubTopicStoreItem[];
  initialValues?: {
    title: string;
    url?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    subTopicId?: string | null;
    notes?: string;
  };
}

const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
] as const;

export function ProblemFormDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  subtopics,
  initialValues,
}: ProblemFormDialogProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [url, setUrl] = useState(initialValues?.url ?? "");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    initialValues?.difficulty ?? "EASY"
  );
  const [subTopicId, setSubTopicId] = useState<string | null>(
    initialValues?.subTopicId ?? null
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});
  const { isSubmitting, submit } = useFormDialog();

  const isEdit = mode === "edit";

  async function handleSubmit() {
    setErrors({});
    const schema = isEdit ? updateProblemSchema : createProblemFormSchema;
    const result = schema.safeParse({
      title: title.trim() || undefined,
      url: url.trim() || undefined,
      difficulty,
      subTopicId: isEdit ? subTopicId : (subTopicId || undefined),
      notes: notes.trim() || undefined,
    });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors: typeof errors = {};
      if (fieldErrors.title?.[0]) newErrors.title = fieldErrors.title[0];
      if (fieldErrors.url?.[0]) newErrors.url = fieldErrors.url[0];
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
      }
      return;
    }

    const values = {
      title: title.trim(),
      url: url.trim() || undefined,
      difficulty,
      subTopicId: subTopicId || null,
      notes: notes.trim() || undefined,
    };

    if (isEdit) {
      onSubmit(values);
      onOpenChange(false);
    } else {
      const ok = await submit(
        () => onSubmit(values),
        { errorMessage: "Failed to create problem" }
      );
      if (ok) {
        setTitle("");
        setUrl("");
        setDifficulty("EASY");
        setSubTopicId(null);
        setNotes("");
        onOpenChange(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Problem" : "Create Problem"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the problem details below."
              : "Add a new problem to track your progress."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-title">Title</Label>
            <Input
              id="p-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Two Sum"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-url">URL</Label>
            <Input
              id="p-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/two-sum/"
              disabled={isSubmitting}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-difficulty">Difficulty</Label>
            <Select
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as "EASY" | "MEDIUM" | "HARD")}
              disabled={isSubmitting}
            >
              <SelectTrigger id="p-difficulty" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-subtopic">Sub-topic</Label>
            <Select
              value={subTopicId ?? "none"}
              onValueChange={(v) => setSubTopicId(v === "none" ? null : v)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="p-subtopic" className="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (direct problem)</SelectItem>
                {subtopics.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-notes">Notes</Label>
            <Textarea
              id="p-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes or observations..."
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
            {isSubmitting && <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />}
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
