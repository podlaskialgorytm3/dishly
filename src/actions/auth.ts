"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  email: string,
  password: string,
  redirectTo: string = "/dashboard",
) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false as const,
            error: "Nieprawidłowy login lub hasło",
          };
        default:
          return {
            success: false as const,
            error: "Wystąpił błąd podczas logowania",
          };
      }
    }
    // Re-throw redirect errors and other non-auth errors
    // Next.js redirect is thrown as an error that must be re-thrown
    throw error;
  }
}
