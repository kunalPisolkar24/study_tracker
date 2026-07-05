import { GroupDetailClient } from "@/components/workspaces/group-detail-client";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  return <GroupDetailClient groupId={groupId} />;
}
