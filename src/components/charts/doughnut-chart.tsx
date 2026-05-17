"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface DoughnutChartProps {
  data: { name: string; value: number; color: string }[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string; percentage?: number } }>;
}) {
  if (!active || !payload || !payload[0]) return null;

  return (
    <div className="glass-card p-3 !rounded-lg text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: payload[0].payload.color }}
        />
        <span className="font-medium">{payload[0].name}</span>
      </div>
      <p className="text-[var(--muted-fg)]">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function DoughnutChart({
  data,
  centerLabel,
  centerValue,
  height = 280,
}: DoughnutChartProps) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={3}
            dataKey="value"
            animationDuration={1200}
            animationEasing="ease-out"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="text-xl font-bold">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-[var(--muted-fg)]">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
