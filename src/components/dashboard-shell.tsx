"use client";

import type { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { StoreHydrator } from "@/components/store-hydrator";
import { mainNavItems } from "@/lib/navigation";

interface DashboardShellProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <StoreHydrator />
      <AppSidebar user={user} navItems={mainNavItems} />
      <main className="flex min-h-dvh min-w-0 w-full flex-1 flex-col">
        <TopNav />
        {children}
      </main>
    </SidebarProvider>
  );
}
