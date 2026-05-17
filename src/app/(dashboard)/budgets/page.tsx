"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { mockBudgets, categoryIcons } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";

export default function BudgetsPage() {
  const totalBudget = mockBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = mockBudgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div>
      <PageHeader
        title="Budgets"
        description="Track your spending limits and stay on budget"
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GlassCard delay={0.05} className="!p-4">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Total Budget</p>
          <p className="text-xl font-bold">{formatCurrency(totalBudget)}</p>
        </GlassCard>
        <GlassCard delay={0.1} className="!p-4">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Total Spent</p>
          <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPercentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={cn(
                "h-full rounded-full",
                overallPercentage > 90
                  ? "bg-red-400"
                  : overallPercentage > 70
                    ? "bg-amber-400"
                    : "bg-emerald-400"
              )}
            />
          </div>
        </GlassCard>
        <GlassCard delay={0.15} className="!p-4">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Remaining</p>
          <p className={cn("text-xl font-bold", totalRemaining >= 0 ? "text-emerald-400" : "text-red-400")}>
            {formatCurrency(totalRemaining)}
          </p>
        </GlassCard>
      </div>

      {/* Budget overview chart */}
      <GlassCard delay={0.2} className="mb-6">
        <h2 className="text-base font-semibold mb-4">Budget Overview</h2>
        <BarChartComponent
          data={mockBudgets.map((b) => ({
            name: b.name.length > 10 ? b.name.slice(0, 10) + "…" : b.name,
            value: b.spent,
            color: b.color,
          }))}
          height={250}
        />
      </GlassCard>

      {/* Budget Cards Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {mockBudgets.map((budget) => {
          const percentage = Math.round((budget.spent / budget.limit) * 100);
          const isOver = percentage > 100;
          const isWarning = percentage > 80 && percentage <= 100;

          return (
            <motion.div key={budget.id} variants={fadeUp}>
              <GlassCard
                hoverable
                className={cn(
                  "!p-5 relative overflow-hidden",
                  isOver && "border-red-500/20"
                )}
              >
                {/* Category icon & name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: budget.color + "15" }}
                  >
                    {categoryIcons[budget.category]}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{budget.name}</h3>
                    <p className="text-[10px] text-[var(--muted-fg)] uppercase tracking-wide">
                      {isOver ? "Over budget" : isWarning ? "Almost there" : "On track"}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold font-mono tabular-nums">
                      {formatCurrency(budget.spent)}
                    </p>
                    <p className="text-xs text-[var(--muted-fg)]">
                      of {formatCurrency(budget.limit)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      isOver
                        ? "bg-red-400/10 text-red-400"
                        : isWarning
                          ? "bg-amber-400/10 text-amber-400"
                          : "bg-emerald-400/10 text-emerald-400"
                    )}
                  >
                    {percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full rounded-full transition-colors"
                    style={{
                      backgroundColor: isOver
                        ? "#f87171"
                        : isWarning
                          ? "#fbbf24"
                          : budget.color,
                    }}
                  />
                </div>

                {/* Remaining */}
                <p className="text-xs text-[var(--muted-fg)] mt-2">
                  {isOver
                    ? `${formatCurrency(budget.spent - budget.limit)} over`
                    : `${formatCurrency(budget.limit - budget.spent)} remaining`}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
