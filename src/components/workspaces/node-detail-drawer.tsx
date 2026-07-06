"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Archive04Icon,
  CheckmarkSquare01Icon,
  FullSignalIcon,
  HourglassIcon,
  LowSignalIcon,
  MediumSignalIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { deriveStatusClass, deriveConfidenceClass } from "@/lib/node-utils";
import type { NodeStoreItem, NodeStatus, NodeConfidence } from "@/types/node";

interface NodeDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: NodeStoreItem;
  onSave: (id: string, updates: { status?: NodeStatus | null; confidence?: NodeConfidence | null; notes?: string; title?: string }) => void;
}

const STATUS_OPTIONS: Array<{ value: NodeStatus; label: string; icon: typeof Archive04Icon }> = [
  { value: "not_started", label: "Not Started", icon: Archive04Icon },
  { value: "in_progress", label: "In Progress", icon: HourglassIcon },
  { value: "done", label: "Done", icon: CheckmarkSquare01Icon },
];

const CONFIDENCE_OPTIONS: Array<{ value: NodeConfidence; label: string; icon: typeof LowSignalIcon }> = [
  { value: "weak", label: "Weak", icon: LowSignalIcon },
  { value: "ok", label: "OK", icon: MediumSignalIcon },
  { value: "strong", label: "Strong", icon: FullSignalIcon },
];

export function NodeDetailDrawer({
  open,
  onOpenChange,
  node,
  onSave,
}: NodeDetailDrawerProps) {
  const [title, setTitle] = useState(node.title);
  const [status, setStatus] = useState<NodeStatus | null>(node.status);
  const [confidence, setConfidence] = useState<NodeConfidence | null>(node.confidence);
  const [notes, setNotes] = useState(node.notes ?? "");

  useEffect(() => {
    setTitle(node.title);
    setStatus(node.status);
    setConfidence(node.confidence);
    setNotes(node.notes ?? "");
  }, [node]);

  function handleSave() {
    onSave(node.id, { title: title.trim() || node.title, status, confidence, notes });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-4 sm:p-6 max-h-[85dvh] grid-rows-[auto_1fr_auto]">
        <DialogHeader>
          <DialogTitle>{node.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="detail-title">Title</Label>
            <Input
              id="detail-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant="outline"
                    className={cn(
                      "cursor-pointer px-3 py-1.5",
                      status === opt.value ? deriveStatusClass(opt.value) : "opacity-40 hover:opacity-70",
                    )}
                    onClick={() => setStatus(status === opt.value ? null : opt.value)}
                  >
                    <span className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={opt.icon} className="size-3.5" />
                      {opt.label}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confidence</Label>
              <div className="flex flex-wrap gap-2">
                {CONFIDENCE_OPTIONS.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant="outline"
                    className={cn(
                      "cursor-pointer px-3 py-1.5",
                      confidence === opt.value ? deriveConfidenceClass(opt.value) : "opacity-40 hover:opacity-70",
                    )}
                    onClick={() => setConfidence(confidence === opt.value ? null : opt.value)}
                  >
                    <span className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={opt.icon} className="size-3.5" />
                      {opt.label}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detail-notes">Notes</Label>
            <Textarea
              id="detail-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add notes..."
            />
          </div>

          {node.lastReviewedAt && (
            <p className="text-xs text-muted-foreground">
              Last reviewed: {new Date(node.lastReviewedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
