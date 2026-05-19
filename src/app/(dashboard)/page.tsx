"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { StatCard } from "@/components/ui/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { DoughnutChart } from "@/components/charts/doughnut-chart";
import { categoryIcons, categoryColors } from "@/lib/mock-data";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank,
  Sparkles, ArrowRight, AlertTriangle, CheckCircle2,
  Info, Lightbulb, Plus,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import Link from "next/link";
import { staggerContainer, fadeUp } from "@/lib/animations";

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

interface Stats {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  byCategory: { _id: string; total: number; count: number }[];
  monthly: { month: string; income: number; expenses: number; savings: number }[];
}

interface ApiTransaction {
  _id: string;
  description: string;
  merchant: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  status: string;
}

function getGreeting(name: string) {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = name.split(" ")[0];
  return `${timeGreeting}, ${firstName} 👋`;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);
  const [monthStats, setMonthStats] = useState<Stats | null>(null);
  const [chartStats, setChartStats] = useState<Stats | null>(null);
  const [recentTxs, setRecentTxs] = useState<ApiTransaction[]>([]);
  const [insights, setInsights] = useState<{ _id: string; title: string; body: string; type: string; impact: string; actionLabel?: string; actionUrl?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [monthRes, chartRes, txRes, insightsRes] = await Promise.all([
          fetch("/api/transactions/stats?months=1"),
          fetch("/api/transactions/stats?months=6"),
          fetch("/api/transactions?limit=5&sortBy=date&sortDir=desc"),
          fetch("/api/insights"),
        ]);
        const [monthJson, chartJson, txJson, insightsJson] = await Promise.all([
          monthRes.json(),
          chartRes.json(),
          txRes.json(),
          insightsRes.json(),
        ]);
        if (monthRes.ok) setMonthStats(monthJson.data);
        if (chartRes.ok) setChartStats(chartJson.data);
        if (txRes.ok) setRecentTxs(txJson.data ?? []);
        if (insightsRes.ok) setInsights((insightsJson.data ?? []).slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, []);

  const userName = session?.user?.name ?? "there";
  const income = monthStats?.income ?? 0;
  const expenses = monthStats?.expenses ?? 0;
  const savingsRate = monthStats?.savingsRate ?? 0;
  const netSavings = income - expenses;

  const monthlyData = chartStats?.monthly ?? [];
  const categoryData =
    chartStats?.byCategory.slice(0, 6).map((c) => ({
      name: c._id,
      value: c.total,
      color: categoryColors[c._id] ?? "#94a3b8",
    })) ?? [];

  const totalCategorySpend = categoryData.reduce((s, c) => s + c.value, 0);

  return (
    <div className="relative">
      {/* 3D Hero Background — desktop only, hidden on mobile to save space */}
      <div className="absolute top-0 left-0 right-0 h-[300px] overflow-hidden pointer-events-none hidden md:block">
        <HeroScene />
        <div className="absolute inset-0 gradient-mesh" />
      </div>

      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-4 md:mb-8 pt-1 md:pt-4"
      >
        <p className="text-xs md:text-sm text-[var(--muted-fg)] mb-0.5 md:mb-1">{getGreeting(userName)}</p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Your <GradientText>Financial Overview</GradientText>
        </h1>
        <p className="text-xs md:text-sm text-[var(--muted-fg)] mt-1 md:mt-2 max-w-lg">
          {isLoading
            ? "Loading your financial data…"
            : income > 0
              ? `This month: ${formatCurrency(income)} earned · ${formatCurrency(expenses)} spent`
              : "Add your first transaction to start tracking your finances."}
        </p>
        <button
          onClick={openAddTransaction}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary
                     text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8"
      >
        <motion.div variants={fadeUp}>
          <StatCard
            label="Monthly Income"
            value={income}
            trend={undefined}
            trendLabel="this month"
            icon={TrendingUp}
            glow="green"
            sparklineData={chartStats?.monthly.map((m) => m.income / 1000) ?? [0]}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Monthly Expenses"
            value={expenses}
            trend={undefined}
            trendLabel="this month"
            icon={TrendingDown}
            glow="pink"
            sparklineData={chartStats?.monthly.map((m) => m.expenses / 1000) ?? [0]}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Net Savings"
            value={netSavings}
            trend={undefined}
            trendLabel="this month"
            icon={Wallet}
            glow="purple"
            sparklineData={chartStats?.monthly.map((m) => m.savings / 1000) ?? [0]}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Savings Rate"
            value={savingsRate}
            isCurrency={false}
            suffix="%"
            decimals={1}
            trend={undefined}
            trendLabel="this month"
            icon={PiggyBank}
            glow="cyan"
            sparklineData={chartStats?.monthly.map((m) =>
              m.income > 0 ? Math.round(((m.income - m.expenses) / m.income) * 100) : 0
            ) ?? [0]}
          />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-8">
        <GlassCard delay={0.3} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3 md:mb-6">
            <div>
              <h2 className="text-sm md:text-base font-semibold">Income vs Expenses</h2>
              <p className="text-xs text-[var(--muted-fg)] mt-0.5">6-month trend</p>
            </div>
            <Link
              href="/analytics"
              className="text-xs text-[var(--accent-fg)] hover:underline flex items-center gap-1"
            >
              Analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {monthlyData.length > 0 ? (
            <AreaChartComponent
              data={monthlyData}
              xKey="month"
              yKeys={[
                { key: "income", color: "#818cf8", label: "Income" },
                { key: "expenses", color: "#f472b6", label: "Expenses" },
              ]}
              height={180}
            />
          ) : (
            <div className="h-[140px] md:h-[180px] flex flex-col items-center justify-center gap-2 text-sm text-[var(--muted-fg)]">
              <span className="text-2xl">📊</span>
              No data yet — add transactions to see your trend.
            </div>
          )}
        </GlassCard>

        <GlassCard delay={0.4}>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div>
              <h2 className="text-sm md:text-base font-semibold">Spending</h2>
              <p className="text-xs text-[var(--muted-fg)] mt-0.5">Last 6 months</p>
            </div>
          </div>
          {categoryData.length > 0 ? (
            <>
              <DoughnutChart
                data={categoryData}
                centerValue={formatCurrency(totalCategorySpend)}
                centerLabel="Total Spent"
                height={160}
              />
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
                {categoryData.slice(0, 4).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[var(--muted-fg)] truncate capitalize">{cat.name}</span>
                    <span className="ml-auto font-medium">
                      {totalCategorySpend > 0 ? Math.round((cat.value / totalCategorySpend) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[140px] md:h-[160px] flex flex-col items-center justify-center gap-2 text-sm text-[var(--muted-fg)]">
              <span className="text-2xl">🍩</span>
              No expense data yet.
            </div>
          )}
        </GlassCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Recent Transactions */}
        <GlassCard delay={0.5}>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-sm md:text-base font-semibold">Recent Transactions</h2>
            <Link
              href="/transactions"
              className="text-xs text-[var(--accent-fg)] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentTxs.length === 0 ? (
            <p className="text-sm text-[var(--muted-fg)] py-6 text-center">
              No transactions yet.{" "}
              <Link href="/transactions" className="text-[var(--accent-fg)] hover:underline">
                Add one →
              </Link>
            </p>
          ) : (
            <div className="space-y-1">
              {recentTxs.map((tx, i) => (
                <motion.div
                  key={tx._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center text-sm shrink-0">
                    {categoryIcons[tx.category] ?? "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-[var(--muted-fg)]">
                      {tx.merchant} · {formatShortDate(tx.date)}
                    </p>
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
          )}
        </GlassCard>

        {/* AI Insights */}
        <GlassCard delay={0.6} glow="purple">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Sparkles className="w-4 h-4 text-[var(--accent-fg)]" />
            <h2 className="text-sm md:text-base font-semibold">AI Insights</h2>
            <span className="ml-auto text-[10px] font-semibold bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">
              {insights.length} new
            </span>
          </div>
          <div className="space-y-3">
            {insights.length === 0 ? (
              <p className="text-sm text-[var(--muted-fg)] py-4 text-center">
                Add transactions to generate insights.
              </p>
            ) : insights.map((insight, i) => {
              const type = insight.type as keyof typeof insightIcons;
              const Icon = insightIcons[type] ?? Lightbulb;
              const colorClass = insightColors[type] ?? insightColors.tip;
              return (
                <motion.div
                  key={insight._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex gap-3 p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-elevated)] transition-colors"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-[var(--muted-fg)] line-clamp-2">{insight.body}</p>
                    {insight.actionLabel && insight.actionUrl && (
                      <a href={insight.actionUrl} className="text-xs text-[var(--accent-fg)] mt-1.5 hover:underline block">
                        {insight.actionLabel} →
                      </a>
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
