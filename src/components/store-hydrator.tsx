"use client";

import { useEffect } from "react";
import { useTopicStore } from "@/stores/topic-store";

export function StoreHydrator() {
  const hydrate = useTopicStore((s) => s.hydrate);
  const hydrated = useTopicStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  return null;
}
