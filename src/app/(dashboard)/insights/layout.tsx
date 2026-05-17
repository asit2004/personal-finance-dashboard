import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Insights",
  description: "Smart AI-powered recommendations and alerts based on your spending patterns.",
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
