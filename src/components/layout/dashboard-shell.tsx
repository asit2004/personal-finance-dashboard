"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-media-query";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
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
    </div>
  );
}
