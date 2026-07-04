"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";

interface TopicSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TopicSearch({ value, onChange }: TopicSearchProps) {
  return (
    <div className="relative">
      <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search topics..."
        className="pl-8 pr-8"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
        </button>
      )}
    </div>
  );
}
