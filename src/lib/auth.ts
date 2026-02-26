import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
          include: {
            workingAt: { select: { restaurantId: true } },
            ownedRestaurants: { select: { id: true }, take: 1 },
          },
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

        // Pobierz restaurantId w zależności od roli
        let restaurantId: string | undefined;
        if (user.role === "OWNER") {
          restaurantId = user.ownedRestaurants[0]?.id;
        } else if (user.role === "MANAGER" || user.role === "WORKER") {
          restaurantId = user.workingAt?.restaurantId ?? undefined;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          firstName: user.firstName,
          lastName: user.lastName,
          restaurantId,
          locationId: user.locationId ?? undefined,
        };
      },
    }),
  ],
  // Callbacks are inherited from authConfig (edge-compatible, no DB)
});
