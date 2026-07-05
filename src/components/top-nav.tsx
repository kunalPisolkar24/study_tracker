"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { mainNavItems } from "@/lib/navigation";

export function TopNav() {
  const pathname = usePathname();

  const currentItem = mainNavItems.find((item) => item.href === pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {currentItem?.title ?? "Workspaces"}
        </span>
      </nav>
    </header>
  );
}
