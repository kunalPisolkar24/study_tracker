"use client";

import { Progress } from "@/components/ui/progress";

interface TreeProgressBarProps {
  percent: number;
}

export function TreeProgressBar({ percent }: TreeProgressBarProps) {
  return (
    <span className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap ms-auto me-2">
      <span>{percent}%</span>
      <span className="hidden w-16 sm:block">
        <Progress value={percent} className="h-1.5" />
      </span>
    </span>
  );
}
