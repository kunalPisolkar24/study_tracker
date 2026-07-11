"use client";

import { Suspense, type ReactNode } from "react";

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
      <Suspense fallback={null}>
        <AppSidebar user={user} navItems={mainNavItems} />
      </Suspense>
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Suspense fallback={null}>
          <TopNav />
        </Suspense>
        {children}
      </main>
    </SidebarProvider>
  );
}
