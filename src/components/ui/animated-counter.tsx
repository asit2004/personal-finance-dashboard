"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  isCurrency = false,
  prefix = "",
  suffix = "",
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(springValue, (current) => {
    if (isCurrency) {
      return formatCurrency(current);
    }
    return current.toFixed(decimals);
  });

  useEffect(() => {
    springValue.set(value);
  }, [springValue, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [display]);

  return (
    <motion.span className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  );
}
