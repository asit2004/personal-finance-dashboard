"use client";

import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { DoughnutChart } from "@/components/charts/doughnut-chart";
import { mockMonthlyData, mockCategoryBreakdown } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3, Target } from "lucide-react";

export default function AnalyticsPage() {
  const avgIncome = mockMonthlyData.reduce((s, d) => s + d.income, 0) / mockMonthlyData.length;
  const avgExpenses = mockMonthlyData.reduce((s, d) => s + d.expenses, 0) / mockMonthlyData.length;
  const avgSavings = mockMonthlyData.reduce((s, d) => s + d.savings, 0) / mockMonthlyData.length;
  const savingsRate = Math.round((avgSavings / avgIncome) * 100);

  return (
    <div>
      <PageHeader title="Analytics" description="Deep dive into your financial trends" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GlassCard delay={0.05} className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-[var(--muted-fg)]">Avg Income</p>
          </div>
          <p className="text-lg font-bold">{formatCurrency(avgIncome)}</p>
        </GlassCard>
        <GlassCard delay={0.1} className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <p className="text-xs text-[var(--muted-fg)]">Avg Expenses</p>
          </div>
          <p className="text-lg font-bold">{formatCurrency(avgExpenses)}</p>
        </GlassCard>
        <GlassCard delay={0.15} className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[var(--accent-fg)]" />
            <p className="text-xs text-[var(--muted-fg)]">Avg Savings</p>
          </div>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(avgSavings)}</p>
        </GlassCard>
        <GlassCard delay={0.2} className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-violet-400" />
            <p className="text-xs text-[var(--muted-fg)]">Savings Rate</p>
          </div>
          <p className="text-lg font-bold">{savingsRate}%</p>
        </GlassCard>
      </div>

      <GlassCard delay={0.25} className="mb-6">
        <h2 className="text-base font-semibold mb-1">Income vs Expenses</h2>
        <p className="text-xs text-[var(--muted-fg)] mb-4">6-month trend</p>
        <AreaChartComponent
          data={mockMonthlyData}
          xKey="month"
          yKeys={[
            { key: "income", color: "#818cf8", label: "Income" },
            { key: "expenses", color: "#f472b6", label: "Expenses" },
            { key: "savings", color: "#34d399", label: "Savings" },
          ]}
          height={300}
        />
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard delay={0.3}>
          <h2 className="text-base font-semibold mb-4">Spending by Category</h2>
          <BarChartComponent
            data={mockCategoryBreakdown.map((c) => ({ name: c.category, value: c.amount, color: c.color }))}
            height={280}
          />
        </GlassCard>
        <GlassCard delay={0.35}>
          <h2 className="text-base font-semibold mb-4">Expense Distribution</h2>
          <DoughnutChart
            data={mockCategoryBreakdown.map((c) => ({ name: c.category, value: c.amount, color: c.color }))}
            centerValue={`${savingsRate}%`}
            centerLabel="Savings Rate"
            height={240}
          />
          <div className="space-y-2 mt-4">
            {mockCategoryBreakdown.slice(0, 5).map((cat, i) => (
              <div key={cat.category} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="flex-1 text-sm">{cat.category}</span>
                <span className="text-sm font-medium font-mono">{formatCurrency(cat.amount)}</span>
                <span className="text-xs text-[var(--muted-fg)]">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
