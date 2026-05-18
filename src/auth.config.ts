import type { NextAuthConfig } from "next-auth";

// Lightweight config — NO database imports, safe for Edge Runtime.
// Used only by middleware to verify the JWT session token.
// The full auth.ts (with Mongoose + bcrypt) is used by API routes only.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");
      const isApiAuth = pathname.startsWith("/api/auth");

      // Always allow the auth API routes through
      if (isApiAuth) return true;

      // Logged-in users should not see login/register
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // Unauthenticated users can access login/register
      if (!isLoggedIn && isAuthPage) return true;

      // Everything else requires a session
      if (!isLoggedIn) return false; // NextAuth redirects to signIn page

      return true;
    },
  },

  providers: [], // Providers not needed for edge middleware — only for sign-in
};
