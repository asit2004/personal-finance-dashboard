import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Budget } from "@/lib/db/models/Budget";
import { updateBudgetSchema } from "@/lib/validations/budget";

// PATCH /api/budgets/:id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateBudgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await connectDB();

  const budget = await Budget.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: parsed.data },
    { new: true }
  );

  if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: budget });
}

// DELETE /api/budgets/:id — soft delete (set active: false)
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const budget = await Budget.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { $set: { active: false } },
    { new: true }
  );

  if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: { deleted: true } });
}
