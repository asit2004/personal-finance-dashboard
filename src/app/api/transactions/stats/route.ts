import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/db/models/Transaction";
import mongoose from "mongoose";

// GET /api/transactions/stats — aggregated stats for dashboard
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const months = Math.min(parseInt(searchParams.get("months") ?? "6"), 12);

  const since = new Date();
  since.setMonth(since.getMonth() - months);

  await connectDB();

  const userId = new mongoose.Types.ObjectId(session.user.id);

  const [totals, byCategory, monthly] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId, date: { $gte: since } } },
      { $group: { _id: "$type", total: { $sum: { $abs: "$amount" } }, count: { $sum: 1 } } },
    ]),

    Transaction.aggregate([
      { $match: { userId, type: "expense", date: { $gte: since } } },
      { $group: { _id: "$category", total: { $sum: { $abs: "$amount" } }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),

    Transaction.aggregate([
      { $match: { userId, date: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
          total: { $sum: { $abs: "$amount" } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  const income = totals.find((t) => t._id === "income")?.total ?? 0;
  const expenses = totals.find((t) => t._id === "expense")?.total ?? 0;

  // Reshape monthly into { month, income, expenses, savings }[]
  const monthlyMap = new Map<string, { income: number; expenses: number }>();
  monthly.forEach(({ _id, total }: { _id: { year: number; month: number; type: string }; total: number }) => {
    const key = `${_id.year}-${String(_id.month).padStart(2, "0")}`;
    const entry = monthlyMap.get(key) ?? { income: 0, expenses: 0 };
    if (_id.type === "income") entry.income = total;
    else entry.expenses = total;
    monthlyMap.set(key, entry);
  });

  const monthlyData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { income, expenses }]) => {
      const [year, month] = key.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        month: date.toLocaleString("default", { month: "short" }),
        income,
        expenses,
        savings: income - expenses,
      };
    });

  return NextResponse.json({
    data: { income, expenses, savings: income - expenses,
      savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
      byCategory, monthly: monthlyData },
  });
}
