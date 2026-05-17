"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { getInitials } from "@/lib/utils";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Command,
} from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);
  const user = useAuthStore((s) => s.user);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-20 h-16 flex items-center justify-between pl-14 pr-6 md:px-6 border-b border-[var(--border-color)]
                 bg-[var(--bg)]/60 backdrop-blur-xl"
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div
          role="button"
          onClick={openCommandPalette}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)]
                      bg-[var(--surface)] text-[var(--muted-fg)] text-sm cursor-pointer
                      hover:border-[var(--primary)]/20 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1">Search transactions...</span>
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--surface-elevated)] text-[10px] font-mono">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center
                     hover:bg-[var(--surface-elevated)] transition-colors text-[var(--muted-fg)] hover:text-[var(--fg)]"
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === "dark" ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {theme === "dark" ? (
              <Moon className="w-[18px] h-[18px]" />
            ) : (
              <Sun className="w-[18px] h-[18px]" />
            )}
          </motion.div>
        </button>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center
                     hover:bg-[var(--surface-elevated)] transition-colors text-[var(--muted-fg)] hover:text-[var(--fg)]"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--primary)] ring-2 ring-[var(--bg)]" />
        </button>

        {/* User avatar */}
        <div className="ml-1 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          {getInitials(user?.name ?? "U")}
        </div>
      </div>
    </motion.header>
  );
}
