import { WorkspaceDetailClient } from "@/components/workspaces/workspace-detail-client";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceDetailClient workspaceId={workspaceId} />;
}
