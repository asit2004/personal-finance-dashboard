"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Sparkles,
  Plus,
  BarChart3,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/",             icon: LayoutDashboard, label: "Home"         },
  { href: "/transactions", icon: ArrowLeftRight,  label: "Transactions" },
  { href: null,            icon: Plus,            label: "Add"          }, // FAB
  { href: "/analytics",    icon: BarChart3,       label: "Analytics"    },
  { href: "/budgets",      icon: PiggyBank,       label: "Budgets"      },
];

export function BottomNav() {
  const pathname = usePathname();
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden">
      {/* Frosted glass bar */}
      <div
        className="flex items-center justify-around h-16 px-2
                   bg-[var(--bg)]/80 backdrop-blur-xl
                   border-t border-[var(--border-color)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV_ITEMS.map((item) => {
          // Central FAB — Add Transaction
          if (item.href === null) {
            return (
              <button
                key="add"
                onClick={openAddTransaction}
                className="relative -top-5 w-14 h-14 rounded-2xl gradient-primary
                           flex items-center justify-center shadow-lg shadow-[var(--primary)]/40
                           active:scale-95 transition-transform"
                aria-label="Add transaction"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full pt-1
                         active:scale-95 transition-transform"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="bottomNavBubble"
                    className="absolute inset-0 -m-1.5 rounded-xl gradient-primary opacity-15"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "w-5 h-5 relative z-10 transition-colors",
                    isActive ? "text-[var(--accent-fg)]" : "text-[var(--muted-fg)]"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-[var(--accent-fg)]" : "text-[var(--muted-fg)]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
