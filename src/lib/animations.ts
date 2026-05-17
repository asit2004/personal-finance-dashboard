import type { Variants, Transition } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// ─── Transitions ────────────────────────────────────────────────────
export const smoothTransition: Transition = { duration: 0.4, ease };
export const fastTransition: Transition = { duration: 0.25, ease };
export const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 28,
};

// ─── Variants ───────────────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease } },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease } },
};

// ─── Stagger containers ─────────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};
