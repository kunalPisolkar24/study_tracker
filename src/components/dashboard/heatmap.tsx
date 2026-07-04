"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toDateStr } from "@/lib/date-utils";
import type { HeatmapEntry } from "@/lib/dashboard-data";

interface HeatmapProps {
  data: HeatmapEntry[];
  streak: number;
  maxStreak: number;
}

const LEVELS = [
  { threshold: 0, className: "bg-muted" },
  { threshold: 1, className: "bg-chart-2/25" },
  { threshold: 2, className: "bg-chart-2/50" },
  { threshold: 3, className: "bg-chart-2/75" },
  { threshold: 4, className: "bg-chart-2" },
] as const;

const CELL_SIZE = "clamp(14px, 2vw, 18px)";

function getLevel(count: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (count >= LEVELS[i].threshold) return LEVELS[i];
  }
  return LEVELS[0];
}

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

export function Heatmap({ data, streak, maxStreak }: HeatmapProps) {
  const years = useMemo(() => {
    const set = new Set<number>();
    data.forEach((d) => set.add(new Date(d.date).getFullYear()));
    return Array.from(set).sort();
  }, [data]);

  const [selectedYear, setSelectedYear] = useState<string>(
    String(Math.max(...years))
  );

  const { grid, monthLabels } = useMemo(() => {
    const year = Number(selectedYear);
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    const dayMap = new Map<string, number>();
    data.forEach((d) => {
      const date = new Date(d.date + "T00:00:00");
      if (date.getFullYear() === year) dayMap.set(d.date, d.count);
    });

    const startDow = (start.getDay() + 6) % 7;

    const cells: { date: string; count: number; level: string }[] = [];
    const current = new Date(start);
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;

    let dayIndex = 0;
    while (current <= end) {
      const dateStr = toDateStr(current);
      const count = dayMap.get(dateStr) ?? 0;
      const level = getLevel(count);
      cells.push({ date: dateStr, count, level: level.className });

      if (current.getMonth() !== lastMonth) {
        labels.push({
          label: current.toLocaleString("default", { month: "short" }),
          col: Math.floor((dayIndex + startDow) / 7),
        });
        lastMonth = current.getMonth();
      }

      current.setDate(current.getDate() + 1);
      dayIndex++;
    }

    const paddedCells: ({ date: string; count: number; level: string } | null)[] = [
      ...Array(startDow).fill(null),
      ...cells,
    ];

    return { grid: paddedCells, monthLabels: labels };
  }, [data, selectedYear]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Solved in {selectedYear}</CardTitle>
          <CardDescription>Problems solved per day</CardDescription>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-1">
              <div className="flex flex-col gap-[3px] pt-5 pr-1">
                {DAY_LABELS.map((label, i) => (
                  <div key={i} className="text-[10px] text-muted-foreground" style={{ height: CELL_SIZE, lineHeight: CELL_SIZE }}>
                    {label}
                  </div>
                ))}
              </div>
            <div className="flex-1">
              <div className="relative text-[10px] text-muted-foreground mb-1" style={{ height: CELL_SIZE }}>
                {monthLabels.map((m, i) => (
                  <span
                    key={i}
                    className="absolute"
                    style={{ left: `calc(${m.col} * (${CELL_SIZE} + 3px))` }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
              <div
                className="grid gap-[3px]"
                style={{
                  gridTemplateColumns: `repeat(${Math.ceil(grid.length / 7)}, ${CELL_SIZE})`,
                  gridTemplateRows: `repeat(7, ${CELL_SIZE})`,
                  gridAutoFlow: "column",
                }}
              >
                {grid.map((cell, i) =>
                  cell ? (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div
                          suppressHydrationWarning
                          className={`rounded-sm ${cell.level} cursor-default`}
                          style={{ width: CELL_SIZE, height: CELL_SIZE }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {cell.count} {cell.count === 1 ? "problem" : "problems"} solved on{" "}
                        {new Date(cell.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={i} style={{ width: CELL_SIZE, height: CELL_SIZE }} />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-foreground">
              <span className="leading-none">🔥</span>
              <span className="font-medium">{streak}</span>
              <span className="text-muted-foreground">day streak</span>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-foreground">
              <span className="leading-none">🏆</span>
              <span className="font-medium">{maxStreak}</span>
              <span className="text-muted-foreground">max</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Less</span>
            {LEVELS.map((level, i) => (
              <div
                key={i}
                className={`size-3 rounded-sm ${level.className}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
