"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { Sparkles, AlertTriangle, CheckCircle2, Info, Lightbulb, Loader2, RefreshCw, Brain } from "lucide-react";

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
  source?: "rule" | "ai";
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
  const [insights, setInsights]       = useState<Insight[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError]         = useState<string | null>(null);
  const [aiSuccess, setAiSuccess]     = useState(false);

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
    setAiSuccess(false);
    await fetch("/api/insights", { method: "PATCH" });
    await fetchInsights();
  }

  async function handleAIInsights() {
    setIsAILoading(true);
    setAiError(null);
    setAiSuccess(false);
    try {
      const res  = await fetch("/api/ai/insights", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setAiError(json.error ?? "AI insights failed. Make sure OPENROUTER_API_KEY is set.");
        return;
      }
      setAiSuccess(true);
      // Refresh the insights list to include the new AI ones
      await fetchInsights();
    } catch {
      setAiError("Network error — please try again.");
    } finally {
      setIsAILoading(false);
    }
  }

  useEffect(() => { fetchInsights(); }, []);

  const aiInsights   = insights.filter((i) => i.source === "ai");
  const ruleInsights = insights.filter((i) => i.source !== "ai");

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
        <PageHeader title="AI Insights" description="Smart recommendations based on your spending patterns" />
        <div className="flex items-center gap-2 mt-1 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isAILoading}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--border-color)]
                       text-sm font-medium hover:bg-[var(--surface-elevated)] transition-colors
                       disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleAIInsights}
            disabled={isAILoading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white
                       text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isAILoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
              : <><Brain className="w-4 h-4" /> Ask AI</>}
          </button>
        </div>
      </div>

      {/* AI status messages */}
      <AnimatePresence>
        {aiError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20
                       text-sm text-red-400"
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{aiError}</span>
          </motion.div>
        )}
        {aiSuccess && !aiError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                       text-sm text-emerald-400"
          >
            <Sparkles className="w-4 h-4" />
            AI analysed your last 3 months and generated fresh insights!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header card */}
      <GlassCard delay={0.1} glow="purple" className="mb-6 !p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold">Financial Insights</h2>
            <p className="text-xs text-[var(--muted-fg)]">
              {isLoading
                ? "Analysing your data…"
                : `${insights.length} insight${insights.length !== 1 ? "s" : ""} · ${aiInsights.length} AI-generated · ${ruleInsights.length} rule-based`}
            </p>
          </div>
          {isAILoading && (
            <div className="flex items-center gap-2 text-xs text-[var(--primary)]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">AI thinking…</span>
            </div>
          )}
        </div>
      </GlassCard>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 gap-2 text-sm text-[var(--muted-fg)]">
          <Loader2 className="w-4 h-4 animate-spin" /> Generating insights from your data…
        </div>
      ) : insights.length === 0 ? (
        <GlassCard delay={0.2}>
          <div className="py-16 text-center px-6">
            <p className="text-4xl mb-3">🤔</p>
            <p className="text-sm font-medium mb-1">No insights yet</p>
            <p className="text-xs text-[var(--muted-fg)] mb-4">
              Add some transactions, then click <strong>Ask AI</strong> to get personalised financial insights powered by AI.
            </p>
            <button
              onClick={handleAIInsights}
              disabled={isAILoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white
                         text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Brain className="w-4 h-4" /> Generate AI Insights
            </button>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {/* AI-generated insights (shown first if present) */}
          {aiInsights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-3.5 h-3.5 text-[var(--primary)]" />
                <h3 className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">AI-Generated</h3>
                <div className="flex-1 h-px bg-[var(--primary)]/20" />
                <span className="text-[10px] text-[var(--muted-fg)]">refreshes every 24h</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiInsights.map((insight, i) => (
                  <InsightCard key={insight._id} insight={insight} index={i} isAI />
                ))}
              </div>
            </div>
          )}

          {/* Rule-based insights */}
          {ruleInsights.length > 0 && (
            <div>
              {aiInsights.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--muted-fg)]" />
                  <h3 className="text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider">Rule-Based</h3>
                  <div className="flex-1 h-px bg-[var(--border-color)]" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ruleInsights.map((insight, i) => (
                  <InsightCard key={insight._id} insight={insight} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Insight Card component ─────────────────────────────────────────────────────

function InsightCard({ insight, index, isAI = false }: { insight: Insight; index: number; isAI?: boolean }) {
  const Icon   = insightIcons[insight.type];
  const colors = insightColors[insight.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06 }}
    >
      <GlassCard hoverable className={cn(
        "!p-5 border",
        colors.border,
        !insight.read && "ring-1 ring-[var(--primary)]/20",
        isAI && "ring-1 ring-[var(--primary)]/30",
      )}>
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
              {isAI && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center gap-0.5">
                  <Brain className="w-2.5 h-2.5" /> AI
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted-fg)] leading-relaxed mb-2">{insight.body}</p>
            {insight.actionLabel && insight.actionUrl && (
              <a href={insight.actionUrl} className="text-xs font-medium text-[var(--accent-fg)] hover:underline">
                {insight.actionLabel} →
              </a>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
