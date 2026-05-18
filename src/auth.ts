import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        await connectDB();

        // select: false on password field — must explicitly request it
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
    // Persist extra fields into the JWT
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id ?? "";
        token.plan = (user as { plan?: string }).plan ?? "free";
        token.currency = (user as { currency?: string }).currency ?? "INR";
      }

      // Google OAuth — create user on first sign-in
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

    // Expose JWT fields to the session object the client sees
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
