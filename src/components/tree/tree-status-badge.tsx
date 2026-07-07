"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/shared/utils";
import {
  getStatusIcon,
  getStatusLabel,
  getStatusClass,
} from "@/lib/workspace/tree/tree-icons";
import type { NodeStatus } from "@/types/node";

interface TreeStatusBadgeProps {
  status: NodeStatus;
}

export function TreeStatusBadge({ status }: TreeStatusBadgeProps) {
  const Icon = getStatusIcon(status);
  if (!Icon) return null;

  return (
    <span
      className={cn(
        "group inline-flex items-center h-6 rounded transition-all duration-200 gap-1 overflow-hidden cursor-default",
        "max-w-[24px] hover:max-w-[160px] hover:pr-1.5",
        getStatusClass(status),
      )}
      aria-label={getStatusLabel(status)}
    >
      <span className="flex size-6 shrink-0 items-center justify-center">
        <HugeiconsIcon
          icon={Icon}
          className="size-3.5"
          {...(status === "in_progress" ? { strokeWidth: 2 as const } : {})}
        />
      </span>
      <span className="text-xs whitespace-nowrap font-medium">
        {getStatusLabel(status)}
      </span>
    </span>
  );
}
