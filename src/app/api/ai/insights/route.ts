import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/db/models/Transaction";
import { Insight } from "@/lib/db/models/Insight";
import { generateAIInsights, TransactionSummary } from "@/lib/ai/insights";
import mongoose from "mongoose";

export const runtime = "nodejs";

/**
 * POST /api/ai/insights
 * Pulls the last 3 months of transactions, builds a summary, calls the AI,
 * stores the results in the Insight collection and returns them.
 */
export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keyPresent = !!process.env.OPENROUTER_API_KEY;
  const keyPrefix  = process.env.OPENROUTER_API_KEY?.slice(0, 10) ?? "undefined";
  console.log("[AI Insights] key present:", keyPresent, "prefix:", keyPrefix);

  if (!keyPresent) {
    return NextResponse.json(
      { error: "AI insights are not configured (OPENROUTER_API_KEY missing)", debug: { keyPresent, keyPrefix } },
      { status: 503 },
    );
  }

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);

  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── Aggregate data ────────────────────────────────────────────────────────────

  const [totals, byCategory, monthlyTrend, largest] = await Promise.all([
    // Income vs expenses over 3 months
    Transaction.aggregate([
      { $match: { userId, date: { $gte: threeMonthsAgo } } },
      { $group: { _id: "$type", total: { $sum: { $abs: "$amount" } }, count: { $sum: 1 } } },
    ]),

    // Spending by category over 3 months
    Transaction.aggregate([
      { $match: { userId, type: "expense", date: { $gte: threeMonthsAgo } } },
      { $group: { _id: "$category", amount: { $sum: { $abs: "$amount" } }, count: { $sum: 1 } } },
      { $sort: { amount: -1 } },
    ]),

    // Month-by-month income/expense for trend
    Transaction.aggregate([
      { $match: { userId, date: { $gte: threeMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: { $abs: "$amount" } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // Single largest expense
    Transaction.findOne({ userId, type: "expense", date: { $gte: threeMonthsAgo } })
      .sort({ amount: -1 })
      .select("description amount category")
      .lean(),
  ]);

  const totalIncome = totals.find((t) => t._id === "income")?.total ?? 0;
  const totalExpenses = totals.find((t) => t._id === "expense")?.total ?? 0;
  const totalCount = totals.reduce((s: number, t: { count: number }) => s + t.count, 0);
  const savingsRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
    : 0;
  const avgTransactionAmount = totalCount > 0 ? totalExpenses / totalCount : 0;

  const totalExpensesForPct = byCategory.reduce(
    (s: number, c: { amount: number }) => s + c.amount, 0
  );
  const topCategories = (byCategory as { _id: string; amount: number; count: number }[]).map((c) => ({
    category: c._id,
    amount: c.amount,
    count: c.count,
    pct: totalExpensesForPct > 0 ? Math.round((c.amount / totalExpensesForPct) * 100) : 0,
  }));

  // Build monthly trend array
  const monthMap: Record<string, { income: number; expenses: number }> = {};
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for (const row of monthlyTrend as { _id: { year: number; month: number; type: string }; total: number }[]) {
    const key = `${MONTH_NAMES[row._id.month - 1]} ${row._id.year}`;
    if (!monthMap[key]) monthMap[key] = { income: 0, expenses: 0 };
    if (row._id.type === "income") monthMap[key].income += row.total;
    else monthMap[key].expenses += row.total;
  }
  const monthlyTrendArr = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));

  // Detect unusual spikes: categories where this month >> 3-month avg
  const thisMonthByCategory = await Transaction.aggregate([
    { $match: { userId, type: "expense", date: { $gte: monthStart } } },
    { $group: { _id: "$category", amount: { $sum: { $abs: "$amount" } } } },
  ]) as { _id: string; amount: number }[];

  const unusualSpikes = thisMonthByCategory
    .map((c) => {
      const historical = topCategories.find((t) => t.category === c._id);
      const monthlyAvg = historical ? historical.amount / 3 : 0;
      return { category: c._id, thisMonth: c.amount, avg: Math.round(monthlyAvg) };
    })
    .filter((s) => s.avg > 0 && s.thisMonth > s.avg * 1.5 && s.thisMonth > 500)
    .sort((a, b) => b.thisMonth / (b.avg || 1) - a.thisMonth / (a.avg || 1))
    .slice(0, 3);

  const summary: TransactionSummary = {
    totalIncome,
    totalExpenses,
    savingsRate,
    topCategories,
    monthlyTrend: monthlyTrendArr,
    avgTransactionAmount,
    largestExpense: largest
      ? { description: (largest as { description: string; amount: number; category: string }).description, amount: (largest as { description: string; amount: number; category: string }).amount, category: (largest as { description: string; amount: number; category: string }).category }
      : null,
    unusualSpikes,
  };

  // ── Call AI ───────────────────────────────────────────────────────────────────

  const aiInsights = await generateAIInsights(summary);

  if (!aiInsights || aiInsights.length === 0) {
    return NextResponse.json({ error: "AI could not generate insights" }, { status: 500 });
  }

  // ── Store in DB ───────────────────────────────────────────────────────────────
  // Delete old AI insights for this user first (keep rule-based ones)
  await Insight.deleteMany({ userId, source: "ai" });

  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 h
  await Insight.insertMany(
    aiInsights.map((i) => ({
      userId,
      ...i,
      source: "ai",
      read: false,
      generatedAt: now,
      expiresAt,
    })),
  );

  return NextResponse.json({ data: aiInsights });
}
