"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit04Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ActionButtonConfig {
  icon: typeof Add01Icon;
  color: "emerald" | "blue" | "red";
  label: string;
  onClick: () => void;
}

const COLOR_STYLES: Record<
  ActionButtonConfig["color"],
  { light: string; dark: string; border: string }
> = {
  emerald: {
    light: "bg-emerald-500/10 text-emerald-600",
    dark: "dark:bg-emerald-500/15 dark:text-emerald-400",
    border: "border-emerald-500/20 dark:border-emerald-500/30",
  },
  blue: {
    light: "bg-blue-500/10 text-blue-600",
    dark: "dark:bg-blue-500/15 dark:text-blue-400",
    border: "border-blue-500/20 dark:border-blue-500/30",
  },
  red: {
    light: "bg-red-500/10 text-red-600",
    dark: "dark:bg-red-500/15 dark:text-red-400",
    border: "border-red-500/20 dark:border-red-500/30",
  },
};

function ActionIconButton({ icon: Icon, color, label, onClick }: ActionButtonConfig) {
  const style = COLOR_STYLES[color];
  return (
    <span
      role="button"
      tabIndex={0}
      className={cn(
        "flex items-center justify-center size-8 md:size-6 rounded cursor-pointer border",
        style.light,
        style.dark,
        style.border,
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      aria-label={label}
    >
      <HugeiconsIcon icon={Icon} className="size-3.5" />
    </span>
  );
}

interface TreeActionButtonsProps {
  onAddChild?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TreeActionButtons({
  onAddChild,
  onEdit,
  onDelete,
}: TreeActionButtonsProps) {
  const buttons: ActionButtonConfig[] = [];

  if (onAddChild) {
    buttons.push({ icon: Add01Icon, color: "emerald", label: "Add Child", onClick: onAddChild });
  }
  if (onEdit) {
    buttons.push({ icon: Edit04Icon, color: "blue", label: "Edit", onClick: onEdit });
  }
  if (onDelete) {
    buttons.push({ icon: Delete02Icon, color: "red", label: "Delete", onClick: onDelete });
  }

  if (buttons.length === 0) return null;

  return (
    <span className="flex shrink-0 gap-1.5 ms-3 rounded-lg bg-muted/30 px-1.5 py-0.5 border border-border/50">
      {buttons.map((btn) => (
        <ActionIconButton key={btn.label} {...btn} />
      ))}
    </span>
  );
}
