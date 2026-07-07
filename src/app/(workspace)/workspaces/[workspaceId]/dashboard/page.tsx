import { WorkspaceDashboardClient } from "@/components/workspaces/workspace-dashboard-client";

export const dynamic = "force-dynamic";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceDashboardClient workspaceId={workspaceId} />;
}
