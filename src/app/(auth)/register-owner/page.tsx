"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Lock,
  User,
  Phone,
  Store,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function RegisterOwnerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    restaurantName: "",
    restaurantBio: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setError("");

    if (step === 1) {
      // Walidacja kroku 1
      if (!formData.firstName || !formData.lastName) {
        setError("Imię i nazwisko są wymagane");
        return;
      }
      if (!formData.email) {
        setError("Email jest wymagany");
        return;
      }
      if (!formData.phone) {
        setError("Telefon jest wymagany");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Walidacja kroku 2
      if (!formData.restaurantName) {
        setError("Nazwa restauracji jest wymagana");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Walidacja
    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są zgodne");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register-owner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Wystąpił błąd podczas rejestracji");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      setError("Wystąpił błąd podczas rejestracji");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#FFF5F5] to-[#FAFAFA] p-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-green-600 shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Rejestracja Udana!
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Twoje konto zostało utworzone i oczekuje na zatwierdzenie przez
              administratora. Otrzymasz powiadomienie email gdy Twoje konto
              zostanie aktywowane.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#FF4D4F]" />
              Przekierowanie do logowania...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#FFF5F5] to-[#FAFAFA] p-4">
      <div className="w-full max-w-2xl">
        {/* Logo i nagłówek */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#FF4D4F] to-[#FF3B30] shadow-lg">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Rejestracja Restauracji
          </h1>
          <p className="text-gray-600">
            Dołącz do platformy DISHLY i zacznij przyjmować zamówienia online
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                step >= 1
                  ? "bg-[#FF4D4F] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
            </div>
            <div
              className={`h-1 w-12 rounded-full transition-all ${
                step >= 2 ? "bg-[#FF4D4F]" : "bg-gray-200"
              }`}
            />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                step >= 2
                  ? "bg-[#FF4D4F] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : "2"}
            </div>
            <div
              className={`h-1 w-12 rounded-full transition-all ${
                step >= 3 ? "bg-[#FF4D4F]" : "bg-gray-200"
              }`}
            />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                step >= 3
                  ? "bg-[#FF4D4F] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
          </div>
        </div>

        {/* Karta rejestracji */}
        <div className="rounded-3xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="animate-shake rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Krok 1: Dane osobowe */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900">
                  Dane osobowe
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Imię *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Jan"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="h-12 rounded-xl border-gray-200 pl-12 transition-all focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Nazwisko *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Kowalski"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="h-12 rounded-xl border-gray-200 pl-12 transition-all focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="kontakt@restauracja.pl"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="h-12 rounded-xl border-gray-200 pl-12 transition-all focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Telefon *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+48 123 456 789"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="h-12 rounded-xl border-gray-200 pl-12 transition-all focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-12 w-full rounded-xl bg-linear-to-r from-[#FF4D4F] to-[#FF3B30] text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                >
                  Dalej
                </Button>
              </div>
            )}

            {/* Krok 2: Dane restauracji */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900">
                  Dane restauracji
                </h3>

                <div className="space-y-2">
                  <label
                    htmlFor="restaurantName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Nazwa restauracji *
                  </label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="restaurantName"
                      name="restaurantName"
                      type="text"
                      placeholder="Moja Restauracja"
                      value={formData.restaurantName}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="h-12 rounded-xl border-gray-200 pl-12 transition-all focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="restaurantBio"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Opis restauracji
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <textarea
                      id="restaurantBio"
                      name="restaurantBio"
                      placeholder="Krótki opis Twojej restauracji..."
                      value={formData.restaurantBio}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="min-h-30 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-12 text-sm transition-all placeholder:text-gray-400 focus:border-[#FF4D4F] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="h-12 flex-1 rounded-xl border-2 border-gray-200 transition-all hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                  >
                    Wstecz
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-12 flex-1 rounded-xl bg-linear-to-r from-[#FF4D4F] to-[#FF3B30] text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                  >
                    Dalej
                  </Button>
                </div>
              </div>
            )}

            {/* Krok 3: Zabezpieczenia */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900">
                  Zabezpieczenia
                </h3>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Hasło *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl border-gray-200 pl-12 transition-all focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Minimum 8 znaków</p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Potwierdź hasło *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl border-gray-200 pl-12 transition-all focus:border-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
                    />
                  </div>
                </div>

                {/* Informacja o zatwierdzeniu */}
                <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Wymagane zatwierdzenie</p>
                    <p className="mt-1 text-blue-700">
                      Twoje konto wymaga zatwierdzenia przez administratora
                      przed rozpoczęciem korzystania z platformy.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="h-12 flex-1 rounded-xl border-2 border-gray-200 transition-all hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                  >
                    Wstecz
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 flex-1 rounded-xl bg-linear-to-r from-[#FF4D4F] to-[#FF3B30] text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Rejestracja...
                      </span>
                    ) : (
                      "Zarejestruj restaurację"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Link do logowania */}
          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Masz już konto?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#FF4D4F] transition-colors hover:text-[#FF3B30]"
              >
                Zaloguj się
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
