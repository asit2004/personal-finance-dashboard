import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;        // undefined for OAuth users
  avatar?: string;
  plan: "free" | "pro" | "enterprise";
  currency: "INR" | "USD" | "EUR";
  onboardingComplete: boolean;
  monthlyIncome?: number;
  savingsGoal?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },  // never returned by default
    avatar: { type: String },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    currency: { type: String, enum: ["INR", "USD", "EUR"], default: "INR" },
    onboardingComplete: { type: Boolean, default: false },
    monthlyIncome: { type: Number, min: 0 },
    savingsGoal: { type: Number, min: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate model registration during hot-reload
export const User = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
