import mongoose, { Document, Schema } from "mongoose";

export interface IOTP extends Document {
  phone: string;
  otpHash: string;      // bcrypt hash — never store plain OTP
  attempts: number;     // max 3 wrong tries then invalidate
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  phone:     { type: String, required: true, index: true },
  otpHash:   { type: String, required: true },
  attempts:  { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

// MongoDB TTL — document auto-deleted after expiresAt
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP =
  mongoose.models.OTP ?? mongoose.model<IOTP>("OTP", OTPSchema);
