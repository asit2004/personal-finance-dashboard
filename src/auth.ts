import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { OTP } from "@/lib/db/models/OTP";
import { z } from "zod";
import { authConfig } from "./auth.config";

const emailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const phoneSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/),
  otp: z.string().length(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Unified Credentials — routes to email or phone-OTP based on which fields arrive
    Credentials({
      credentials: {
        email: {},
        password: {},
        phone: {},
        otp: {},
      },
      async authorize(credentials) {
        await connectDB();

        // ── Phone OTP flow ──────────────────────────────────────────────
        const phoneResult = phoneSchema.safeParse(credentials);
        if (phoneResult.success) {
          const { phone, otp } = phoneResult.data;

          const record = await OTP.findOne({
            phone,
            expiresAt: { $gt: new Date() },
          }).sort({ createdAt: -1 });

          if (!record) return null;

          if (record.attempts >= 3) {
            await OTP.deleteOne({ _id: record._id });
            return null;
          }

          const valid = await bcrypt.compare(otp, record.otpHash);
          if (!valid) {
            await OTP.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
            return null;
          }

          await OTP.deleteOne({ _id: record._id });

          let user = await User.findOne({ phone });
          if (!user) {
            user = await User.create({
              name: phone,
              phone,
              plan: "free",
              currency: "INR",
            });
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email ?? null,
            image: user.avatar ?? null,
            plan: user.plan,
            currency: user.currency,
          };
        }

        // ── Email + password flow ───────────────────────────────────────
        const emailResult = emailSchema.safeParse(credentials);
        if (emailResult.success) {
          const { email, password } = emailResult.data;

          const user = await User.findOne({ email }).select("+password");
          if (!user || !user.password) return null;

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.avatar,
            plan: user.plan,
            currency: user.currency,
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id ?? "";
        token.plan = (user as { plan?: string }).plan ?? "free";
        token.currency = (user as { currency?: string }).currency ?? "INR";
      }

      // Google OAuth — create/find user on first sign-in
      if (account?.provider === "google" && token.email) {
        await connectDB();
        const existing = await User.findOne({ email: token.email });
        if (!existing) {
          const created = await User.create({
            name: token.name,
            email: token.email,
            avatar: token.picture,
            plan: "free",
            currency: "INR",
          });
          token.id = created._id.toString();
          token.plan = "free";
          token.currency = "INR";
        } else {
          token.id = existing._id.toString();
          token.plan = existing.plan;
          token.currency = existing.currency;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.plan = token.plan as string;
        session.user.currency = token.currency as string;
      }
      return session;
    },
  },
});
