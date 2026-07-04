"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import { mainNavItems } from "@/lib/navigation";
import { useTopicStore } from "@/stores/topic-store";

export function TopNav() {
  const pathname = usePathname();

  const topics = useTopicStore((s) => s.topics);
  const topicDetailMatch = pathname.match(/^\/topics\/([^/]+)$/);
  const topicId = topicDetailMatch?.[1];
  const topic = topicId ? topics.find((t) => t.id === topicId) : null;

  const currentItem = mainNavItems.find((item) => item.href === pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        {topicDetailMatch ? (
          <>
            <Link
              href="/topics"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Topics
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-foreground">
              {topic?.name ?? "Topic"}
            </span>
          </>
        ) : (
          <span className="font-medium text-foreground">
            {currentItem?.title ?? "Dashboard"}
          </span>
        )}
      </nav>
    </header>
  );
}
