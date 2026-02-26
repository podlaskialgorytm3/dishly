"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    confirmPassword: "",
    isActive: member?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isEdit) {
      if (!form.password) {
        setError("Hasło jest wymagane");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Hasła nie są zgodne");
        return;
      }
      if (form.password.length < 8) {
        setError("Hasło musi mieć co najmniej 8 znaków");
        return;
      }
    }

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
      } else {
        await createStaff({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          locationId: form.locationId,
          password: form.password,
        });
        toast.success("Konto pracownika utworzone");
        router.push("/dashboard/owner/staff");
      }
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Wystąpił błąd");
      toast.error(e.message || "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <label className="text-sm font-medium text-[#1F1F1F]">Rola *</label>
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
                  <p className="text-xs text-[#8C8C8C]">Zamówienia, statusy</p>
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
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F1F1F]">
                Hasło *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 znaków"
                  className="rounded-xl border-[#EEEEEE] pl-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F1F1F]">
                Potwierdź hasło *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Powtórz hasło"
                  className="rounded-xl border-[#EEEEEE] pl-10"
                />
              </div>
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
  );
}
