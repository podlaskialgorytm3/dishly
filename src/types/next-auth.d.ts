import { DefaultSession } from "next-auth";

// Typy Role dopóki Prisma Client nie jest wygenerowany
type Role = "ADMIN" | "OWNER" | "MANAGER" | "WORKER" | "CLIENT";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      isApproved: boolean;
      restaurantId?: string;
      firstName?: string;
      lastName?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    role: Role;
    isApproved: boolean;
    firstName?: string | null;
    lastName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    isApproved: boolean;
    firstName?: string | null;
    lastName?: string | null;
  }
}
