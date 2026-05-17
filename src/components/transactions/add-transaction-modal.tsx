"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { X, Plus, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { TransactionCategory } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "investment", label: "Investment" },
  { value: "housing", label: "Housing" },
  { value: "food", label: "Food & Dining" },
  { value: "transport", label: "Transport" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "utilities", label: "Utilities" },
  { value: "transfer", label: "Transfer" },
  { value: "other", label: "Other" },
];

const schema = z.object({
  description: z.string().min(2, "Description must be at least 2 characters"),
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .max(1_000_000, "Amount too large"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  merchant: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

const defaultValues: FormData = {
  description: "",
  amount: 0,
  type: "expense",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  merchant: "",
};

export function AddTransactionModal() {
  const isOpen = useUIStore((s) => s.addTransactionOpen);
  const close = useUIStore((s) => s.closeAddTransaction);
  const addTransaction = useTransactionStore((s) => s.addTransaction);

  const [form, setForm] = useState<FormData>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  // Focus first input on open, reset on close
  useEffect(() => {
    if (isOpen) {
      setForm(defaultValues);
      setErrors({});
      setSuccess(false);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const { data } = result;
    addTransaction({
      id: `t${Date.now()}`,
      description: data.description,
      amount: data.type === "expense" ? -Math.abs(data.amount) : Math.abs(data.amount),
      type: data.type,
      category: data.category as TransactionCategory,
      date: data.date,
      merchant: data.merchant ?? "",
      status: "completed",
    });

    setIsLoading(false);
    setSuccess(true);
    setTimeout(() => close(), 1000);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-[var(--border-color)]
                         bg-[var(--bg)] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
                <h2 id="modal-title" className="text-base font-semibold">
                  Add Transaction
                </h2>
                <button
                  onClick={close}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-fg)]
                             hover:bg-[var(--surface-elevated)] hover:text-[var(--fg)] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Success state */}
              {success ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--neon-green)]/20 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-[var(--neon-green)] rotate-45" />
                  </div>
                  <p className="font-semibold text-[var(--neon-green)]">Transaction added!</p>
                  <p className="text-sm text-[var(--muted-fg)]">
                    {formatCurrency(Math.abs(form.amount))} recorded
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Type toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    {(["expense", "income"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => update("type", type)}
                        className={cn(
                          "flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                          form.type === type
                            ? type === "income"
                              ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border border-[var(--neon-green)]/40"
                              : "bg-[var(--destructive)]/20 text-[var(--destructive)] border border-[var(--destructive)]/40"
                            : "bg-[var(--surface)] border border-[var(--border-color)] text-[var(--muted-fg)] hover:bg-[var(--surface-elevated)]"
                        )}
                      >
                        {type === "income" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Description */}
                  <FormField label="Description" error={errors.description}>
                    <input
                      ref={firstInputRef}
                      type="text"
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      placeholder="e.g. Monthly Salary"
                      className={inputCls(!!errors.description)}
                    />
                  </FormField>

                  {/* Amount */}
                  <FormField label="Amount" error={errors.amount}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-fg)]">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.amount || ""}
                        onChange={(e) => update("amount", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={cn(inputCls(!!errors.amount), "pl-7")}
                      />
                    </div>
                  </FormField>

                  {/* Category + Date grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Category" error={errors.category}>
                      <select
                        value={form.category}
                        onChange={(e) => update("category", e.target.value)}
                        className={cn(inputCls(!!errors.category), "appearance-none cursor-pointer")}
                      >
                        <option value="">Select…</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Date" error={errors.date}>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => update("date", e.target.value)}
                        className={inputCls(!!errors.date)}
                      />
                    </FormField>
                  </div>

                  {/* Merchant (optional) */}
                  <FormField label="Merchant (optional)">
                    <input
                      type="text"
                      value={form.merchant ?? ""}
                      onChange={(e) => update("merchant", e.target.value)}
                      placeholder="e.g. Whole Foods"
                      className={inputCls(false)}
                    />
                  </FormField>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={close}
                      className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium
                                 hover:bg-[var(--surface-elevated)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary
                                 text-white text-sm font-semibold hover:opacity-90 transition-opacity
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Transaction
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[var(--fg)]">{label}</label>
      {children}
      {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full px-3 py-2.5 rounded-xl border bg-[var(--surface)] text-sm",
    "placeholder:text-[var(--muted-fg)] outline-none transition-colors",
    "focus:border-[var(--primary)]/50 focus:ring-2 focus:ring-[var(--primary)]/10",
    hasError ? "border-[var(--destructive)]/50" : "border-[var(--border-color)]"
  );
}
