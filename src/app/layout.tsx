import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FinanceAI — Smart Personal Finance Dashboard",
    template: "%s — FinanceAI",
  },
  description:
    "AI-powered personal finance dashboard. Track spending, manage budgets, and get intelligent insights to optimize your financial health.",
  keywords: ["finance", "dashboard", "AI", "budgets", "spending", "analytics"],
  authors: [{ name: "FinanceAI" }],
  creator: "FinanceAI",
  openGraph: {
    type: "website",
    title: "FinanceAI — Smart Personal Finance Dashboard",
    description: "AI-powered personal finance dashboard with intelligent insights.",
    siteName: "FinanceAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinanceAI — Smart Personal Finance Dashboard",
    description: "AI-powered personal finance dashboard with intelligent insights.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased" style={{ fontFamily: "var(--font-inter), var(--font-sans)" }}>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
