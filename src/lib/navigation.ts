import { Folders, LayoutGrid } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export interface NavItem {
  title: string;
  href: string;
  icon: IconSvgElement;
}

export const mainNavItems: NavItem[] = [
  {
    title: "Workspaces",
    href: "/workspaces",
    icon: LayoutGrid,
  },
  {
    title: "Groups",
    href: "/groups",
    icon: Folders,
  },
];
