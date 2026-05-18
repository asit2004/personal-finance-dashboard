import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Next.js 16 renamed middleware.ts → proxy.ts.
// Only the lightweight authConfig runs here — no Mongoose, no bcrypt,
// no Node.js stream module. Pure JWT verification on the Edge Runtime.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
