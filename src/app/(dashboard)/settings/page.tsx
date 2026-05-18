"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import {
  Sun, Moon, Bell, Globe, Download,
  Shield, Palette, Loader2, CheckCircle,
} from "lucide-react";

const TABS = ["Appearance", "Notifications", "General", "Security"] as const;
type Tab = (typeof TABS)[number];

const CURRENCIES = [
  { value: "INR", label: "₹ INR — Indian Rupee", symbol: "₹" },
  { value: "USD", label: "$ USD — US Dollar",    symbol: "$" },
  { value: "EUR", label: "€ EUR — Euro",          symbol: "€" },
] as const;

type SaveState = "idle" | "saving" | "success" | "error";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("Appearance");
  const { theme, setTheme } = useTheme();

  // Currency — seeded from session, persisted to DB
  const [currency, setCurrency] = useState(session?.user?.currency ?? "INR");
  const [currencySave, setCurrencySave] = useState<SaveState>("idle");

  // Monthly income & savings goal
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");
  const [financeSave, setFinanceSave] = useState<SaveState>("idle");

  const [notifications, setNotifications] = useState({
    email: true, push: true, budget: true, insights: false, weekly: true,
  });

  // Fetch real user prefs on mount
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/user");
      if (!res.ok) return;
      const { data } = await res.json();
      if (data.currency) setCurrency(data.currency);
      if (data.monthlyIncome) setMonthlyIncome(String(data.monthlyIncome));
      if (data.savingsGoal) setSavingsGoal(String(data.savingsGoal));
    }
    load();
  }, []);

  async function saveCurrency(val: string) {
    setCurrency(val);
    setCurrencySave("saving");
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: val }),
      });
      if (!res.ok) throw new Error();
      await updateSession({ currency: val });
      setCurrencySave("success");
      setTimeout(() => setCurrencySave("idle"), 2500);
    } catch {
      setCurrencySave("error");
    }
  }

  async function saveFinance(e: React.FormEvent) {
    e.preventDefault();
    setFinanceSave("saving");
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
          savingsGoal: savingsGoal ? parseFloat(savingsGoal) : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setFinanceSave("success");
      setTimeout(() => setFinanceSave("idle"), 2500);
    } catch {
      setFinanceSave("error");
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your preferences" />

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[var(--surface)] w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all relative whitespace-nowrap",
              activeTab === tab ? "text-white" : "text-[var(--muted-fg)] hover:text-[var(--fg)]"
            )}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="settingsTab"
                className="absolute inset-0 rounded-lg gradient-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* ── Appearance ── */}
      {activeTab === "Appearance" && (
        <div className="space-y-4">
          <GlassCard delay={0.1}>
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-[var(--accent-fg)]" />
              <h2 className="text-base font-semibold">Theme</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all",
                    theme === t
                      ? "border-[var(--primary)] bg-[var(--accent)]"
                      : "border-[var(--border-color)] hover:border-[var(--primary)]/30"
                  )}
                >
                  {t === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span className="text-sm font-medium capitalize">{t}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard delay={0.15}>
            <h2 className="text-base font-semibold mb-4">Accent Color</h2>
            <div className="flex gap-3 flex-wrap">
              {["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/30
                             transition-all hover:scale-110"
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── Notifications ── */}
      {activeTab === "Notifications" && (
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-[var(--accent-fg)]" />
            <h2 className="text-base font-semibold">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "email",    label: "Email Notifications", desc: "Receive updates via email" },
              { key: "push",     label: "Push Notifications",  desc: "Browser push notifications" },
              { key: "budget",   label: "Budget Alerts",       desc: "When you exceed budget limits" },
              { key: "insights", label: "AI Insight Alerts",   desc: "New AI recommendations" },
              { key: "weekly",   label: "Weekly Summary",      desc: "Weekly financial digest every Monday" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-[var(--muted-fg)]">{item.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((n) => ({
                      ...n,
                      [item.key]: !n[item.key as keyof typeof n],
                    }))
                  }
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors relative shrink-0",
                    notifications[item.key as keyof typeof notifications]
                      ? "bg-[var(--primary)]"
                      : "bg-[var(--surface-elevated)]"
                  )}
                  role="switch"
                  aria-checked={notifications[item.key as keyof typeof notifications]}
                >
                  <motion.div
                    animate={{
                      x: notifications[item.key as keyof typeof notifications] ? 18 : 2,
                    }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                  />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ── General ── */}
      {activeTab === "General" && (
        <div className="space-y-4">
          {/* Currency */}
          <GlassCard delay={0.1}>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-[var(--accent-fg)]" />
              <h2 className="text-base font-semibold">Currency</h2>
            </div>

            <p className="text-xs text-[var(--muted-fg)] mb-4">
              All amounts across the dashboard will be displayed in your chosen currency.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
              {CURRENCIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => saveCurrency(c.value)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                    currency === c.value
                      ? "border-[var(--primary)] bg-[var(--accent)] text-[var(--fg)]"
                      : "border-[var(--border-color)] hover:border-[var(--primary)]/40 hover:bg-[var(--surface-elevated)]"
                  )}
                >
                  <span className="text-xl font-bold w-7 text-center">{c.symbol}</span>
                  <div>
                    <p className="text-sm font-semibold">{c.value}</p>
                    <p className="text-[10px] text-[var(--muted-fg)]">
                      {c.value === "INR" ? "Indian Rupee" : c.value === "USD" ? "US Dollar" : "Euro"}
                    </p>
                  </div>
                  {currency === c.value && (
                    <CheckCircle className="w-4 h-4 text-[var(--primary)] ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-3 h-5">
              {currencySave === "saving" && (
                <p className="flex items-center gap-1.5 text-xs text-[var(--muted-fg)]">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                </p>
              )}
              {currencySave === "success" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 text-xs text-[var(--neon-green)]"
                >
                  <CheckCircle className="w-3 h-3" /> Currency updated
                </motion.p>
              )}
              {currencySave === "error" && (
                <p className="text-xs text-[var(--destructive)]">Failed to save. Try again.</p>
              )}
            </div>
          </GlassCard>

          {/* Financial goals */}
          <GlassCard delay={0.15}>
            <h2 className="text-base font-semibold mb-1">Financial Goals</h2>
            <p className="text-xs text-[var(--muted-fg)] mb-4">
              Used to calculate your savings rate and financial health score.
            </p>
            <form onSubmit={saveFinance} className="space-y-4 max-w-sm">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Monthly Income ({CURRENCIES.find((c) => c.value === currency)?.symbol ?? "₹"})
                </label>
                <input
                  type="number"
                  min={0}
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="e.g. 80000"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]
                             text-sm focus:outline-none focus:border-[var(--primary)]/40
                             focus:ring-2 focus:ring-[var(--primary)]/10 transition-colors
                             placeholder:text-[var(--muted-fg)]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Monthly Savings Goal ({CURRENCIES.find((c) => c.value === currency)?.symbol ?? "₹"})
                </label>
                <input
                  type="number"
                  min={0}
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  placeholder="e.g. 20000"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]
                             text-sm focus:outline-none focus:border-[var(--primary)]/40
                             focus:ring-2 focus:ring-[var(--primary)]/10 transition-colors
                             placeholder:text-[var(--muted-fg)]"
                />
              </div>
              <button
                type="submit"
                disabled={financeSave === "saving"}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                           text-sm font-semibold hover:opacity-90 transition-opacity
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {financeSave === "saving" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : financeSave === "success" ? (
                  <><CheckCircle className="w-4 h-4" /> Saved</>
                ) : (
                  "Save Goals"
                )}
              </button>
              {financeSave === "error" && (
                <p className="text-xs text-[var(--destructive)]">Failed to save. Try again.</p>
              )}
            </form>
          </GlassCard>

          {/* Export */}
          <GlassCard delay={0.2}>
            <div className="flex items-center gap-3 mb-3">
              <Download className="w-5 h-5 text-[var(--accent-fg)]" />
              <h2 className="text-base font-semibold">Data Export</h2>
            </div>
            <p className="text-xs text-[var(--muted-fg)] mb-4">
              Download all your transactions as a CSV file.
            </p>
            <button className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold
                               hover:opacity-90 transition-opacity">
              Export as CSV
            </button>
          </GlassCard>
        </div>
      )}

      {/* ── Security ── */}
      {activeTab === "Security" && (
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[var(--accent-fg)]" />
            <h2 className="text-base font-semibold">Security Settings</h2>
          </div>
          <div className="space-y-1">
            {[
              { label: "Two-Factor Authentication", desc: "Add an extra layer of security",    action: "Enable" },
              { label: "Change Password",           desc: "Update your password",              action: "Update" },
              { label: "Active Sessions",           desc: "Manage your logged-in devices",     action: "View" },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between py-3.5",
                  i < arr.length - 1 && "border-b border-[var(--border-color)]"
                )}
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-[var(--muted-fg)]">{item.desc}</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-color)]
                                   hover:bg-[var(--surface-elevated)] transition-colors shrink-0 ml-4">
                  {item.action}
                </button>
              </div>
            ))}
          </div>

          {/* Signed-in account info */}
          <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
            <p className="text-xs text-[var(--muted-fg)] mb-1">Signed in as</p>
            <p className="text-sm font-medium">{session?.user?.email ?? "—"}</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
