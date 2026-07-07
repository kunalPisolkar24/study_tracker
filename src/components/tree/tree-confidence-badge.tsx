"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/shared/utils";
import {
  getConfidenceIcon,
  getConfidenceLabel,
  getConfidenceClass,
} from "@/lib/workspace/tree/tree-icons";
import type { NodeConfidence } from "@/types/node";

interface TreeConfidenceBadgeProps {
  confidence: NodeConfidence;
}

export function TreeConfidenceBadge({ confidence }: TreeConfidenceBadgeProps) {
  const Icon = getConfidenceIcon(confidence);
  if (!Icon) return null;

  return (
    <span
      className={cn(
        "group inline-flex items-center h-6 rounded transition-all duration-200 gap-1 overflow-hidden cursor-default",
        "max-w-[24px] hover:max-w-[160px] hover:pr-1.5",
        getConfidenceClass(confidence),
      )}
      aria-label={getConfidenceLabel(confidence)}
    >
      <span className="flex size-6 shrink-0 items-center justify-center">
        <HugeiconsIcon icon={Icon} className="size-3.5" />
      </span>
      <span className="text-xs whitespace-nowrap font-medium">
        {getConfidenceLabel(confidence)}
      </span>
    </span>
  );
}
