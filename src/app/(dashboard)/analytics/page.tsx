"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { DoughnutChart } from "@/components/charts/doughnut-chart";
import { categoryColors } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3, Target, Loader2 } from "lucide-react";

interface Stats {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  byCategory: { _id: string; total: number; count: number }[];
  monthly: { month: string; income: number; expenses: number; savings: number }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transactions/stats?months=6")
      .then((r) => r.json())
      .then((json) => { if (json.data) setStats(json.data); })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Analytics" description="Deep dive into your financial trends" />
        <div className="flex items-center justify-center py-32 gap-2 text-sm text-[var(--muted-fg)]">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading analytics…
        </div>
      </div>
    );
  }

  const monthlyData = stats?.monthly ?? [];
  const categoryData = (stats?.byCategory ?? []).map((c) => ({
    name: c._id,
    value: c.total,
    color: categoryColors[c._id] ?? "#94a3b8",
  }));

  const avgIncome = monthlyData.length
    ? monthlyData.reduce((s, d) => s + d.income, 0) / monthlyData.length
    : 0;
  const avgExpenses = monthlyData.length
    ? monthlyData.reduce((s, d) => s + d.expenses, 0) / monthlyData.length
    : 0;
  const avgSavings = avgIncome - avgExpenses;
  const savingsRate = avgIncome > 0 ? Math.round((avgSavings / avgIncome) * 100) : 0;
  const totalCategorySpend = categoryData.reduce((s, c) => s + c.value, 0);

  const hasData = monthlyData.length > 0 || categoryData.length > 0;

  return (
    <div>
      <PageHeader title="Analytics" description="Deep dive into your financial trends" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GlassCard delay={0.05} className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-[var(--muted-fg)]">Avg Monthly Income</p>
          </div>
          <p className="text-lg font-bold">{formatCurrency(avgIncome)}</p>
        </GlassCard>
        <GlassCard delay={0.1} className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <p className="text-xs text-[var(--muted-fg)]">Avg Monthly Expenses</p>
          </div>
          <p className="text-lg font-bold">{formatCurrency(avgExpenses)}</p>
        </GlassCard>
        <GlassCard delay={0.15} className="!p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <p className="text-xs text-[var(--muted-fg)]">Avg Monthly Savings</p>
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

      {!hasData ? (
        <GlassCard delay={0.25}>
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm font-medium mb-1">No data yet</p>
            <p className="text-xs text-[var(--muted-fg)]">
              Add transactions to see your analytics here.
            </p>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Income vs Expenses trend */}
          <GlassCard delay={0.25} className="mb-6">
            <h2 className="text-base font-semibold mb-1">Income vs Expenses</h2>
            <p className="text-xs text-[var(--muted-fg)] mb-4">6-month trend</p>
            {monthlyData.length > 0 ? (
              <AreaChartComponent
                data={monthlyData}
                xKey="month"
                yKeys={[
                  { key: "income", color: "#818cf8", label: "Income" },
                  { key: "expenses", color: "#f472b6", label: "Expenses" },
                  { key: "savings", color: "#34d399", label: "Savings" },
                ]}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-[var(--muted-fg)]">
                Not enough data for a trend yet.
              </div>
            )}
          </GlassCard>

          {/* Category breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard delay={0.3}>
              <h2 className="text-base font-semibold mb-4">Spending by Category</h2>
              {categoryData.length > 0 ? (
                <BarChartComponent
                  data={categoryData.map((c) => ({
                    name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
                    value: c.value,
                    color: c.color,
                  }))}
                  height={280}
                />
              ) : (
                <div className="h-[280px] flex items-center justify-center text-sm text-[var(--muted-fg)]">
                  No expense data yet.
                </div>
              )}
            </GlassCard>

            <GlassCard delay={0.35}>
              <h2 className="text-base font-semibold mb-4">Expense Distribution</h2>
              {categoryData.length > 0 ? (
                <>
                  <DoughnutChart
                    data={categoryData}
                    centerValue={`${savingsRate}%`}
                    centerLabel="Savings Rate"
                    height={220}
                  />
                  <div className="space-y-2 mt-4">
                    {categoryData.slice(0, 5).map((cat) => (
                      <div key={cat.name} className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="flex-1 text-sm capitalize">{cat.name}</span>
                        <span className="text-sm font-medium font-mono">{formatCurrency(cat.value)}</span>
                        <span className="text-xs text-[var(--muted-fg)]">
                          {totalCategorySpend > 0 ? Math.round((cat.value / totalCategorySpend) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-[var(--muted-fg)]">
                  No expense data yet.
                </div>
              )}
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
