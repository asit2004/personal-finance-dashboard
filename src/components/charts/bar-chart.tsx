"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCompactCurrency } from "@/lib/utils";

interface BarChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { color: string } }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div className="glass-card p-3 !rounded-lg text-xs">
      <p className="font-medium mb-1">{label}</p>
      <p className="text-[var(--muted-fg)]">
        {formatCompactCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function BarChartComponent({ data, height = 300 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-color)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          stroke="var(--muted-fg)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-fg)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => formatCompactCurrency(v)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="value"
          radius={[6, 6, 0, 0]}
          animationDuration={1200}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
