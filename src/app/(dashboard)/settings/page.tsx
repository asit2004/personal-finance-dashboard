"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { Sun, Moon, Bell, Globe, Download, Shield, Palette } from "lucide-react";

const tabs = ["Appearance", "Notifications", "General", "Security"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Appearance");
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true, push: true, budget: true, insights: false, weekly: true,
  });

  return (
    <div>
      <PageHeader title="Settings" description="Manage your preferences" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[var(--surface)] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all relative",
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
            <div className="flex gap-3">
              {["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/30 transition-all hover:scale-110"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "Notifications" && (
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-[var(--accent-fg)]" />
            <h2 className="text-base font-semibold">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
              { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
              { key: "budget", label: "Budget Alerts", desc: "When you exceed budget limits" },
              { key: "insights", label: "AI Insight Alerts", desc: "New AI recommendations" },
              { key: "weekly", label: "Weekly Summary", desc: "Weekly financial digest" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-[var(--muted-fg)]">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    notifications[item.key as keyof typeof notifications] ? "bg-[var(--primary)]" : "bg-[var(--surface)]"
                  )}
                >
                  <motion.div
                    animate={{ x: notifications[item.key as keyof typeof notifications] ? 18 : 2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white"
                  />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === "General" && (
        <div className="space-y-4">
          <GlassCard delay={0.1}>
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-[var(--accent-fg)]" />
              <h2 className="text-base font-semibold">Preferences</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Currency</label>
                <select className="w-full max-w-xs px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm">
                  <option>USD - US Dollar</option>
                  <option>EUR - Euro</option>
                  <option>GBP - British Pound</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Language</label>
                <select className="w-full max-w-xs px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </GlassCard>
          <GlassCard delay={0.15}>
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-5 h-5 text-[var(--accent-fg)]" />
              <h2 className="text-base font-semibold">Data Export</h2>
            </div>
            <p className="text-xs text-[var(--muted-fg)] mb-3">Download your financial data</p>
            <button className="px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Export as CSV
            </button>
          </GlassCard>
        </div>
      )}

      {activeTab === "Security" && (
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[var(--accent-fg)]" />
            <h2 className="text-base font-semibold">Security Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[var(--border-color)]">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-[var(--muted-fg)]">Add an extra layer of security</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--surface-elevated)] transition-colors">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[var(--border-color)]">
              <div>
                <p className="text-sm font-medium">Change Password</p>
                <p className="text-xs text-[var(--muted-fg)]">Update your password</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--surface-elevated)] transition-colors">
                Update
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">Active Sessions</p>
                <p className="text-xs text-[var(--muted-fg)]">Manage your logged-in devices</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--surface-elevated)] transition-colors">
                View
              </button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
