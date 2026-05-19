import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { z } from "zod";
import { authConfig } from "./auth.config";

const emailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const result = emailSchema.safeParse(credentials);
        if (!result.success) return null;

        const { email, password } = result.data;

        await connectDB();
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
