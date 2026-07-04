"use client";

import { useState, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DonutChartDataEntry {
  name: string;
  value: number;
  color: string;
  label?: string;
  hoverDetail?: string;
}

interface DonutChartProps {
  title: string;
  data: DonutChartDataEntry[];
  centerLabel: string;
  centerSubtext?: string;
  innerRadius?: number;
  outerRadius?: number;
}

export function DonutChart({
  title,
  data,
  centerLabel,
  centerSubtext,
  innerRadius = 72,
  outerRadius = 100,
}: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMouseEnter = useCallback((_data: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const displayTop =
    activeIndex !== null ? data[activeIndex].label ?? data[activeIndex].name : centerLabel;
  const displayBottom =
    activeIndex !== null
      ? (data[activeIndex].hoverDetail ?? `${data[activeIndex].value} / ${total}`)
      : centerSubtext ?? `${total}`;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="relative">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={3}
                cornerRadius={3}
                dataKey="value"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tracking-tight">{displayTop}</span>
            <span className="mt-1 text-sm text-muted-foreground">{displayBottom}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-center gap-4 text-xs">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span
                className="size-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">
                {entry.label ?? entry.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
