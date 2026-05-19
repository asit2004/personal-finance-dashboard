"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import { useUIStore } from "@/store/useUIStore";
import { useSession, signOut } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { Search, Bell, Sun, Moon, Command, User, Settings, LogOut } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-20 border-b border-[var(--border-color)] bg-[var(--bg)]/80 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6">

        {/* Search button */}
        <div className="flex-1 max-w-md">
          <button
            type="button"
            onClick={openCommandPalette}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
                       border border-[var(--border-color)] bg-[var(--surface)]
                       text-[var(--muted-fg)] text-sm text-left
                       active:bg-[var(--surface-elevated)] transition-colors"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="flex-1 truncate">Search transactions...</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md
                            bg-[var(--surface-elevated)] text-[10px] font-mono shrink-0">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 md:gap-2 ml-3 md:ml-4">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center
                       hover:bg-[var(--surface-elevated)] transition-colors
                       text-[var(--muted-fg)] hover:text-[var(--fg)]"
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
                       hover:bg-[var(--surface-elevated)] transition-colors
                       text-[var(--muted-fg)] hover:text-[var(--fg)]"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full
                             bg-[var(--primary)] ring-2 ring-[var(--bg)]" />
          </button>

          {/* Avatar with dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center
                         text-white text-xs font-bold hover:opacity-80 transition-opacity"
              aria-label="Account menu"
            >
              {getInitials(session?.user?.name ?? "U")}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 w-52 rounded-2xl border border-[var(--border-color)]
                             bg-[var(--card-bg)] shadow-xl backdrop-blur-xl overflow-hidden z-50"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-[var(--border-color)]">
                    <p className="text-sm font-semibold truncate">{session?.user?.name ?? "User"}</p>
                    <p className="text-xs text-[var(--muted-fg)] truncate">{session?.user?.email ?? ""}</p>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5 space-y-0.5">
                    <DropdownItem
                      href="/profile"
                      icon={<User className="w-4 h-4" />}
                      label="Profile"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <DropdownItem
                      href="/settings"
                      icon={<Settings className="w-4 h-4" />}
                      label="Settings"
                      onClick={() => setDropdownOpen(false)}
                    />
                  </div>

                  {/* Logout */}
                  <div className="p-1.5 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm
                                 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.header>
  );
}

function DropdownItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm
                 text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[var(--surface-elevated)]
                 transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
