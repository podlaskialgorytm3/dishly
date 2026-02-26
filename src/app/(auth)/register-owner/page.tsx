"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
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
  CreditCard,
  Zap,
  Building,
  Crown,
} from "lucide-react";

type Plan = {
  id: string;
  name: string;
  price: string;
  currency: string;
  interval: string;
  maxLocations: number;
  maxStaffAccounts: number;
  maxMeals: number;
  description?: string | null;
};

export default function RegisterOwnerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    restaurantName: "",
    restaurantBio: "",
    planId: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data.plans ?? []);
        setLoadingPlans(false);
      })
      .catch(() => setLoadingPlans(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!formData.firstName || !formData.lastName) { setError("Imie i nazwisko sa wymagane"); return; }
      if (!formData.email) { setError("Email jest wymagany"); return; }
      if (!formData.phone) { setError("Telefon jest wymagany"); return; }
      setStep(2);
    } else if (step === 2) {
      if (!formData.restaurantName) { setError("Nazwa restauracji jest wymagana"); return; }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (formData.password !== formData.confirmPassword) { setError("Hasla nie sa zgodne"); setIsLoading(false); return; }
    if (formData.password.length < 8) { setError("Haslo musi miec co najmniej 8 znakow"); setIsLoading(false); return; }
    try {
      const response = await fetch("/api/auth/register-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Wystapil blad podczas rejestracji");
        toast.error(data.error || "Wystapil blad podczas rejestracji");
      } else {
        setSuccess(true);
        toast.success("Restauracja zarejestrowana! Oczekuje na zatwierdzenie administratora.");
        setTimeout(() => { router.push("/login"); }, 3000);
      }
    } catch {
      setError("Wystapil blad podczas rejestracji");
      toast.error("Wystapil blad podczas rejestracji");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("starter") || lower.includes("basic")) return <Building className="h-6 w-6" />;
    if (lower.includes("pro") || lower.includes("business")) return <Zap className="h-6 w-6" />;
    return <Crown className="h-6 w-6" />;
  };

  const TOTAL_STEPS = 4;

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#FFF5F5] to-[#FAFAFA] p-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-green-600 shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">Rejestracja Udana!</h2>
            <p className="text-gray-600 leading-relaxed">
              Twoje konto zostalo utworzone i oczekuje na zatwierdzenie przez administratora.
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
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#FF4D4F] to-[#FF3B30] shadow-lg">
              <Store className="h-8 w-8 text-white" />
            </div>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Rejestracja Restauracji</h1>
          <p className="text-gray-600">Dolacz do platformy DISHLY i zacznij przyjmowac zamowienia online</p>
          <Link href="/" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#FF4D4F] transition-colors hover:text-[#FF3B30]">
            &larr; Powrot do strony glownej
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${step >= s ? "bg-[#FF4D4F] text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
              {idx < TOTAL_STEPS - 1 && (
                <div className={`h-1 w-12 rounded-full transition-all ${step > s ? "bg-[#FF4D4F]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">{error}</div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900">Dane osobowe</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-semibold text-gray-700">Imie *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input id="firstName" name="firstName" type="text" placeholder="Jan" value={formData.firstName} onChange={handleChange} disabled={isLoading} className="h-12 rounded-xl border-gray-200 pl-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Nazwisko *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input id="lastName" name="lastName" type="text" placeholder="Kowalski" value={formData.lastName} onChange={handleChange} disabled={isLoading} className="h-12 rounded-xl border-gray-200 pl-12" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input id="email" name="email" type="email" placeholder="kontakt@restauracja.pl" value={formData.email} onChange={handleChange} disabled={isLoading} className="h-12 rounded-xl border-gray-200 pl-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-semibold text-gray-700">Telefon *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input id="phone" name="phone" type="tel" placeholder="+48 123 456 789" value={formData.phone} onChange={handleChange} disabled={isLoading} className="h-12 rounded-xl border-gray-200 pl-12" />
                  </div>
                </div>
                <Button type="button" onClick={handleNext} className="h-12 w-full rounded-xl bg-linear-to-r from-[#FF4D4F] to-[#FF3B30] text-base font-semibold text-white shadow-lg">Dalej &rarr;</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900">Dane restauracji</h3>
                <div className="space-y-2">
                  <label htmlFor="restaurantName" className="text-sm font-semibold text-gray-700">Nazwa restauracji *</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input id="restaurantName" name="restaurantName" type="text" placeholder="Moja Restauracja" value={formData.restaurantName} onChange={handleChange} disabled={isLoading} className="h-12 rounded-xl border-gray-200 pl-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="restaurantBio" className="text-sm font-semibold text-gray-700">Opis restauracji</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <textarea id="restaurantBio" name="restaurantBio" placeholder="Krotki opis Twojej restauracji..." value={formData.restaurantBio} onChange={handleChange} disabled={isLoading} className="min-h-30 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-12 text-sm placeholder:text-gray-400 focus:border-[#FF4D4F] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/20 disabled:opacity-50" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" onClick={() => setStep(1)} variant="outline" className="h-12 flex-1 rounded-xl border-2 border-gray-200">&larr; Wstecz</Button>
                  <Button type="button" onClick={handleNext} className="h-12 flex-1 rounded-xl bg-linear-to-r from-[#FF4D4F] to-[#FF3B30] text-base font-semibold text-white shadow-lg">Dalej &rarr;</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Wybierz plan subskrypcji</h3>
                  <p className="mt-1 text-sm text-gray-500">Mozesz pomijac ten krok i wybrac plan po zatwierdzeniu konta.</p>
                </div>
                {loadingPlans ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF4D4F] border-t-transparent" />
                  </div>
                ) : plans.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                    Brak dostepnych planow. Mozesz wybrac plan po zatwierdzeniu konta przez administratora.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {plans.map((plan) => (
                      <button key={plan.id} type="button" onClick={() => setFormData((prev) => ({ ...prev, planId: plan.id }))}
                        className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${formData.planId === plan.id ? "border-[#FF4D4F] bg-[#FFF1F1]" : "border-gray-200 hover:border-[#FF4D4F]/50"}`}>
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${formData.planId === plan.id ? "bg-[#FF4D4F] text-white" : "bg-gray-100 text-gray-600"}`}>
                            {getPlanIcon(plan.name)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                              <span className="text-lg font-bold text-[#FF4D4F]">
                                {Number(plan.price).toFixed(2)} {plan.currency}
                                <span className="text-xs font-normal text-gray-500">/{plan.interval === "MONTHLY" ? "mies." : "rok"}</span>
                              </span>
                            </div>
                            {plan.description && <p className="mt-1 text-sm text-gray-500">{plan.description}</p>}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{plan.maxLocations === 1 ? "1 lokalizacja" : `do ${plan.maxLocations} lokalizacji`}</span>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">do {plan.maxStaffAccounts} pracownikow</span>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">do {plan.maxMeals} dan</span>
                            </div>
                          </div>
                          {formData.planId === plan.id && <CheckCircle2 className="h-5 w-5 shrink-0 text-[#FF4D4F]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button type="button" onClick={() => setStep(2)} variant="outline" className="h-12 flex-1 rounded-xl border-2 border-gray-200">&larr; Wstecz</Button>
                  <Button type="button" onClick={handleNext} className="h-12 flex-1 rounded-xl bg-linear-to-r from-[#FF4D4F] to-[#FF3B30] text-base font-semibold text-white shadow-lg">
                    {formData.planId ? "Dalej \u2192" : "Pomin \u2192"}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900">Zabezpieczenia konta</h3>
                {formData.planId && plans.length > 0 && (
                  <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
                    <CreditCard className="h-5 w-5 shrink-0" />
                    <div><span className="font-medium">Wybrany plan: </span>{plans.find((p) => p.id === formData.planId)?.name}</div>
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">Haslo *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input id="password" name="password" type="password" placeholder="..." value={formData.password} onChange={handleChange} required disabled={isLoading} className="h-12 rounded-xl border-gray-200 pl-12" />
                  </div>
                  <p className="text-xs text-gray-500">Minimum 8 znakow</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Potwierdz haslo *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="..." value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} className="h-12 rounded-xl border-gray-200 pl-12" />
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Wymagane zatwierdzenie</p>
                    <p className="mt-1 text-blue-700">Twoje konto wymaga zatwierdzenia przez administratora przed rozpoczeciem korzystania z platformy.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" onClick={() => setStep(3)} variant="outline" className="h-12 flex-1 rounded-xl border-2 border-gray-200">&larr; Wstecz</Button>
                  <Button type="submit" disabled={isLoading} className="h-12 flex-1 rounded-xl bg-linear-to-r from-[#FF4D4F] to-[#FF3B30] text-base font-semibold text-white shadow-lg disabled:opacity-50">
                    {isLoading ? <span className="flex items-center gap-2"><div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />Rejestracja...</span> : "Zarejestruj restauracje"}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Masz juz konto?{" "}
              <Link href="/login" className="font-semibold text-[#FF4D4F] transition-colors hover:text-[#FF3B30]">Zaloguj sie</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
