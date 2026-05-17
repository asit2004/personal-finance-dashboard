import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — FinanceAI",
    default: "FinanceAI",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 py-12">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      {children}
    </div>
  );
}
