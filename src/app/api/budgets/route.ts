import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Budget } from "@/lib/db/models/Budget";
import { Transaction } from "@/lib/db/models/Transaction";
import { createBudgetSchema } from "@/lib/validations/budget";

// GET /api/budgets — list budgets with current period spend
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const budgets = await Budget.find({ userId: session.user.id, active: true }).lean();

  // Calculate current month spend for each budget in one aggregation
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const spendByCategory = await Transaction.aggregate([
    {
      $match: {
        userId: { $toObjectId: session.user.id },
        type: "expense",
        date: { $gte: monthStart, $lte: monthEnd },
        category: { $in: budgets.map((b) => b.category) },
      },
    },
    {
      $group: {
        _id: "$category",
        spent: { $sum: { $abs: "$amount" } },
      },
    },
  ]);

  const spendMap = new Map(spendByCategory.map((s) => [s._id, s.spent]));

  const enriched = budgets.map((b) => ({
    ...b,
    spent: spendMap.get(b.category) ?? 0,
  }));

  return NextResponse.json({ data: enriched });
}

// POST /api/budgets — create budget
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createBudgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await connectDB();

  const budget = await Budget.create({
    userId: session.user.id,
    ...parsed.data,
  });

  return NextResponse.json({ data: budget }, { status: 201 });
}
