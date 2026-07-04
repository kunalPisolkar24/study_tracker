import { TopicsDetailClient } from "@/components/topics/topic-detail-client";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  return <TopicsDetailClient topicId={topicId} />;
}
