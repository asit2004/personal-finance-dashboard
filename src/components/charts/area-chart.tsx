"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCompactCurrency } from "@/lib/utils";

type ChartDataPoint = Record<string, string | number>;

interface AreaChartProps {
  data: ChartDataPoint[];
  xKey: string;
  yKeys: { key: string; color: string; label: string }[];
  height?: number;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div className="glass-card p-3 !rounded-lg text-xs">
      <p className="font-medium mb-1.5 text-[var(--fg)]">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[var(--muted-fg)]">{entry.name}:</span>
          <span className="font-medium">{formatCompactCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function AreaChartComponent({
  data,
  xKey,
  yKeys,
  height = 300,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
      >
        <defs>
          {yKeys.map(({ key, color }) => (
            <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-color)"
          vertical={false}
        />
        <XAxis
          dataKey={xKey}
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
        {yKeys.map(({ key, color, label }) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            name={label}
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${key})`}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
