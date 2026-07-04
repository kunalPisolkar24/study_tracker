"use client";

import { create } from "zustand";

export type NavPage = "dashboard" | "topics";

interface UIState {
  activeNav: NavPage;
  setActiveNav: (nav: NavPage) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeNav: "dashboard",
  setActiveNav: (nav) => set({ activeNav: nav }),
}));
