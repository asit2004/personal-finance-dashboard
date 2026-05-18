import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FinanceAI",
  },
  formatDetection: { telephone: false },
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
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen antialiased" style={{ fontFamily: "var(--font-inter), var(--font-sans)" }}>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
