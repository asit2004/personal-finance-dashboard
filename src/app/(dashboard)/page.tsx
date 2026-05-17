"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { StatCard } from "@/components/ui/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { DoughnutChart } from "@/components/charts/doughnut-chart";
import {
  mockTransactions,
  mockMonthlyData,
  mockCategoryBreakdown,
  mockAIInsights,
  categoryIcons,
} from "@/lib/mock-data";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { staggerContainer, fadeUp } from "@/lib/animations";

// Dynamic import for 3D scene (SSR disabled)
const HeroScene = dynamic(
  () => import("@/components/3d/hero-scene").then((mod) => mod.HeroScene),
  { ssr: false }
);

const insightIcons = {
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
  tip: Lightbulb,
};

const insightColors = {
  warning: "text-amber-400 bg-amber-400/10",
  success: "text-emerald-400 bg-emerald-400/10",
  info: "text-blue-400 bg-blue-400/10",
  tip: "text-violet-400 bg-violet-400/10",
};

export default function DashboardPage() {
  const recentTransactions = mockTransactions.slice(0, 5);
  const totalBalance = 48250.32;
  const monthlyIncome = 12440;
  const monthlyExpenses = 3802.6;
  const savingsRate = 69.4;

  return (
    <div className="relative">
      {/* 3D Hero Background */}
      <div className="absolute top-0 left-0 right-0 h-[400px] overflow-hidden pointer-events-none">
        <HeroScene />
        <div className="absolute inset-0 gradient-mesh" />
      </div>

      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8 pt-4"
      >
        <p className="text-sm text-[var(--muted-fg)] mb-1">Good afternoon, Alex 👋</p>
        <h1 className="text-3xl font-bold tracking-tight">
          Your <GradientText>Financial Overview</GradientText>
        </h1>
        <p className="text-sm text-[var(--muted-fg)] mt-2 max-w-lg">
          Your finances are looking great this month. You&apos;re on track to beat your savings goal by 23%.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={fadeUp}>
          <StatCard
            label="Total Balance"
            value={totalBalance}
            trend={12.5}
            trendLabel="vs last month"
            icon={Wallet}
            glow="purple"
            sparklineData={[32, 35, 38, 36, 42, 45, 48]}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Monthly Income"
            value={monthlyIncome}
            trend={8.2}
            trendLabel="vs last month"
            icon={TrendingUp}
            glow="green"
            sparklineData={[8.2, 8.8, 9.5, 10.2, 9.8, 12.4]}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Monthly Expenses"
            value={monthlyExpenses}
            trend={-15.3}
            trendLabel="vs last month"
            icon={TrendingDown}
            glow="pink"
            sparklineData={[5.8, 6.2, 5.5, 6.8, 5.9, 3.8]}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Savings Rate"
            value={savingsRate}
            isCurrency={false}
            suffix="%"
            decimals={1}
            trend={23.1}
            trendLabel="vs last month"
            icon={PiggyBank}
            glow="cyan"
            sparklineData={[37, 30, 42, 33, 40, 69]}
          />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Income vs Expenses Chart */}
        <GlassCard delay={0.3} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold">Income vs Expenses</h2>
              <p className="text-xs text-[var(--muted-fg)] mt-0.5">6-month trend</p>
            </div>
            <Link
              href="/analytics"
              className="text-xs text-[var(--accent-fg)] hover:underline flex items-center gap-1"
            >
              View Analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <AreaChartComponent
            data={mockMonthlyData}
            xKey="month"
            yKeys={[
              { key: "income", color: "#818cf8", label: "Income" },
              { key: "expenses", color: "#f472b6", label: "Expenses" },
            ]}
            height={260}
          />
        </GlassCard>

        {/* Category Breakdown */}
        <GlassCard delay={0.4}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold">Spending Breakdown</h2>
              <p className="text-xs text-[var(--muted-fg)] mt-0.5">This month</p>
            </div>
          </div>
          <DoughnutChart
            data={mockCategoryBreakdown.map((c) => ({
              name: c.category,
              value: c.amount,
              color: c.color,
            }))}
            centerValue={formatCurrency(monthlyExpenses)}
            centerLabel="Total Spent"
            height={220}
          />
          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4">
            {mockCategoryBreakdown.slice(0, 6).map((cat) => (
              <div key={cat.category} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-[var(--muted-fg)] truncate">{cat.category}</span>
                <span className="ml-auto font-medium">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <GlassCard delay={0.5}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Recent Transactions</h2>
            <Link
              href="/transactions"
              className="text-xs text-[var(--accent-fg)] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {recentTransactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center text-sm shrink-0">
                  {categoryIcons[tx.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-[var(--muted-fg)]">{tx.merchant} · {formatShortDate(tx.date)}</p>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold font-mono tabular-nums",
                    tx.amount > 0 ? "text-emerald-400" : "text-[var(--fg)]"
                  )}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {formatCurrency(Math.abs(tx.amount))}
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* AI Insights */}
        <GlassCard delay={0.6} glow="purple">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[var(--accent-fg)]" />
            <h2 className="text-base font-semibold">AI Insights</h2>
            <span className="ml-auto text-[10px] font-semibold bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">
              {mockAIInsights.length} new
            </span>
          </div>
          <div className="space-y-3">
            {mockAIInsights.slice(0, 3).map((insight, i) => {
              const Icon = insightIcons[insight.type];
              const colorClass = insightColors[insight.type];
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex gap-3 p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-elevated)] transition-colors"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      colorClass
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium">{insight.title}</p>
                    </div>
                    <p className="text-xs text-[var(--muted-fg)] line-clamp-2">
                      {insight.description}
                    </p>
                    {insight.actionLabel && (
                      <button className="text-xs text-[var(--accent-fg)] mt-1.5 hover:underline">
                        {insight.actionLabel} →
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <Link
            href="/insights"
            className="block text-center text-xs text-[var(--accent-fg)] mt-4 hover:underline"
          >
            View all insights →
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
