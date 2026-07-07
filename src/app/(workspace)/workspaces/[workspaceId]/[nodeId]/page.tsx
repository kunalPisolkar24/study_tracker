import { WorkspaceDetailClient } from "@/components/workspaces/workspace-detail-client";

export default async function WorkspaceNodeDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; nodeId: string }>;
}) {
  const { workspaceId, nodeId } = await params;
  return <WorkspaceDetailClient workspaceId={workspaceId} focusedNodeId={nodeId} />;
}
