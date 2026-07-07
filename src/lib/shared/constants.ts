import type { ProblemStoreItem } from "@/types/topics";

export const STATUS_CYCLE: ProblemStoreItem["status"][] = [
  "TODO",
  "SOLVED",
  "ATTEMPTED",
  "MARKED_FOR_REVIEW",
];

export const STATUS_STYLES: Record<
  ProblemStoreItem["status"],
  { label: string; className: string }
> = {
  TODO: {
    label: "Todo",
    className: "border-dashed text-muted-foreground hover:bg-muted",
  },
  SOLVED: {
    label: "Solved",
    className:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20",
  },
  ATTEMPTED: {
    label: "Attempted",
    className:
      "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20",
  },
  MARKED_FOR_REVIEW: {
    label: "In Review",
    className:
      "bg-violet-500/10 text-violet-600 border-violet-500/30 hover:bg-violet-500/20 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/20",
  },
};

export const DIFFICULTY_STYLES: Record<
  ProblemStoreItem["difficulty"],
  { label: string; className: string }
> = {
  EASY: {
    label: "Easy",
    className:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  MEDIUM: {
    label: "Medium",
    className:
      "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
  },
  HARD: {
    label: "Hard",
    className:
      "bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-500/15 dark:text-red-400",
  },
};

export const LAYOUT = {
  MAX_WIDTH: "max-w-7xl",
  DETAIL_MAX_WIDTH: "max-w-4xl",
  DEBOUNCE_MS: 300,
  PAGE_SIZE: 6,
} as const;

export const CHART_COLORS = {
  EASY: "var(--chart-easy)",
  MEDIUM: "var(--chart-medium)",
  HARD: "var(--chart-hard)",
  SOLVED: "var(--chart-solved)",
  MARKED_FOR_REVIEW: "var(--chart-review)",
  GRID_STROKE: "var(--border)",
  TICK_FILL: "var(--muted-foreground)",
  RADAR_FILL: "var(--chart-4)",
  TICK_COLOR: "var(--muted-foreground)",
} as const;
