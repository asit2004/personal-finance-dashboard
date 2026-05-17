"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { categoryIcons, categoryColors } from "@/lib/mock-data";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useUIStore } from "@/store/useUIStore";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Download,
  ArrowLeftRight,
} from "lucide-react";
import type { TransactionCategory } from "@/types";

const categoryOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "housing", label: "🏠 Housing" },
  { value: "food", label: "🍽️ Food & Dining" },
  { value: "transport", label: "🚗 Transportation" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "health", label: "💊 Health" },
  { value: "education", label: "📚 Education" },
  { value: "utilities", label: "⚡ Utilities" },
  { value: "salary", label: "💼 Salary" },
  { value: "freelance", label: "💻 Freelance" },
  { value: "investment", label: "📈 Investment" },
];

type SortField = "date" | "amount" | "description";
type SortDir = "asc" | "desc";

export default function TransactionsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.merchant.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === "amount") cmp = Math.abs(a.amount) - Math.abs(b.amount);
      else cmp = a.description.localeCompare(b.description);
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [search, categoryFilter, typeFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <PageHeader
          title="Transactions"
          description="View and manage all your transactions"
        />
        <button
          onClick={openAddTransaction}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary
                     text-white text-sm font-semibold hover:opacity-90 transition-opacity mt-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GlassCard delay={0.1} className="!p-4">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Total Transactions</p>
          <p className="text-xl font-bold">{filteredTransactions.length}</p>
        </GlassCard>
        <GlassCard delay={0.15} className="!p-4">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Total Income</p>
          <p className="text-xl font-bold text-emerald-400">
            +{formatCurrency(totalIncome)}
          </p>
        </GlassCard>
        <GlassCard delay={0.2} className="!p-4">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Total Expenses</p>
          <p className="text-xl font-bold text-red-400">
            -{formatCurrency(totalExpenses)}
          </p>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard delay={0.25} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]
                         text-sm placeholder:text-[var(--muted-fg)] focus:outline-none focus:border-[var(--primary)]/30
                         transition-colors"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]
                       text-sm focus:outline-none focus:border-[var(--primary)]/30 transition-colors
                       appearance-none cursor-pointer min-w-[160px]"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Type */}
          <div className="flex rounded-xl border border-[var(--border-color)] overflow-hidden">
            {(["all", "income", "expense"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "px-4 py-2.5 text-xs font-medium transition-colors capitalize",
                  typeFilter === type
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--surface-elevated)]"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Transaction List */}
      <GlassCard delay={0.3} className="!p-0 overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-[var(--border-color)] text-xs font-medium text-[var(--muted-fg)]">
          <span className="w-10" />
          <button
            onClick={() => toggleSort("description")}
            className="flex-1 flex items-center gap-1 hover:text-[var(--fg)] transition-colors"
          >
            Description
            <ArrowUpDown className="w-3 h-3" />
          </button>
          <span className="hidden sm:block w-24">Category</span>
          <button
            onClick={() => toggleSort("date")}
            className="hidden sm:flex w-24 items-center gap-1 hover:text-[var(--fg)] transition-colors"
          >
            Date
            <ArrowUpDown className="w-3 h-3" />
          </button>
          <span className="w-16 text-center">Status</span>
          <button
            onClick={() => toggleSort("amount")}
            className="w-28 text-right flex items-center justify-end gap-1 hover:text-[var(--fg)] transition-colors"
          >
            Amount
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>

        {/* Rows */}
        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions found"
            description="Try adjusting your filters or search query"
          />
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {filteredTransactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center text-sm shrink-0">
                  {categoryIcons[tx.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-[var(--muted-fg)]">{tx.merchant}</p>
                </div>
                <span className="hidden sm:block w-24 text-xs text-[var(--muted-fg)] capitalize">
                  {tx.category}
                </span>
                <span className="hidden sm:block w-24 text-xs text-[var(--muted-fg)]">
                  {formatDate(tx.date)}
                </span>
                <span className="w-16 flex justify-center">
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                      tx.status === "completed" && "bg-emerald-400/10 text-emerald-400",
                      tx.status === "pending" && "bg-amber-400/10 text-amber-400",
                      tx.status === "failed" && "bg-red-400/10 text-red-400"
                    )}
                  >
                    {tx.status}
                  </span>
                </span>
                <span
                  className={cn(
                    "w-28 text-right text-sm font-semibold font-mono tabular-nums",
                    tx.amount > 0 ? "text-emerald-400" : ""
                  )}
                >
                  {tx.amount > 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(tx.amount))}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
