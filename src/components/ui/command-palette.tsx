"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  CreditCard,
  PieChart,
  BarChart3,
  Lightbulb,
  Settings,
  Plus,
  Sun,
  Moon,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useTheme } from "@/components/providers/theme-provider";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  group: "navigate" | "actions" | "transactions";
}

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function CommandPalette() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isOpen = useUIStore((s) => s.commandPaletteOpen);
  const close = useUIStore((s) => s.closeCommandPalette);
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);
  const transactions = useTransactionStore((s) => s.transactions);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback(
    (path: string) => {
      close();
      router.push(path);
    },
    [close, router]
  );

  const staticItems: PaletteItem[] = useMemo(
    () => [
      {
        id: "nav-dashboard",
        group: "navigate",
        label: "Dashboard",
        description: "Overview and stats",
        icon: <LayoutDashboard className="w-4 h-4" />,
        action: () => navigate("/"),
      },
      {
        id: "nav-transactions",
        group: "navigate",
        label: "Transactions",
        description: "All transactions",
        icon: <CreditCard className="w-4 h-4" />,
        action: () => navigate("/transactions"),
      },
      {
        id: "nav-budgets",
        group: "navigate",
        label: "Budgets",
        description: "Spending limits",
        icon: <PieChart className="w-4 h-4" />,
        action: () => navigate("/budgets"),
      },
      {
        id: "nav-analytics",
        group: "navigate",
        label: "Analytics",
        description: "Charts and trends",
        icon: <BarChart3 className="w-4 h-4" />,
        action: () => navigate("/analytics"),
      },
      {
        id: "nav-insights",
        group: "navigate",
        label: "AI Insights",
        description: "AI-powered recommendations",
        icon: <Lightbulb className="w-4 h-4" />,
        action: () => navigate("/insights"),
      },
      {
        id: "nav-settings",
        group: "navigate",
        label: "Settings",
        description: "Account preferences",
        icon: <Settings className="w-4 h-4" />,
        action: () => navigate("/settings"),
      },
      {
        id: "action-add",
        group: "actions",
        label: "Add Transaction",
        description: "Record a new income or expense",
        icon: <Plus className="w-4 h-4" />,
        shortcut: "⌘T",
        action: () => {
          close();
          openAddTransaction();
        },
      },
      {
        id: "action-theme",
        group: "actions",
        label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        icon: theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
        shortcut: "⌘⇧T",
        action: () => {
          toggleTheme();
          close();
        },
      },
    ],
    [navigate, close, openAddTransaction, theme, toggleTheme]
  );

  const transactionItems: PaletteItem[] = useMemo(
    () =>
      transactions.slice(0, 5).map((txn) => ({
        id: `txn-${txn.id}`,
        group: "transactions" as const,
        label: txn.description,
        description: txn.merchant,
        icon:
          txn.type === "income" ? (
            <TrendingUp className="w-4 h-4 text-[var(--neon-green)]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-[var(--destructive)]" />
          ),
        action: () => navigate("/transactions"),
      })),
    [transactions, navigate]
  );

  const filtered = useMemo(() => {
    const all = [...staticItems, ...transactionItems];
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [query, staticItems, transactionItems]);

  const grouped = useMemo(() => {
    const groups: Record<string, { label: string; items: (PaletteItem & { flatIndex: number })[] }> = {
      navigate: { label: "Navigate", items: [] },
      actions: { label: "Actions", items: [] },
      transactions: { label: "Recent Transactions", items: [] },
    };
    let flatIndex = 0;
    filtered.forEach((item) => {
      groups[item.group].items.push({ ...item, flatIndex: flatIndex++ });
    });
    return groups;
  }, [filtered]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const total = filtered.length;

    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % total);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + total) % total);
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[activeIndex]?.action();
      } else if (e.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, filtered, activeIndex, close]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            key="palette-panel"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl mx-4"
            style={{ maxHeight: "70vh" }}
          >
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg)] shadow-2xl overflow-hidden flex flex-col">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)]">
                <Search className="w-4 h-4 text-[var(--muted-fg)] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands and transactions..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-fg)]"
                />
                <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--surface-elevated)] text-[10px] font-mono text-[var(--muted-fg)]">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="overflow-y-auto flex-1 p-2">
                {filtered.length === 0 ? (
                  <p className="text-center text-sm text-[var(--muted-fg)] py-8">
                    No results for &quot;{query}&quot;
                  </p>
                ) : (
                  Object.entries(grouped).map(([key, group]) => {
                    if (group.items.length === 0) return null;
                    return (
                      <div key={key} className="mb-2">
                        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-fg)]">
                          {group.label}
                        </p>
                        {group.items.map((item) => (
                          <PaletteRow
                            key={item.id}
                            item={item}
                            isActive={item.flatIndex === activeIndex}
                            onHover={() => setActiveIndex(item.flatIndex)}
                            transactions={transactions}
                          />
                        ))}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--border-color)] text-[10px] text-[var(--muted-fg)]">
                <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> select</span>
                <span className="flex items-center gap-1"><kbd className="font-mono">ESC</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PaletteRow({
  item,
  isActive,
  onHover,
  transactions,
}: {
  item: PaletteItem & { flatIndex: number };
  isActive: boolean;
  onHover: () => void;
  transactions: ReturnType<typeof useTransactionStore.getState>["transactions"];
}) {
  const txn =
    item.group === "transactions"
      ? transactions.find((t) => `txn-${t.id}` === item.id)
      : null;

  return (
    <button
      data-index={item.flatIndex}
      onClick={item.action}
      onMouseEnter={onHover}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
        isActive ? "bg-[var(--accent)]" : "hover:bg-[var(--surface-elevated)]"
      )}
    >
      <span
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          isActive
            ? "bg-[var(--primary)]/20 text-[var(--primary)]"
            : "bg-[var(--surface-elevated)] text-[var(--muted-fg)]"
        )}
      >
        {item.icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium truncate">{item.label}</span>
        {item.description && (
          <span className="block text-xs text-[var(--muted-fg)] truncate">
            {item.description}
          </span>
        )}
      </span>
      {txn && (
        <span
          className={cn(
            "text-sm font-semibold tabular-nums shrink-0",
            txn.type === "income" ? "text-[var(--neon-green)]" : "text-[var(--destructive)]"
          )}
        >
          {txn.type === "income" ? "+" : ""}
          {formatCurrency(Math.abs(txn.amount))}
        </span>
      )}
      {item.shortcut && !txn && (
        <kbd className="hidden sm:block text-[10px] font-mono text-[var(--muted-fg)] px-1.5 py-0.5 rounded bg-[var(--surface-elevated)]">
          {item.shortcut}
        </kbd>
      )}
      {!txn && !item.shortcut && isActive && (
        <ArrowRight className="w-3.5 h-3.5 text-[var(--muted-fg)] shrink-0" />
      )}
    </button>
  );
}
