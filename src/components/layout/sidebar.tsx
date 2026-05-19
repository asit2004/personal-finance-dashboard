"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  Sparkles,
  Settings,
  User,
  ChevronLeft,
  Zap,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    label: "Budgets",
    href: "/budgets",
    icon: PiggyBank,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "AI Insights",
    href: "/insights",
    icon: Sparkles,
    badge: 3,
  },
];

const bottomNavItems = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="font-bold text-sm whitespace-nowrap tracking-tight">
                FinanceAI
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <p
          className={cn(
            "text-[10px] uppercase tracking-widest text-[var(--muted-fg)] font-semibold mb-2 px-3",
            collapsed && "text-center px-0"
          )}
        >
          {collapsed ? "•" : "Menu"}
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-white"
                    : "text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--surface-elevated)]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl gradient-primary opacity-15"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full gradient-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("w-[18px] h-[18px] shrink-0 relative z-10", isActive && "text-[var(--accent-fg)]")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.badge && (
                  <span className="ml-auto text-[10px] font-bold bg-[var(--primary)] text-white w-5 h-5 rounded-full flex items-center justify-center relative z-10">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-2 space-y-1 border-t border-[var(--border-color)]">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "text-[var(--accent-fg)] bg-[var(--accent)]"
                    : "text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--surface-elevated)]"
                )}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}

        {/* Logout */}
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <div className="px-3 py-3 border-t border-[var(--border-color)]">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[var(--muted-fg)]
                       hover:text-[var(--fg)] hover:bg-[var(--surface-elevated)] transition-colors text-xs"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}
    </div>
  );

  // Mobile: bottom nav handles navigation — sidebar hidden on mobile
  if (isMobile) {
    return null;
  }

  // Desktop: fixed sidebar
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="fixed inset-y-0 left-0 z-30 border-r border-[var(--border-color)] bg-[var(--bg)]/80
                 backdrop-blur-xl hidden md:block"
    >
      {sidebarContent}
    </motion.aside>
  );
}
