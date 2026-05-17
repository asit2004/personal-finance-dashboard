import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  from?: string;
  to?: string;
  via?: string;
}

export function GradientText({
  children,
  className,
  from = "#818cf8",
  to = "#22d3ee",
  via,
}: GradientTextProps) {
  const gradient = via
    ? `linear-gradient(135deg, ${from}, ${via}, ${to})`
    : `linear-gradient(135deg, ${from}, ${to})`;

  return (
    <span
      className={cn("inline-block", className)}
      style={{
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}
