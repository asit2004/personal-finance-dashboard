import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { OTP } from "@/lib/db/models/OTP";
import { sendOTP } from "@/lib/sms";

const PHONE_RE = /^\+91[6-9]\d{9}$/;

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !PHONE_RE.test(phone)) {
      return NextResponse.json(
        { error: "Enter a valid Indian mobile number (+91XXXXXXXXXX)" },
        { status: 400 }
      );
    }

    await connectDB();

    // Rate limit: max 3 OTPs per phone per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await OTP.countDocuments({
      phone,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentCount >= 3) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again in an hour." },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.create({ phone, otpHash, expiresAt });

    await sendOTP(phone, otp);

    // In dev (no SMS_PROVIDER), surface the OTP so devs can test without SMS
    const isDev = !process.env.SMS_PROVIDER;
    return NextResponse.json({
      success: true,
      ...(isDev && { devOtp: otp }),
    });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
