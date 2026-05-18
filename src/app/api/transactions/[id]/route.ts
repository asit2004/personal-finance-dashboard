import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/db/models/Transaction";
import { updateTransactionSchema } from "@/lib/validations/transaction";

// GET /api/transactions/:id
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const transaction = await Transaction.findOne({ _id: id, userId: session.user.id });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: transaction });
}

// PATCH /api/transactions/:id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await connectDB();

  const { amount, type, date, ...rest } = parsed.data;
  const updates: Record<string, unknown> = { ...rest };

  if (amount !== undefined && type !== undefined) {
    updates.amount = type === "expense" ? -Math.abs(amount) : Math.abs(amount);
    updates.type = type;
  }
  if (date) updates.date = new Date(date);

  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: updates },
    { new: true }
  );

  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: transaction });
}

// DELETE /api/transactions/:id
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const transaction = await Transaction.findOneAndDelete({ _id: id, userId: session.user.id });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: { deleted: true } });
}
