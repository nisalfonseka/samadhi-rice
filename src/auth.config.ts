import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no Prisma / bcrypt). Imported by middleware and
 * extended in `auth.ts` with the Credentials provider for the Node runtime.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const role = auth?.user?.role;
      const { pathname } = nextUrl;

      if (pathname.startsWith("/admin")) {
        if (isLoggedIn && role === "ADMIN") return true;
        // logged-in non-admins are sent home; guests go to the login page
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return false;
      }

      if (pathname.startsWith("/account")) return isLoggedIn;

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
