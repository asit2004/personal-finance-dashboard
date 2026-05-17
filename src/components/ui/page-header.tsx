"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-[var(--muted-fg)] mt-1 text-sm">{description}</p>
      )}
    </motion.div>
  );
}
