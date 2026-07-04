"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problemTitle: string;
  notes: string;
}

export function NotesDialog({
  open,
  onOpenChange,
  problemTitle,
  notes,
}: NotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notes</DialogTitle>
          <DialogDescription>{problemTitle}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={notes}
          readOnly
          rows={6}
          className="min-h-[120px] resize-none cursor-default bg-muted/30 text-foreground focus-visible:ring-0 focus-visible:border-input"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
