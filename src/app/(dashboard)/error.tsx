"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { fadeUp } from "@/lib/animations";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-400/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-[var(--muted-fg)] text-sm mb-8 leading-relaxed">
          {error.message || "An unexpected error occurred. Please try again or return to the dashboard."}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium
                       hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-color)]
                       text-sm font-medium hover:bg-[var(--surface-elevated)] transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
