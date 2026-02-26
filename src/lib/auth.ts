import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          return null;
        }

        // Sprawdzenie isApproved odbywa się w middleware (przekierowanie do /pending-approval)
        // MANAGER i WORKER zawsze mają dostęp (konta tworzone przez Właściciela)
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as any;
        token.isApproved = user.isApproved;
        token.firstName = user.firstName;
        token.lastName = user.lastName;

        // Dla MANAGER/WORKER pobierz locationId i restaurantId
        if (user.role === "MANAGER" || user.role === "WORKER") {
          const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: {
              locationId: true,
              workingAt: { select: { restaurantId: true } },
            },
          });
          if (dbUser?.locationId) {
            token.locationId = dbUser.locationId;
            token.restaurantId = dbUser.workingAt?.restaurantId;
          }
        }
      }

      // Odśwież isApproved z bazy dla OWNER oczekujących na zatwierdzenie
      if (token.role === "OWNER" && !token.isApproved) {
        const freshUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { isApproved: true },
        });
        if (freshUser?.isApproved) {
          token.isApproved = true;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.isApproved = token.isApproved as boolean;

        if (token.firstName) {
          session.user.firstName = token.firstName as string;
        }
        if (token.lastName) {
          session.user.lastName = token.lastName as string;
        }

        // Jeśli użytkownik jest OWNER, znajdź jego restaurację
        if (token.role === "OWNER") {
          const restaurant = await db.restaurant.findFirst({
            where: { ownerId: token.id as string },
            select: { id: true },
          });
          session.user.restaurantId = restaurant?.id;
        }

        // Jeśli użytkownik jest MANAGER lub WORKER, przekaż locationId i restaurantId
        if (token.role === "MANAGER" || token.role === "WORKER") {
          session.user.locationId = token.locationId as string | undefined;
          session.user.restaurantId = token.restaurantId as string | undefined;
        }
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
});
