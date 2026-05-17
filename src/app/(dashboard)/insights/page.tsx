"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { mockAIInsights } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Sparkles, AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react";

const insightIcons = { warning: AlertTriangle, success: CheckCircle2, info: Info, tip: Lightbulb };
const insightColors = {
  warning: { bg: "bg-amber-400/10", text: "text-amber-400", border: "border-amber-400/20" },
  success: { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/20" },
  info: { bg: "bg-blue-400/10", text: "text-blue-400", border: "border-blue-400/20" },
  tip: { bg: "bg-violet-400/10", text: "text-violet-400", border: "border-violet-400/20" },
};
const impactLabels = { high: "High Impact", medium: "Medium Impact", low: "Low Impact" };
const impactColors = { high: "bg-red-400/10 text-red-400", medium: "bg-amber-400/10 text-amber-400", low: "bg-emerald-400/10 text-emerald-400" };

export default function InsightsPage() {
  return (
    <div>
      <PageHeader title="AI Insights" description="Smart recommendations powered by AI" />

      <GlassCard delay={0.1} glow="purple" className="mb-6 !p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">AI Financial Advisor</h2>
            <p className="text-xs text-[var(--muted-fg)]">
              {mockAIInsights.length} insights generated based on your spending patterns
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAIInsights.map((insight, i) => {
          const Icon = insightIcons[insight.type];
          const colors = insightColors[insight.type];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <GlassCard hoverable className={cn("!p-5 border", colors.border)}>
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", colors.bg)}>
                    <Icon className={cn("w-4 h-4", colors.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold">{insight.title}</h3>
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", impactColors[insight.impact])}>
                        {impactLabels[insight.impact]}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-fg)] leading-relaxed mb-2">{insight.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-wide text-[var(--muted-fg)]">{insight.category}</span>
                      {insight.actionLabel && (
                        <button className="text-xs font-medium text-[var(--accent-fg)] hover:underline">
                          {insight.actionLabel} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
