"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronRightIcon } from "@hugeicons/core-free-icons";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BreadcrumbItem } from "@/types/node";
import { cn } from "@/lib/utils";

interface WorkspaceBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function WorkspaceBreadcrumb({ items }: WorkspaceBreadcrumbProps) {
  const isMobile = useIsMobile();

  const maxVisible = isMobile ? 3 : 5;
  const needsTruncation = items.length > maxVisible;

  function renderVisibleItems(): BreadcrumbItem[] {
    if (!needsTruncation) return items;
    const first = items[0];
    const last = items[items.length - 1];
    const second = items[1];
    const secondLast = items[items.length - 2];

    if (isMobile) {
      return [first, second, { id: "ellipsis", title: "...", href: "#" }, secondLast, last];
    }
    const third = items[2];
    const thirdLast = items[items.length - 3];
    return [first, second, third, { id: "ellipsis", title: "...", href: "#" }, thirdLast, secondLast, last];
  }

  const visible = renderVisibleItems();

  return (
    <nav className="flex min-w-0 items-center gap-1 text-sm">
      {visible.map((item, idx) => {
        const isLast = idx === visible.length - 1;
        const isEllipsis = item.id === "ellipsis";
        return (
          <span key={item.id} className="flex min-w-0 items-center gap-1">
            {idx > 0 && (
              <HugeiconsIcon icon={ChevronRightIcon} className="size-3 shrink-0 text-muted-foreground" />
            )}
            {isLast || isEllipsis ? (
              <span
                className={cn(
                  "truncate",
                  isEllipsis ? "text-muted-foreground" : "font-medium text-foreground",
                )}
              >
                {item.title}
              </span>
            ) : (
              <Link
                href={item.href}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.title}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
