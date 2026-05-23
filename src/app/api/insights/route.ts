import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Insight } from "@/lib/db/models/Insight";
import { Transaction } from "@/lib/db/models/Transaction";
import mongoose from "mongoose";

// Rule-based insight generator from real transaction data
async function generateInsights(userId: mongoose.Types.ObjectId) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const [thisMonth, lastMonth, byCategory] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId, date: { $gte: monthStart } } },
      { $group: { _id: "$type", total: { $sum: { $abs: "$amount" } } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: "$type", total: { $sum: { $abs: "$amount" } } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, type: "expense", date: { $gte: sixMonthsAgo } } },
      { $group: { _id: "$category", total: { $sum: { $abs: "$amount" } }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
  ]);

  const thisIncome = thisMonth.find((t) => t._id === "income")?.total ?? 0;
  const thisExpenses = thisMonth.find((t) => t._id === "expense")?.total ?? 0;
  const lastExpenses = lastMonth.find((t) => t._id === "expense")?.total ?? 0;
  const lastIncome = lastMonth.find((t) => t._id === "income")?.total ?? 0;

  const insights: Array<{
    title: string;
    body: string;
    type: "warning" | "success" | "tip" | "info";
    impact: "high" | "medium" | "low";
    category?: string;
    actionLabel?: string;
    actionUrl?: string;
  }> = [];

  // 1. Savings rate insight
  if (thisIncome > 0) {
    const savingsRate = Math.round(((thisIncome - thisExpenses) / thisIncome) * 100);
    if (savingsRate >= 20) {
      insights.push({
        title: "Great savings rate this month!",
        body: `You're saving ${savingsRate}% of your income this month. Keep it up — consistent saving is the foundation of financial health.`,
        type: "success",
        impact: "high",
        actionLabel: "View analytics",
        actionUrl: "/analytics",
      });
    } else if (savingsRate < 10 && savingsRate >= 0) {
      insights.push({
        title: "Your savings rate is low",
        body: `You're only saving ${savingsRate}% of your income this month. Aim for at least 20% to build a healthy financial cushion.`,
        type: "warning",
        impact: "high",
        actionLabel: "Set a budget",
        actionUrl: "/budgets",
      });
    } else if (savingsRate < 0) {
      insights.push({
        title: "You're spending more than you earn",
        body: `Your expenses exceed your income by ₹${Math.abs(thisIncome - thisExpenses).toLocaleString("en-IN")} this month. Review your spending to avoid debt.`,
        type: "warning",
        impact: "high",
        actionLabel: "Review transactions",
        actionUrl: "/transactions",
      });
    }
  }

  // 2. Spending vs last month
  if (lastExpenses > 0 && thisExpenses > 0) {
    const change = Math.round(((thisExpenses - lastExpenses) / lastExpenses) * 100);
    if (change >= 20) {
      insights.push({
        title: `Spending up ${change}% vs last month`,
        body: `You've spent ₹${thisExpenses.toLocaleString("en-IN")} so far this month compared to ₹${lastExpenses.toLocaleString("en-IN")} last month. Check what's driving the increase.`,
        type: "warning",
        impact: "medium",
        actionLabel: "See breakdown",
        actionUrl: "/analytics",
      });
    } else if (change <= -10) {
      insights.push({
        title: `Spending down ${Math.abs(change)}% vs last month`,
        body: `You've reduced your spending by ${Math.abs(change)}% compared to last month. Great discipline!`,
        type: "success",
        impact: "medium",
      });
    }
  }

  // 3. Top spending category
  if (byCategory.length > 0) {
    const top = byCategory[0];
    const totalSpend = byCategory.reduce((s: number, c: { total: number }) => s + c.total, 0);
    const pct = totalSpend > 0 ? Math.round((top.total / totalSpend) * 100) : 0;
    if (pct > 40) {
      insights.push({
        title: `${top._id.charAt(0).toUpperCase() + top._id.slice(1)} is ${pct}% of your spending`,
        body: `Over the last 6 months, ${top._id} accounts for ${pct}% of all your expenses (₹${top.total.toLocaleString("en-IN")}). Consider setting a budget for this category.`,
        type: "info",
        impact: "medium",
        category: top._id,
        actionLabel: "Set budget",
        actionUrl: "/budgets",
      });
    }
  }

  // 4. Income up vs last month
  if (lastIncome > 0 && thisIncome > lastIncome) {
    const increase = Math.round(((thisIncome - lastIncome) / lastIncome) * 100);
    if (increase >= 10) {
      insights.push({
        title: `Income up ${increase}% this month`,
        body: `Your income increased by ${increase}% compared to last month. Consider putting the extra ₹${(thisIncome - lastIncome).toLocaleString("en-IN")} into savings or investments.`,
        type: "tip",
        impact: "medium",
      });
    }
  }

  // 5. Generic tip if no data or few insights
  if (insights.length === 0) {
    insights.push({
      title: "Start tracking to get insights",
      body: "Add your income and expense transactions regularly. Once you have enough data, AI-powered insights will appear here to help you make smarter financial decisions.",
      type: "tip",
      impact: "low",
      actionLabel: "Add transaction",
      actionUrl: "/transactions",
    });
  }

  // 6. Always include an emergency fund tip
  insights.push({
    title: "Build a 3-month emergency fund",
    body: "Financial experts recommend keeping 3–6 months of expenses in an easily accessible savings account. This protects you from unexpected job loss or medical expenses.",
    type: "tip",
    impact: "low",
  });

  // Save all to DB with 7-day expiry
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await Insight.insertMany(
    insights.map((i) => ({ userId, ...i, source: "rule", read: false, generatedAt: now, expiresAt }))
  );
}

// GET /api/insights
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);

  // Check for existing fresh insights
  let existing = await Insight.find({ userId, expiresAt: { $gt: new Date() } })
    .sort({ generatedAt: -1 })
    .lean();

  // Generate new ones if none exist
  if (existing.length === 0) {
    await generateInsights(userId);
    existing = await Insight.find({ userId, expiresAt: { $gt: new Date() } })
      .sort({ generatedAt: -1 })
      .lean();
  }

  return NextResponse.json({ data: existing });
}

// PATCH /api/insights — mark all as read
export async function PATCH() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await Insight.updateMany(
    { userId: new mongoose.Types.ObjectId(session.user.id), read: false },
    { $set: { read: true } }
  );
  return NextResponse.json({ success: true });
}
