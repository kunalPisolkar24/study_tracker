import { useUIStore } from "@/stores/ui-store";

export function useActiveNav() {
  return useUIStore((s) => s.activeNav);
}

export function useSetActiveNav() {
  return useUIStore((s) => s.setActiveNav);
}
