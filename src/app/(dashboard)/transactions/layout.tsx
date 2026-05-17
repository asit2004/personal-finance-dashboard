import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions",
  description: "View, search, and filter all your income and expense transactions.",
};

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
