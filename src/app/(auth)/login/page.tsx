"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { authenticate } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, UtensilsCrossed, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await authenticate(login, password, callbackUrl);

      // If we get here, it means auth failed (success = redirect, never returns)
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#FFF5F5] to-[#FAFAFA] p-4">
      <div className="w-full max-w-md">
        {/* Logo i nagłówek */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block transition-transform hover:scale-105"
          >
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#FF4D4F] to-[#FF3B30] shadow-lg">
              <UtensilsCrossed className="h-8 w-8 text-white" />
            </div>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Witaj ponownie!
          </h1>
          <p className="text-gray-600">Zaloguj się do swojego konta DISHLY</p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#FF4D4F] transition-colors hover:text-[#FF3B30]"
          >
            ← Powrót do strony głównej
          </Link>
        </div>

        {/* Karta logowania */}
        <div className="rounded-3xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="animate-shake rounded-2xl bg-red-50 p-4 text-sm text-red-800 border border-red-100">
                {error}
              </div>
            )}

            {/* Login */}
            <div className="space-y-2">
              <label
                htmlFor="login"
                className="text-sm font-semibold text-gray-700"
              >
                Login
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="login"
                  type="text"
                  placeholder="Twój login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                  disabled={isPending}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isPending}
                  className="h-12 rounded-xl border-gray-200 pl-12 pr-12 transition-all focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Przycisk logowania */}
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-xl bg-linear-to-r from-[#FF4D4F] to-[#FF3B30] text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? (
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
