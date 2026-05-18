import mongoose, { Document, Schema, Types } from "mongoose";
import type { TransactionCategory } from "./Transaction";

export interface IBudget extends Document {
  userId: Types.ObjectId;
  category: TransactionCategory;
  name: string;
  limit: number;
  period: "weekly" | "monthly" | "yearly";
  color: string;
  alertAt: number;          // percentage (0-100), alert when spent exceeds this
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: {
      type: String,
      enum: ["housing","food","transport","entertainment","shopping",
             "health","education","utilities","salary","freelance",
             "investment","transfer","other"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, min: 1 },
    period: { type: String, enum: ["weekly","monthly","yearly"], default: "monthly" },
    color: { type: String, default: "#818cf8" },
    alertAt: { type: Number, default: 80, min: 0, max: 100 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, category: 1 });

export const Budget =
  mongoose.models.Budget ?? mongoose.model<IBudget>("Budget", BudgetSchema);
