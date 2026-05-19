"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { Sparkles, AlertTriangle, CheckCircle2, Info, Lightbulb, Loader2, RefreshCw } from "lucide-react";

interface Insight {
  _id: string;
  title: string;
  body: string;
  type: "warning" | "success" | "tip" | "info";
  impact: "high" | "medium" | "low";
  category?: string;
  actionLabel?: string;
  actionUrl?: string;
  read: boolean;
}

const insightIcons = { warning: AlertTriangle, success: CheckCircle2, info: Info, tip: Lightbulb };
const insightColors = {
  warning: { bg: "bg-amber-400/10", text: "text-amber-400", border: "border-amber-400/20" },
  success: { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/20" },
  info:    { bg: "bg-blue-400/10",    text: "text-blue-400",    border: "border-blue-400/20" },
  tip:     { bg: "bg-violet-400/10",  text: "text-violet-400",  border: "border-violet-400/20" },
};
const impactColors = {
  high:   "bg-red-400/10 text-red-400",
  medium: "bg-amber-400/10 text-amber-400",
  low:    "bg-emerald-400/10 text-emerald-400",
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function fetchInsights() {
    try {
      const res = await fetch("/api/insights");
      const json = await res.json();
      if (res.ok) setInsights(json.data ?? []);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    // Delete old insights so the API regenerates fresh ones
    await fetch("/api/insights", { method: "PATCH" });
    // Delete all and regenerate — just re-fetch which will regenerate if expired
    await fetchInsights();
  }

  useEffect(() => { fetchInsights(); }, []);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <PageHeader title="AI Insights" description="Smart recommendations based on your spending patterns" />
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)]
                     text-sm font-medium hover:bg-[var(--surface-elevated)] transition-colors mt-1
                     disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      <GlassCard delay={0.1} glow="purple" className="mb-6 !p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Financial Insights</h2>
            <p className="text-xs text-[var(--muted-fg)]">
              {isLoading
                ? "Analysing your data…"
                : `${insights.length} insight${insights.length !== 1 ? "s" : ""} based on your real spending patterns`}
            </p>
          </div>
        </div>
      </GlassCard>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 gap-2 text-sm text-[var(--muted-fg)]">
          <Loader2 className="w-4 h-4 animate-spin" /> Generating insights from your data…
        </div>
      ) : insights.length === 0 ? (
        <GlassCard delay={0.2}>
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">🤔</p>
            <p className="text-sm font-medium mb-1">No insights yet</p>
            <p className="text-xs text-[var(--muted-fg)]">
              Add transactions to start getting personalised financial insights.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, i) => {
            const Icon = insightIcons[insight.type];
            const colors = insightColors[insight.type];
            return (
              <motion.div
                key={insight._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
              >
                <GlassCard hoverable className={cn("!p-5 border", colors.border, !insight.read && "ring-1 ring-[var(--primary)]/20")}>
                  <div className="flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", colors.bg)}>
                      <Icon className={cn("w-4 h-4", colors.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold">{insight.title}</h3>
                        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full capitalize", impactColors[insight.impact])}>
                          {insight.impact} impact
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-fg)] leading-relaxed mb-2">{insight.body}</p>
                      {insight.actionLabel && insight.actionUrl && (
                        <a
                          href={insight.actionUrl}
                          className="text-xs font-medium text-[var(--accent-fg)] hover:underline"
                        >
                          {insight.actionLabel} →
                        </a>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
