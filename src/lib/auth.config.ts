import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Edge-compatible NextAuth config.
 * NO Prisma imports here — this file runs in Edge Runtime (middleware).
 * DB calls are in auth.ts authorize() only.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize is defined in auth.ts (Node.js runtime only)
      authorize: () => null,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isApproved = (user as any).isApproved;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.restaurantId = (user as any).restaurantId;
        token.locationId = (user as any).locationId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.isApproved = token.isApproved as boolean;
        session.user.firstName = token.firstName as string | undefined;
        session.user.lastName = token.lastName as string | undefined;
        session.user.restaurantId = token.restaurantId as string | undefined;
        session.user.locationId = token.locationId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
};
