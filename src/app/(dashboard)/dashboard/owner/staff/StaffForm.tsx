"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createStaff, updateStaff } from "@/actions/owner/staff";
import {
  User,
  Mail,
  Lock,
  MapPin,
  Shield,
  Briefcase,
  Save,
  ArrowLeft,
  Copy,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

type Location = { id: string; name: string };

type StaffMember = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  locationId: string | null;
  isActive: boolean;
};

// Funkcja do generowania hasła po stronie klienta (do wyświetlenia)
function generatePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export default function StaffForm({
  locations,
  member,
}: {
  locations: Location[];
  member?: StaffMember;
}) {
  const router = useRouter();
  const isEdit = !!member;

  const [form, setForm] = useState({
    firstName: member?.firstName ?? "",
    lastName: member?.lastName ?? "",
    email: member?.email ?? "",
    role: (member?.role ?? "WORKER") as "MANAGER" | "WORKER",
    locationId: member?.locationId ?? "",
    password: "",
    isActive: member?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdPassword, setCreatedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  // Generuj hasło przy montowaniu komponentu (tylko dla nowych użytkowników)
  useEffect(() => {
    if (!isEdit && !form.password) {
      setForm((prev) => ({ ...prev, password: generatePassword(12) }));
    }
  }, [isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleRegeneratePassword = () => {
    setForm((prev) => ({ ...prev, password: generatePassword(12) }));
    toast.success("Hasło zostało wygenerowane ponownie");
  };

  const handleCopyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success("Hasło skopiowane do schowka");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Nie udało się skopiować hasła");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.locationId) {
      setError("Przypisz pracownika do lokalizacji");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateStaff(member.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          locationId: form.locationId,
          isActive: form.isActive,
        });
        toast.success("Dane pracownika zaktualizowane");
        router.push("/dashboard/owner/staff");
      } else {
        const result = await createStaff({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          locationId: form.locationId,
        });

        // Zapisz wygenerowane hasło i pokaż dialog
        setCreatedPassword(result.generatedPassword);
        setShowSuccessDialog(true);
      }
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Wystąpił błąd");
      toast.error(e.message || "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    router.push("/dashboard/owner/staff");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Dane osobowe */}
        <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1F1F1F]">
            <User className="h-5 w-5 text-[#FF4D4F]" />
            Dane pracownika
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1F1F1F]">
                  Imię *
                </label>
                <Input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Jan"
                  required
                  className="rounded-xl border-[#EEEEEE]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1F1F1F]">
                  Nazwisko *
                </label>
                <Input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Kowalski"
                  required
                  className="rounded-xl border-[#EEEEEE]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F1F1F]">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="pracownik@restauracja.pl"
                  required
                  disabled={isEdit}
                  className="rounded-xl border-[#EEEEEE] pl-10 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rola i lokalizacja */}
        <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1F1F1F]">
            <Shield className="h-5 w-5 text-[#FF4D4F]" />
            Rola i przypisanie
          </h2>
          <div className="space-y-4">
            {/* Role select */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F1F1F]">
                Rola *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: "MANAGER" }))}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    form.role === "MANAGER"
                      ? "border-purple-400 bg-purple-50"
                      : "border-[#EEEEEE] hover:border-purple-200"
                  }`}
                >
                  <Shield
                    className={`h-5 w-5 ${form.role === "MANAGER" ? "text-purple-600" : "text-gray-400"}`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1F1F1F]">
                      Menadżer
                    </p>
                    <p className="text-xs text-[#8C8C8C]">
                      Menu, raporty, godziny
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: "WORKER" }))}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    form.role === "WORKER"
                      ? "border-blue-400 bg-blue-50"
                      : "border-[#EEEEEE] hover:border-blue-200"
                  }`}
                >
                  <Briefcase
                    className={`h-5 w-5 ${form.role === "WORKER" ? "text-blue-600" : "text-gray-400"}`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1F1F1F]">
                      Pracownik
                    </p>
                    <p className="text-xs text-[#8C8C8C]">
                      Zamówienia, statusy
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Location select */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F1F1F]">
                Lokalizacja *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  name="locationId"
                  value={form.locationId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#EEEEEE] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1F1F1F] focus:border-[#FF4D4F] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/20"
                >
                  <option value="">Wybierz lokalizację</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-[#8C8C8C]">
                Pracownik jest przypisany do jednej lokalizacji
              </p>
            </div>

            {isEdit && (
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm text-[#1F1F1F]">Konto aktywne</span>
              </label>
            )}
          </div>
        </div>

        {/* Hasło (tylko przy tworzeniu) */}
        {!isEdit && (
          <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1F1F1F]">
              <Lock className="h-5 w-5 text-[#FF4D4F]" />
              Hasło dostępu
            </h2>
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
                <p className="mb-2 text-sm font-medium text-[#1F1F1F]">
                  Wygenerowane hasło:
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={form.password}
                    readOnly
                    className="flex-1 rounded-xl border-green-300 bg-white font-mono text-base font-semibold"
                  />
                  <Button
                    type="button"
                    onClick={() => handleCopyPassword(form.password)}
                    variant="outline"
                    className="rounded-xl border-2 border-green-300 hover:bg-green-100"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleRegeneratePassword}
                    variant="outline"
                    className="rounded-xl border-2 border-[#EEEEEE]"
                    title="Wygeneruj nowe hasło"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-3 text-xs text-[#8C8C8C]">
                  💡 To hasło zostanie wyświetlone tylko raz po utworzeniu
                  konta. Skopiuj je i przekaż pracownikowi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/dashboard/owner/staff" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl border-2 border-[#EEEEEE]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anuluj
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? "Zapisz zmiany" : "Utwórz konto"}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Dialog sukcesu z hasłem */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="rounded-[20px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Konto utworzone pomyślnie!
            </DialogTitle>
            <DialogDescription>
              Konto pracownika zostało utworzone. Oto dane dostępu:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-[#EEEEEE] bg-gray-50 p-4">
              <p className="mb-1 text-xs font-medium text-[#8C8C8C]">Email:</p>
              <p className="text-sm font-semibold text-[#1F1F1F]">
                {form.email}
              </p>
            </div>
            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
              <p className="mb-2 text-xs font-medium text-[#8C8C8C]">Hasło:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-white px-3 py-2 font-mono text-base font-bold text-[#1F1F1F]">
                  {createdPassword}
                </code>
                <Button
                  type="button"
                  onClick={() => handleCopyPassword(createdPassword)}
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-2 border-green-300"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>Ważne:</strong> To hasło zostanie wyświetlone tylko
                raz. Skopiuj je teraz i przekaż pracownikowi w bezpieczny
                sposób.
              </p>
            </div>
            <Button
              onClick={handleCloseSuccessDialog}
              className="w-full rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]"
            >
              Zamknij i wróć do listy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
