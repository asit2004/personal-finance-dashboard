"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";
import { AnimatedCounter } from "./animated-counter";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  isCurrency?: boolean;
  suffix?: string;
  decimals?: number;
  trend?: number;
  trendLabel?: string;
  icon?: LucideIcon;
  glow?: "cyan" | "purple" | "pink" | "green" | "none";
  delay?: number;
  sparklineData?: number[];
}

export function StatCard({
  label,
  value,
  isCurrency = true,
  suffix,
  decimals = 0,
  trend,
  trendLabel,
  icon: Icon,
  glow = "none",
  delay = 0,
  sparklineData,
}: StatCardProps) {
  const trendColor =
    trend === undefined
      ? "text-[var(--muted-fg)]"
      : trend > 0
        ? "text-emerald-400"
        : trend < 0
          ? "text-red-400"
          : "text-[var(--muted-fg)]";

  const TrendIcon =
    trend === undefined
      ? Minus
      : trend > 0
        ? TrendingUp
        : trend < 0
          ? TrendingDown
          : Minus;

  return (
    <GlassCard glow={glow} delay={delay} className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 opacity-[0.03] gradient-mesh pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--muted-fg)] mb-2">
            {label}
          </p>
          <div className="text-2xl font-bold tracking-tight">
            <AnimatedCounter
              value={value}
              isCurrency={isCurrency}
              suffix={suffix}
              decimals={decimals}
              duration={1.2}
            />
          </div>
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trendColor)}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span>
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
              {trendLabel && (
                <span className="text-[var(--muted-fg)] ml-1">{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--accent-fg)]" />
          </div>
        )}
      </div>

      {/* Mini sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-8">
          <svg
            viewBox={`0 0 ${sparklineData.length * 10} 32`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: delay + 0.3 }}
              d={sparklineData
                .map((v, i) => {
                  const x = i * 10;
                  const max = Math.max(...sparklineData);
                  const min = Math.min(...sparklineData);
                  const range = max - min || 1;
                  const y = 30 - ((v - min) / range) * 28;
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </GlassCard>
  );
}
