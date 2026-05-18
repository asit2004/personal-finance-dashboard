"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { categoryIcons, categoryColors } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, Loader2, Trash2, X } from "lucide-react";

interface ApiBudget {
  _id: string;
  category: string;
  name: string;
  limit: number;
  spent: number;
  period: string;
  color: string;
  alertAt: number;
}

const CATEGORIES = [
  "housing","food","transport","entertainment","shopping",
  "health","education","utilities","salary","freelance","investment","other",
] as const;

type SaveState = "idle" | "saving" | "error";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<ApiBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "food" as typeof CATEGORIES[number],
    limit: "",
    period: "monthly" as "weekly" | "monthly" | "yearly",
    alertAt: "80",
  });

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/budgets");
      const json = await res.json();
      if (res.ok) setBudgets(json.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaveState("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          limit: parseFloat(form.limit),
          alertAt: parseInt(form.alertAt),
          color: categoryColors[form.category] ?? "#818cf8",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create budget");
      setBudgets((prev) => [{ ...json.data, spent: 0 }, ...prev]);
      setShowForm(false);
      setForm({ name: "", category: "food", limit: "", period: "monthly", alertAt: "80" });
      setSaveState("idle");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create budget");
      setSaveState("error");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      setBudgets((prev) => prev.filter((b) => b._id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <PageHeader title="Budgets" description="Track your spending limits and stay on budget" />
        <button
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary
                     text-white text-sm font-semibold hover:opacity-90 transition-opacity mt-1"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Budget"}
        </button>
      </div>

      {/* Create budget form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <GlassCard delay={0} glow="purple">
              <h2 className="text-sm font-semibold mb-4">Create New Budget</h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-[var(--muted-fg)]">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Groceries"
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-[var(--muted-fg)]">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof CATEGORIES[number] }))}
                    className={cn(inputCls, "appearance-none cursor-pointer")}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {categoryIcons[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-[var(--muted-fg)]">Monthly Limit (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.limit}
                    onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))}
                    placeholder="e.g. 10000"
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-[var(--muted-fg)]">Alert At (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.alertAt}
                    onChange={(e) => setForm((f) => ({ ...f, alertAt: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saveState === "saving"}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                               text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {saveState === "saving" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                    ) : "Create Budget"}
                  </button>
                  {saveState === "error" && (
                    <p className="text-xs text-[var(--destructive)]">{errorMsg}</p>
                  )}
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-sm text-[var(--muted-fg)]">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading budgets…
        </div>
      ) : budgets.length === 0 ? (
        <GlassCard delay={0.1}>
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">💰</p>
            <p className="text-sm font-medium mb-1">No budgets yet</p>
            <p className="text-xs text-[var(--muted-fg)]">
              Create your first budget to start tracking your spending limits.
            </p>
          </div>
        </GlassCard>
      ) : (
        <>
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
                  animate={{ width: `${Math.min(overallPercentage, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={cn(
                    "h-full rounded-full",
                    overallPercentage > 90 ? "bg-red-400" : overallPercentage > 70 ? "bg-amber-400" : "bg-emerald-400"
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
          {budgets.some((b) => b.spent > 0) && (
            <GlassCard delay={0.2} className="mb-6">
              <h2 className="text-base font-semibold mb-4">Budget Overview</h2>
              <BarChartComponent
                data={budgets.map((b) => ({
                  name: b.name.length > 10 ? b.name.slice(0, 10) + "…" : b.name,
                  value: b.spent,
                  color: b.color,
                }))}
                height={250}
              />
            </GlassCard>
          )}

          {/* Budget Cards Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {budgets.map((budget) => {
              const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
              const isOver = percentage > 100;
              const isWarning = percentage > budget.alertAt && !isOver;

              return (
                <motion.div key={budget._id} variants={fadeUp}>
                  <GlassCard
                    hoverable
                    className={cn("!p-5 relative overflow-hidden", isOver && "border-red-500/20")}
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(budget._id)}
                      disabled={deletingId === budget._id}
                      className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center
                                 opacity-0 group-hover:opacity-100 hover:bg-red-400/10 text-[var(--muted-fg)]
                                 hover:text-red-400 transition-all"
                      aria-label="Delete budget"
                    >
                      {deletingId === budget._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ backgroundColor: budget.color + "20" }}
                      >
                        {categoryIcons[budget.category] ?? "📦"}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{budget.name}</h3>
                        <p className="text-[10px] text-[var(--muted-fg)] uppercase tracking-wide">
                          {isOver ? "Over budget" : isWarning ? "Almost there" : "On track"}
                        </p>
                      </div>
                    </div>

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

                    <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: isOver ? "#f87171" : isWarning ? "#fbbf24" : budget.color,
                        }}
                      />
                    </div>

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
        </>
      )}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] " +
  "text-sm focus:outline-none focus:border-[var(--primary)]/40 focus:ring-2 " +
  "focus:ring-[var(--primary)]/10 transition-colors placeholder:text-[var(--muted-fg)]";
