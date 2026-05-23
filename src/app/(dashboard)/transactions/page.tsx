"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { categoryIcons, categoryColors } from "@/lib/mock-data";
import { useUIStore } from "@/store/useUIStore";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  Search, ArrowUpDown, Plus, ArrowLeftRight, Loader2,
  ChevronLeft, ChevronRight, Pencil, Trash2, X, TrendingUp, TrendingDown,
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
  note?: string;
}

interface Meta { page: number; limit: number; total: number; pages: number; }

const CATEGORIES = [
  "housing","food","transport","entertainment","shopping",
  "health","education","utilities","salary","freelance","investment","transfer","other",
] as const;

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "housing", label: "🏠 Housing" },
  { value: "food", label: "🍽️ Food & Dining" },
  { value: "transport", label: "🚗 Transport" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "health", label: "💊 Health" },
  { value: "education", label: "📚 Education" },
  { value: "utilities", label: "⚡ Utilities" },
  { value: "salary", label: "💼 Salary" },
  { value: "freelance", label: "💻 Freelance" },
  { value: "investment", label: "📈 Investment" },
  { value: "transfer", label: "🔄 Transfer" },
  { value: "other", label: "📦 Other" },
];

type SortField = "date" | "amount" | "description";
type SortDir = "asc" | "desc";

// ── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ tx, onClose, onSaved }: {
  tx: ApiTransaction;
  onClose: () => void;
  onSaved: (updated: ApiTransaction) => void;
}) {
  const [form, setForm] = useState({
    description: tx.description,
    amount: Math.abs(tx.amount),
    type: tx.type,
    category: tx.category,
    date: tx.date.slice(0, 10),
    merchant: tx.merchant ?? "",
    note: tx.note ?? "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions/${tx._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update");
      onSaved(json.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-md rounded-2xl border border-[var(--border-color)]
                   bg-[var(--bg)] shadow-2xl overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <h2 className="text-base font-semibold">Edit Transaction</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center
                   text-[var(--muted-fg)] hover:bg-[var(--surface-elevated)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(["expense", "income"] as const).map((type) => (
              <button key={type} type="button" onClick={() => update("type", type)}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                  form.type === type
                    ? type === "income"
                      ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/40"
                      : "bg-rose-400/20 text-rose-400 border border-rose-400/40"
                    : "bg-[var(--surface)] border border-[var(--border-color)] text-[var(--muted-fg)]"
                )}>
                {type === "income" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <input type="text" value={form.description} required
              onChange={(e) => update("description", e.target.value)} className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-fg)]">₹</span>
              <input type="number" step="0.01" min="0" value={form.amount}
                onChange={(e) => update("amount", parseFloat(e.target.value) || 0)}
                className={cn(inputCls, "pl-7")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)}
                className={cn(inputCls, "appearance-none cursor-pointer")}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date</label>
              <input type="date" value={form.date}
                onChange={(e) => update("date", e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Merchant <span className="text-[var(--muted-fg)] font-normal text-xs">(optional)</span>
            </label>
            <input type="text" value={form.merchant}
              onChange={(e) => update("merchant", e.target.value)}
              placeholder="e.g. Swiggy" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Note <span className="text-[var(--muted-fg)] font-normal text-xs">(optional)</span>
            </label>
            <textarea rows={2} value={form.note} maxLength={500}
              onChange={(e) => update("note", e.target.value)}
              placeholder="Any additional notes…"
              className={cn(inputCls, "resize-none")} />
          </div>

          {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium
                         hover:bg-[var(--surface-elevated)] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary
                         text-white text-sm font-semibold hover:opacity-90 transition-opacity
                         disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);

  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "income" | "expense">("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const [editingTx, setEditingTx] = useState<ApiTransaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [search]);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", sortBy: sortField, sortDir });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category) params.set("category", category);
      if (typeFilter) params.set("type", typeFilter);

      const [txRes, statsRes] = await Promise.all([
        fetch(`/api/transactions?${params}`),
        fetch("/api/transactions/stats?months=1"),
      ]);
      const [txJson, statsJson] = await Promise.all([txRes.json(), statsRes.json()]);

      if (txRes.ok) { setTransactions(txJson.data ?? []); setMeta(txJson.meta); }
      if (statsRes.ok && statsJson.data) {
        setTotalIncome(statsJson.data.income ?? 0);
        setTotalExpenses(statsJson.data.expenses ?? 0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, sortField, sortDir, debouncedSearch, category, typeFilter]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  useEffect(() => {
    const handler = () => { setPage(1); fetchTransactions(); };
    window.addEventListener("transaction-added", handler);
    return () => window.removeEventListener("transaction-added", handler);
  }, [fetchTransactions]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
    setPage(1);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      setMeta((m) => ({ ...m, total: m.total - 1 }));
    } finally {
      setDeletingId(null);
    }
  }

  function handleSaved(updated: ApiTransaction) {
    setTransactions((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-2">
        <PageHeader title="Transactions" description="View and manage all your transactions" />
        <div className="flex items-center gap-2 mt-1 shrink-0">
          <button onClick={openAddTransaction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary
                       text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Summary — real monthly totals from stats API */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GlassCard delay={0.1} className="!p-4">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Total Transactions</p>
          <p className="text-xl font-bold">{meta.total}</p>
        </GlassCard>
        <GlassCard delay={0.15} className="!p-4">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Income this month</p>
          <p className="text-xl font-bold text-emerald-400">+{formatCurrency(totalIncome)}</p>
        </GlassCard>
        <GlassCard delay={0.2} className="!p-4">
          <p className="text-xs text-[var(--muted-fg)] mb-1">Expenses this month</p>
          <p className="text-xl font-bold text-red-400">-{formatCurrency(totalExpenses)}</p>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard delay={0.25} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]
                         text-sm placeholder:text-[var(--muted-fg)] focus:outline-none
                         focus:border-[var(--primary)]/30 transition-colors" />
          </div>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]
                       text-sm focus:outline-none appearance-none cursor-pointer min-w-[160px]">
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="flex rounded-xl border border-[var(--border-color)] overflow-hidden">
            {(["", "income", "expense"] as const).map((type) => (
              <button key={type} onClick={() => { setTypeFilter(type); setPage(1); }}
                className={cn(
                  "px-4 py-2.5 text-xs font-medium transition-colors capitalize",
                  typeFilter === type
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--surface-elevated)]"
                )}>
                {type === "" ? "All" : type}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Transaction list */}
      <GlassCard delay={0.3} className="!p-0 overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-3 border-b border-[var(--border-color)]
                        text-xs font-medium text-[var(--muted-fg)]">
          <span className="w-10" />
          <button onClick={() => toggleSort("description")}
            className="flex-1 flex items-center gap-1 hover:text-[var(--fg)] transition-colors">
            Description <ArrowUpDown className="w-3 h-3" />
          </button>
          <span className="hidden sm:block w-24">Category</span>
          <button onClick={() => toggleSort("date")}
            className="hidden sm:flex w-24 items-center gap-1 hover:text-[var(--fg)] transition-colors">
            Date <ArrowUpDown className="w-3 h-3" />
          </button>
          <span className="w-16 text-center">Status</span>
          <button onClick={() => toggleSort("amount")}
            className="w-28 text-right flex items-center justify-end gap-1 hover:text-[var(--fg)] transition-colors">
            Amount <ArrowUpDown className="w-3 h-3" />
          </button>
          <span className="w-16 text-center">Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-sm text-[var(--muted-fg)]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="No transactions found"
            description="Try adjusting your filters or add your first transaction" />
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {transactions.map((tx, i) => (
              <motion.div key={tx._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="group flex items-center gap-4 px-5 py-3.5
                           hover:bg-[var(--surface-elevated)] transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: (categoryColors[tx.category] ?? "#94a3b8") + "20" }}>
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
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                    tx.status === "completed" && "bg-emerald-400/10 text-emerald-400",
                    tx.status === "pending"   && "bg-amber-400/10 text-amber-400",
                    tx.status === "failed"    && "bg-red-400/10 text-red-400")}>
                    {tx.status}
                  </span>
                </span>
                <span className={cn("w-28 text-right text-sm font-semibold font-mono tabular-nums",
                  tx.amount > 0 ? "text-emerald-400" : "")}>
                  {tx.amount > 0 ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}
                </span>

                {/* Edit / Delete — appear on row hover */}
                <div className="w-16 flex items-center justify-center gap-1
                                opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingTx(tx)} aria-label="Edit transaction"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-fg)]
                               hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(tx._id)} disabled={deletingId === tx._id}
                    aria-label="Delete transaction"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-fg)]
                               hover:text-rose-400 hover:bg-rose-400/10 transition-colors disabled:opacity-40">
                    {deletingId === tx._id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-color)]">
            <p className="text-xs text-[var(--muted-fg)]">
              Page {meta.page} of {meta.pages} · {meta.total} total
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={meta.page === 1}
                className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--surface-elevated)]
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(meta.pages, p + 1))} disabled={meta.page === meta.pages}
                className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--surface-elevated)]
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Edit modal */}
      <AnimatePresence>
        {editingTx && (
          <EditModal
            tx={editingTx}
            onClose={() => setEditingTx(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] " +
  "text-sm focus:outline-none focus:border-[var(--primary)]/40 focus:ring-2 " +
  "focus:ring-[var(--primary)]/10 transition-colors placeholder:text-[var(--muted-fg)]";
