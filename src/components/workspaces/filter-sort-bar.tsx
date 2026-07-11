"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/shared/utils";
import type { NodeFilterState } from "@/types/node";

interface FilterSortBarProps {
  filter: NodeFilterState;
  onChange: (filter: NodeFilterState) => void;
  compact?: boolean;
}

export function FilterSortBar({ filter, onChange, compact }: FilterSortBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(buttonVariants({ variant: "outline", size: compact ? "xs" : "sm" }), "gap-1.5")}>
              <HugeiconsIcon icon={FilterIcon} className="size-4" />
              <span className={compact ? "sr-only" : undefined}>Filter</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={filter.status}
              onValueChange={(value) => onChange({ ...filter, status: value as NodeFilterState["status"] })}
            >
              <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="not_started">Not Started</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="in_progress">In Progress</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="done">Done</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Confidence</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={filter.confidence}
              onValueChange={(value) => onChange({ ...filter, confidence: value as NodeFilterState["confidence"] })}
            >
              <DropdownMenuRadioItem value="all">All Confidence</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="weak">Weak</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ok">OK</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="strong">Strong</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
