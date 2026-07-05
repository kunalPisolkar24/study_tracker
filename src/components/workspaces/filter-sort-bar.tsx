"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NodeFilterState } from "@/types/node";

interface FilterSortBarProps {
  filter: NodeFilterState;
  onChange: (filter: NodeFilterState) => void;
  totalLeaves: number;
  visibleLeaves: number;
}

export function FilterSortBar({ filter, onChange, totalLeaves, visibleLeaves }: FilterSortBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filter.status}
          onValueChange={(value) => onChange({ ...filter, status: value as NodeFilterState["status"] })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.confidence}
          onValueChange={(value) => onChange({ ...filter, confidence: value as NodeFilterState["confidence"] })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Confidence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Confidence</SelectItem>
            <SelectItem value="weak">Weak</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
            <SelectItem value="strong">Strong</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.sort}
          onValueChange={(value) => onChange({ ...filter, sort: value as NodeFilterState["sort"] })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order">Manual Order</SelectItem>
            <SelectItem value="alpha">Alphabetical</SelectItem>
            <SelectItem value="reviewed">Recently Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground whitespace-nowrap">
        {visibleLeaves} / {totalLeaves} leaves
      </p>
    </div>
  );
}
