"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { LeadsPerDayPoint } from "@/types";

function formatDay(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function TrendTooltip({ active, payload }: { active?: boolean; payload?: { payload: LeadsPerDayPoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-ink">{formatDay(point.date)}</p>
      <p className="text-ink-soft">
        {point.count} lead{point.count === 1 ? "" : "s"} created
      </p>
    </div>
  );
}

export function LeadsTrendChart({ data }: { data: LeadsPerDayPoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barCategoryGap={4}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            interval={Math.ceil(data.length / 7) - 1}
            tick={{ fill: "var(--color-ink-faint)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ fill: "var(--color-paper)" }} />
          <Bar dataKey="count" fill="var(--color-accent-pastel)" radius={[3, 3, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
