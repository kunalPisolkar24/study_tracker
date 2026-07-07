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
    <SidebarProvider>
      <AppSidebar user={user} navItems={mainNavItems} />
      <main className="flex min-h-dvh min-w-0 w-full max-w-full flex-1 flex-col overflow-x-hidden">
        <TopNav />
        {children}
      </main>
    </SidebarProvider>
  );
}
