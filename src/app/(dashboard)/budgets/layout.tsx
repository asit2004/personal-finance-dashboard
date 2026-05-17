import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budgets",
  description: "Set spending limits, track progress, and stay on top of your monthly budgets.",
};

export default function BudgetsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
