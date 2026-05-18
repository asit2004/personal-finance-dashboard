import mongoose, { Document, Schema, Types } from "mongoose";
import type { TransactionCategory } from "./Transaction";

export interface IInsight extends Document {
  userId: Types.ObjectId;
  title: string;
  body: string;
  type: "warning" | "success" | "tip" | "info";
  impact: "high" | "medium" | "low";
  category?: TransactionCategory;
  actionLabel?: string;
  actionUrl?: string;
  read: boolean;
  generatedAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

const InsightSchema = new Schema<IInsight>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ["warning","success","tip","info"], required: true },
    impact: { type: String, enum: ["high","medium","low"], required: true },
    category: { type: String },
    actionLabel: { type: String },
    actionUrl: { type: String },
    read: { type: Boolean, default: false },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index — MongoDB auto-deletes insights after they expire
InsightSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
InsightSchema.index({ userId: 1, generatedAt: -1 });

export const Insight =
  mongoose.models.Insight ?? mongoose.model<IInsight>("Insight", InsightSchema);
