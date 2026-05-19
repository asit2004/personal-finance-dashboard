import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  avatar?: string;
  plan: "free" | "pro" | "enterprise";
  currency: "INR" | "USD" | "EUR";
  onboardingComplete: boolean;
  monthlyIncome?: number;
  savingsGoal?: number;
  bio?: string;
  location?: string;
  jobTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, select: false },
    avatar: { type: String },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    currency: { type: String, enum: ["INR", "USD", "EUR"], default: "INR" },
    onboardingComplete: { type: Boolean, default: false },
    monthlyIncome: { type: Number, min: 0 },
    savingsGoal: { type: Number, min: 0 },
    bio: { type: String, maxlength: 300 },
    location: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
  },
  { timestamps: true }
);

// Force schema refresh in dev so hot-reload picks up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models["User"];
}
export const User = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
