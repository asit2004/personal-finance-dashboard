import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/db/models/Transaction";
import { createTransactionSchema, transactionFiltersSchema } from "@/lib/validations/transaction";

// GET /api/transactions — paginated, filtered list
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const parsed = transactionFiltersSchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { page, limit, search, category, type, paymentMethod, dateFrom, dateTo, sortBy, sortDir } = parsed.data;

  await connectDB();

  // Build MongoDB filter
  const filter: Record<string, unknown> = { userId: session.user.id };

  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: "i" } },
      { merchant: { $regex: search, $options: "i" } },
    ];
  }
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (dateFrom || dateTo) {
    filter.date = {
      ...(dateFrom && { $gte: new Date(dateFrom) }),
      ...(dateTo && { $lte: new Date(dateTo + "T23:59:59.999Z") }),
    };
  }

  const sortField = sortBy === "description" ? "description" : sortBy;
  const sortOrder = sortDir === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return NextResponse.json({
    data: transactions,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/transactions — create new transaction
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { amount, type, date, ...rest } = parsed.data;

  await connectDB();

  // Normalize: expense amounts are always stored negative
  const normalizedAmount = type === "expense" ? -Math.abs(amount) : Math.abs(amount);

  const transaction = await Transaction.create({
    userId: session.user.id,
    ...rest,
    amount: normalizedAmount,
    type,
    date: new Date(date),
    source: "manual",
  });

  return NextResponse.json({ data: transaction }, { status: 201 });
}
