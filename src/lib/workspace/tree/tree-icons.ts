import type { NodeStatus, NodeConfidence } from "@/types/node";
import {
  Tick02Icon,
  HourglassIcon,
  Archive04Icon,
  FullSignalIcon,
  MediumSignalIcon,
  LowSignalIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

const STATUS_ICONS: Record<string, IconSvgElement> = {
  done: Tick02Icon as unknown as IconSvgElement,
  in_progress: HourglassIcon as unknown as IconSvgElement,
  not_started: Archive04Icon as unknown as IconSvgElement,
};

const STATUS_CLASSES: Record<string, string> = {
  done: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  in_progress:
    "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  not_started: "bg-muted-foreground/10 text-muted-foreground",
};

const CONFIDENCE_ICONS: Record<string, IconSvgElement> = {
  strong: FullSignalIcon as unknown as IconSvgElement,
  ok: MediumSignalIcon as unknown as IconSvgElement,
  weak: LowSignalIcon as unknown as IconSvgElement,
};

const CONFIDENCE_CLASSES: Record<string, string> = {
  strong:
    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  ok: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  weak: "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
};

export function getStatusIcon(status: NodeStatus): IconSvgElement | undefined {
  return STATUS_ICONS[status];
}

export function getStatusLabel(status: NodeStatus): string {
  if (status === "not_started") return "Not Started";
  if (status === "in_progress") return "In Progress";
  return "Done";
}

export function getStatusClass(status: NodeStatus | null): string {
  if (!status) return "bg-muted-foreground/10 text-muted-foreground";
  return STATUS_CLASSES[status] ?? "bg-muted-foreground/10 text-muted-foreground";
}

export function getConfidenceIcon(
  confidence: NodeConfidence,
): IconSvgElement | undefined {
  return CONFIDENCE_ICONS[confidence];
}

export function getConfidenceLabel(confidence: NodeConfidence): string {
  return confidence.charAt(0).toUpperCase() + confidence.slice(1);
}

export function getConfidenceClass(
  confidence: NodeConfidence | null,
): string {
  if (!confidence) return "bg-muted/50 text-muted-foreground/60";
  return CONFIDENCE_CLASSES[confidence] ?? "bg-muted/50 text-muted-foreground/60";
}
