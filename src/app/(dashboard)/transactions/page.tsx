"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { categoryIcons, categoryColors } from "@/lib/mock-data";
import { useUIStore } from "@/store/useUIStore";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  Search, ArrowUpDown, Plus, ArrowLeftRight, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";

interface ApiTransaction {
  _id: string;
  description: string;
  merchant: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  status: "completed" | "pending" | "failed";
  paymentMethod: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const categoryOptions = [
  { value: "", label: "All Categories" },
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
  { value: "other", label: "📦 Other" },
];

type SortField = "date" | "amount" | "description";
type SortDir = "asc" | "desc";

export default function TransactionsPage() {
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);

  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "income" | "expense">("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search]);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        sortBy: sortField,
        sortDir,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category) params.set("category", category);
      if (typeFilter) params.set("type", typeFilter);

      const res = await fetch(`/api/transactions?${params}`);
      const json = await res.json();
      if (res.ok) {
        setTransactions(json.data ?? []);
        setMeta(json.meta);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, sortField, sortDir, debouncedSearch, category, typeFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Re-fetch after adding a transaction via modal
  useEffect(() => {
    const handler = () => {
      setPage(1);
      fetchTransactions();
    };
    window.addEventListener("transaction-added", handler);
    return () => window.removeEventListener("transaction-added", handler);
  }, [fetchTransactions]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <PageHeader title="Transactions" description="View and manage all your transactions" />
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
          <p className="text-xs text-[var(--muted-fg)] mb-1">Showing</p>
          <p className="text-xl font-bold">{meta.total} transactions</p>
        </GlassCard>
        <GlassCard delay={0.15} className="!p-4">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Income (this page)</p>
          <p className="text-xl font-bold text-emerald-400">+{formatCurrency(totalIncome)}</p>
        </GlassCard>
        <GlassCard delay={0.2} className="!p-4">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Expenses (this page)</p>
          <p className="text-xl font-bold text-red-400">-{formatCurrency(totalExpenses)}</p>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard delay={0.25} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]
                         text-sm placeholder:text-[var(--muted-fg)] focus:outline-none focus:border-[var(--primary)]/30
                         transition-colors"
            />
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]
                       text-sm focus:outline-none focus:border-[var(--primary)]/30 transition-colors
                       appearance-none cursor-pointer min-w-[160px]"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <div className="flex rounded-xl border border-[var(--border-color)] overflow-hidden">
            {(["", "income", "expense"] as const).map((type) => (
              <button
                key={type}
                onClick={() => { setTypeFilter(type); setPage(1); }}
                className={cn(
                  "px-4 py-2.5 text-xs font-medium transition-colors capitalize",
                  typeFilter === type
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--surface-elevated)]"
                )}
              >
                {type === "" ? "all" : type}
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
            Description <ArrowUpDown className="w-3 h-3" />
          </button>
          <span className="hidden sm:block w-24">Category</span>
          <button
            onClick={() => toggleSort("date")}
            className="hidden sm:flex w-24 items-center gap-1 hover:text-[var(--fg)] transition-colors"
          >
            Date <ArrowUpDown className="w-3 h-3" />
          </button>
          <span className="w-16 text-center">Status</span>
          <button
            onClick={() => toggleSort("amount")}
            className="w-28 text-right flex items-center justify-end gap-1 hover:text-[var(--fg)] transition-colors"
          >
            Amount <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-sm text-[var(--muted-fg)]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions found"
            description="Try adjusting your filters or add your first transaction"
          />
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {transactions.map((tx, i) => (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: (categoryColors[tx.category] ?? "#94a3b8") + "20" }}
                >
                  {categoryIcons[tx.category] ?? "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-[var(--muted-fg)]">{tx.merchant || "—"}</p>
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

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-color)]">
            <p className="text-xs text-[var(--muted-fg)]">
              Page {meta.page} of {meta.pages} · {meta.total} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.page === 1}
                className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--surface-elevated)]
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={meta.page === meta.pages}
                className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--surface-elevated)]
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
