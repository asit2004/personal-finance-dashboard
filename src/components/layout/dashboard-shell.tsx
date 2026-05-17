"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CommandPalette } from "@/components/ui/command-palette";
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal";
import { useUIStore } from "@/store/useUIStore";
import { useIsMobile } from "@/hooks/use-media-query";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);
  const isMobile = useIsMobile();

  // Global keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openCommandPalette();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "t" && !e.shiftKey) {
        e.preventDefault();
        openAddTransaction();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCommandPalette, openAddTransaction]);

  return (
    <div className="min-h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <motion.div
        animate={{
          marginLeft: isMobile ? 0 : sidebarCollapsed ? 72 : 260,
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        className="min-h-screen flex flex-col"
      >
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </motion.div>

      {/* Global overlays — mounted once at shell level */}
      <CommandPalette />
      <AddTransactionModal />
    </div>
  );
}
