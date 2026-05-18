import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  name: string;
  amount: number;
  currency: string;
  billingCycle: "monthly" | "yearly" | "weekly";
  nextRenewal: Date;
  category: "streaming" | "saas" | "health" | "news" | "utilities" | "other";
  status: "active" | "paused" | "cancelled";
  logo?: string;
  transactionIds: Types.ObjectId[];
  detectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    billingCycle: { type: String, enum: ["monthly","yearly","weekly"], default: "monthly" },
    nextRenewal: { type: Date, required: true },
    category: {
      type: String,
      enum: ["streaming","saas","health","news","utilities","other"],
      default: "other",
    },
    status: { type: String, enum: ["active","paused","cancelled"], default: "active" },
    logo: { type: String },
    transactionIds: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
    detectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Subscription =
  mongoose.models.Subscription ??
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
