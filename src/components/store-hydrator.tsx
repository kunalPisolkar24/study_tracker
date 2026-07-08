"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodeStore } from "@/stores/node-store";

interface StoreHydratorProps {
  userId: string;
}

export function StoreHydrator({ userId }: StoreHydratorProps) {
  const hydrateWorkspaces = useWorkspaceStore((s) => s.hydrate);
  const hydrateNodes = useNodeStore((s) => s.hydrate);

  useEffect(() => {
    hydrateWorkspaces(userId);
    hydrateNodes(userId);
  }, [userId, hydrateWorkspaces, hydrateNodes]);

  return null;
}
