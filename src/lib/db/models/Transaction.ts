import mongoose, { Document, Schema, Types } from "mongoose";

export type TransactionCategory =
  | "housing" | "food" | "transport" | "entertainment"
  | "shopping" | "health" | "education" | "utilities"
  | "salary" | "freelance" | "investment" | "transfer" | "other";

export type PaymentMethod = "upi" | "card" | "cash" | "netbanking" | "wallet";
export type TransactionSource = "manual" | "sms" | "csv" | "api";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  description: string;
  merchant: string;
  amount: number;           // positive = income, negative = expense
  type: "income" | "expense";
  category: TransactionCategory;
  subCategory?: string;
  paymentMethod: PaymentMethod;
  date: Date;
  recurring: boolean;
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
  tags: string[];
  note?: string;
  status: TransactionStatus;
  source: TransactionSource;
  rawSmsText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    description: { type: String, required: true, trim: true },
    merchant: { type: String, default: "", trim: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: {
      type: String,
      enum: ["housing","food","transport","entertainment","shopping",
             "health","education","utilities","salary","freelance",
             "investment","transfer","other"],
      default: "other",
    },
    subCategory: { type: String },
    paymentMethod: {
      type: String,
      enum: ["upi","card","cash","netbanking","wallet"],
      default: "upi",
    },
    date: { type: Date, required: true, index: true },
    recurring: { type: Boolean, default: false },
    recurringInterval: {
      type: String,
      enum: ["daily","weekly","monthly","yearly"],
    },
    tags: [{ type: String }],
    note: { type: String },
    status: {
      type: String,
      enum: ["completed","pending","failed"],
      default: "completed",
    },
    source: {
      type: String,
      enum: ["manual","sms","csv","api"],
      default: "manual",
    },
    rawSmsText: { type: String },
  },
  { timestamps: true }
);

// Compound indexes for the most common query patterns
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, date: -1 });

export const Transaction =
  mongoose.models.Transaction ??
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
