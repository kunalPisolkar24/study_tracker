"use client";

import { create } from "zustand";

export type NavPage = "workspaces" | "groups";

interface UIState {
  activeNav: NavPage;
  setActiveNav: (nav: NavPage) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeNav: "workspaces",
  setActiveNav: (nav) => set({ activeNav: nav }),
}));
