"use client";

import { useEffect } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNodeStore } from "@/stores/node-store";

export function StoreHydrator() {
  const hydrateWorkspaces = useWorkspaceStore((s) => s.hydrate);
  const hydrateNodes = useNodeStore((s) => s.hydrate);

  useEffect(() => {
    hydrateWorkspaces();
    hydrateNodes();
  }, [hydrateWorkspaces, hydrateNodes]);

  return null;
}
