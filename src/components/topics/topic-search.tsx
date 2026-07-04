"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface TopicSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TopicSearch({ value, onChange }: TopicSearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
