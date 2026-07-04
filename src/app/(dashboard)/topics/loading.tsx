import { TopicCardSkeleton } from "@/components/topics/topic-skeleton";

export default function TopicsLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading topics...</span>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <TopicCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
