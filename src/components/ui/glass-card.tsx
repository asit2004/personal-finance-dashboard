"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef, type ReactNode } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "purple" | "pink" | "green" | "none";
  hoverable?: boolean;
  delay?: number;
}

const glowMap = {
  cyan: "hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]",
  purple: "hover:shadow-[0_0_30px_rgba(167,139,250,0.1)]",
  pink: "hover:shadow-[0_0_30px_rgba(244,114,182,0.1)]",
  green: "hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]",
  none: "",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { children, className, glow = "none", hoverable = true, delay = 0, ...props },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94] as const,
        }}
        className={cn(
          "glass-card card-shine p-4 md:p-6",
          hoverable && "cursor-default",
          hoverable && glowMap[glow],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
