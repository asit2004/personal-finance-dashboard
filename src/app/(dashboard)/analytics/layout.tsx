import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Deep dive into your financial trends, spending patterns, and savings trajectory.",
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
