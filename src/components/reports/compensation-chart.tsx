"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatLakhs } from "@/lib/format/money";

export function CompensationChart({
  data,
}: {
  data: { month: string; net: number }[];
}) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--pp-border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--pp-text-secondary)" }} />
          <YAxis hide />
          <Tooltip
            formatter={(value) =>
              typeof value === "number" ? formatLakhs(value) : String(value)
            }
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--pp-border)",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="net"
            name="Net salary"
            stroke="var(--pp-primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--pp-primary)", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
