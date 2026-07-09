"use client";

import type { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { mainNavItems } from "@/lib/shared/navigation";

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
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar user={user} navItems={mainNavItems} />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TopNav />
        {children}
      </main>
    </SidebarProvider>
  );
}
