"use client";

import { usePathname, useParams } from "next/navigation";
import { useMemo } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { mainNavItems } from "@/lib/navigation";
import { WorkspaceBreadcrumb } from "@/components/workspaces/workspace-breadcrumb";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodeStore } from "@/stores/node-store";
import { getBreadcrumb } from "@/lib/node-utils";

export function TopNav() {
  const pathname = usePathname();
  const params = useParams();
  const workspaceId = params?.workspaceId as string | undefined;
  const nodeId = params?.nodeId as string | undefined;

  const workspace = useWorkspaceStore((s) =>
    workspaceId ? s.workspaces.find((w) => w.id === workspaceId) : undefined,
  );
  const allNodes = useNodeStore((s) => s.nodes);

  const isWorkspacePage = workspaceId && pathname.startsWith("/workspaces/");

  const breadcrumb = useMemo(() => {
    if (!isWorkspacePage || !workspace) return null;
    return getBreadcrumb(workspace.name, workspaceId, allNodes, nodeId);
  }, [isWorkspacePage, workspace, workspaceId, allNodes, nodeId]);

  const currentItem = mainNavItems.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        {breadcrumb ? (
          <WorkspaceBreadcrumb items={breadcrumb} />
        ) : (
          <span className="font-medium text-foreground">
            {currentItem?.title ?? "Workspaces"}
          </span>
        )}
      </div>
    </header>
  );
}
