"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, UtensilsCrossed } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "Account pending approval") {
          setError(
            "Twoje konto oczekuje na zatwierdzenie przez administratora.",
          );
        } else {
          setError("Nieprawidłowy email lub hasło");
        }
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError("Wystąpił błąd podczas logowania");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#FFF5F5] to-[#FAFAFA] p-4">
      <div className="w-full max-w-md">
        {/* Logo i nagłówek */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#FF4D4F] to-[#FF3B30] shadow-lg">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Witaj ponownie!
          </h1>
          <p className="text-gray-600">Zaloguj się do swojego konta DISHLY</p>
        </div>

        {/* Karta logowania */}
        <div className="rounded-3xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="animate-shake rounded-2xl bg-red-50 p-4 text-sm text-red-800 border border-red-100">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl border-gray-200 pl-12 pr-4 transition-all focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
                />
              </div>
            </div>

            {/* Hasło */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700"
              >
                Hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl border-gray-200 pl-12 pr-4 transition-all focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
                />
              </div>
            </div>

            {/* Przycisk logowania */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-linear-to-r from-[#FF4D4F] to-[#FF3B30] text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Logowanie...
                </span>
              ) : (
                "Zaloguj się"
              )}
            </Button>
          </form>

          {/* Linki rejestracji */}
          <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
            <p className="text-center text-sm text-gray-600">
              Nie masz konta?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#FF4D4F] transition-colors hover:text-[#FF3B30]"
              >
                Zarejestruj się jako klient
              </Link>
            </p>
            <p className="text-center text-sm text-gray-600">
              Prowadzisz restaurację?{" "}
              <Link
                href="/register-owner"
                className="font-semibold text-[#FF4D4F] transition-colors hover:text-[#FF3B30]"
              >
                Dołącz do DISHLY
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
