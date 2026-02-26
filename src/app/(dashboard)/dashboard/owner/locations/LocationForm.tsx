"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLocation, updateLocation } from "@/actions/owner/locations";
import {
  MapPin,
  Phone,
  Truck,
  Clock,
  ShoppingBag,
  Save,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type OpeningHourDay = {
  open: string;
  close: string;
  closed: boolean;
};

type OpeningHours = {
  monday: OpeningHourDay;
  tuesday: OpeningHourDay;
  wednesday: OpeningHourDay;
  thursday: OpeningHourDay;
  friday: OpeningHourDay;
  saturday: OpeningHourDay;
  sunday: OpeningHourDay;
};

const DAYS: { key: keyof OpeningHours; label: string }[] = [
  { key: "monday", label: "Poniedziałek" },
  { key: "tuesday", label: "Wtorek" },
  { key: "wednesday", label: "Środa" },
  { key: "thursday", label: "Czwartek" },
  { key: "friday", label: "Piątek" },
  { key: "saturday", label: "Sobota" },
  { key: "sunday", label: "Niedziela" },
];

const DEFAULT_HOURS: OpeningHours = {
  monday: { open: "10:00", close: "22:00", closed: false },
  tuesday: { open: "10:00", close: "22:00", closed: false },
  wednesday: { open: "10:00", close: "22:00", closed: false },
  thursday: { open: "10:00", close: "22:00", closed: false },
  friday: { open: "10:00", close: "23:00", closed: false },
  saturday: { open: "10:00", close: "23:00", closed: false },
  sunday: { open: "11:00", close: "21:00", closed: false },
};

type LocationData = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  deliveryRadius: number;
  deliveryFee: any;
  minOrderValue: any;
  isAllDay: boolean;
  openingHours: any;
};

export default function LocationForm({
  location,
}: {
  location?: LocationData;
}) {
  const router = useRouter();
  const isEdit = !!location;

  const existingHours = location?.openingHours as OpeningHours | undefined;

  const [form, setForm] = useState({
    name: location?.name ?? "",
    address: location?.address ?? "",
    city: location?.city ?? "",
    postalCode: location?.postalCode ?? "",
    phone: location?.phone ?? "",
    deliveryRadius: location?.deliveryRadius ?? 5,
    deliveryFee: Number(location?.deliveryFee ?? 0).toFixed(2),
    minOrderValue: Number(location?.minOrderValue ?? 0).toFixed(2),
    isAllDay: location?.isAllDay ?? false,
  });

  const [hours, setHours] = useState<OpeningHours>(
    existingHours ?? DEFAULT_HOURS,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleHoursChange = (
    day: keyof OpeningHours,
    field: "open" | "close" | "closed",
    value: string | boolean,
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        name: form.name,
        address: form.address,
        city: form.city,
        postalCode: form.postalCode,
        phone: form.phone,
        deliveryRadius: Number(form.deliveryRadius),
        deliveryFee: Number(form.deliveryFee),
        minOrderValue: Number(form.minOrderValue),
        isAllDay: form.isAllDay,
        openingHours: form.isAllDay ? undefined : hours,
      };

      if (isEdit) {
        await updateLocation(location.id, data);
        toast.success("Lokalizacja zaktualizowana");
      } else {
        await createLocation(data);
        toast.success("Lokalizacja dodana");
        router.push("/dashboard/owner/locations");
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

      {/* Dane podstawowe */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1F1F1F]">
          <MapPin className="h-5 w-5 text-[#FF4D4F]" />
          Dane lokalizacji
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F1F1F]">
              Nazwa oddziału *
            </label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="np. Centrum, Mokotów"
              required
              className="rounded-xl border-[#EEEEEE]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F1F1F]">
              Adres *
            </label>
            <Input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="ul. Przykładowa 1"
              required
              className="rounded-xl border-[#EEEEEE]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F1F1F]">
                Miasto *
              </label>
              <Input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Warszawa"
                required
                className="rounded-xl border-[#EEEEEE]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F1F1F]">
                Kod pocztowy *
              </label>
              <Input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="00-001"
                required
                className="rounded-xl border-[#EEEEEE]"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F1F1F]">
              Telefon *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+48 123 456 789"
                required
                className="rounded-xl border-[#EEEEEE] pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logistyka dostaw */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1F1F1F]">
          <Truck className="h-5 w-5 text-[#FF4D4F]" />
          Finanse i dostawa
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F1F1F]">
              Zasięg dostawy (km)
            </label>
            <Input
              name="deliveryRadius"
              type="number"
              min="1"
              max="100"
              value={form.deliveryRadius}
              onChange={handleChange}
              className="rounded-xl border-[#EEEEEE]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F1F1F]">
              Koszt dostawy (PLN)
            </label>
            <Input
              name="deliveryFee"
              type="number"
              min="0"
              step="0.01"
              value={form.deliveryFee}
              onChange={handleChange}
              className="rounded-xl border-[#EEEEEE]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F1F1F]">
              Min. zamówienie (PLN)
            </label>
            <div className="relative">
              <ShoppingBag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                name="minOrderValue"
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderValue}
                onChange={handleChange}
                className="rounded-xl border-[#EEEEEE] pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Godziny otwarcia */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1F1F1F]">
          <Clock className="h-5 w-5 text-[#FF4D4F]" />
          Godziny otwarcia
        </h2>

        {/* Całodobowo toggle */}
        <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-[#EEEEEE] p-4 hover:bg-[#FAFAFA]">
          <div className="relative">
            <input
              type="checkbox"
              name="isAllDay"
              checked={form.isAllDay}
              onChange={handleChange}
              className="sr-only"
            />
            <div
              className={`h-6 w-11 rounded-full transition-colors ${form.isAllDay ? "bg-[#FF4D4F]" : "bg-gray-200"}`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${form.isAllDay ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[#1F1F1F]">
              Sprzedaż całodobowa (24/7)
            </p>
            <p className="text-xs text-[#8C8C8C]">
              Lokalizacja przyjmuje zamówienia o każdej porze
            </p>
          </div>
        </label>

        {/* Per-day hours */}
        {!form.isAllDay && (
          <div className="space-y-2">
            {DAYS.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-xl border border-[#EEEEEE] p-3"
              >
                <div className="w-28 shrink-0">
                  <p className="text-sm font-medium text-[#1F1F1F]">{label}</p>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hours[key]?.closed ?? false}
                    onChange={(e) =>
                      handleHoursChange(key, "closed", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-[#8C8C8C]">Zamknięte</span>
                </label>
                {!hours[key]?.closed && (
                  <>
                    <Input
                      type="time"
                      value={hours[key]?.open ?? "10:00"}
                      onChange={(e) =>
                        handleHoursChange(key, "open", e.target.value)
                      }
                      className="h-8 w-28 rounded-lg border-[#EEEEEE] text-sm"
                    />
                    <span className="text-[#8C8C8C]">–</span>
                    <Input
                      type="time"
                      value={hours[key]?.close ?? "22:00"}
                      onChange={(e) =>
                        handleHoursChange(key, "close", e.target.value)
                      }
                      className="h-8 w-28 rounded-lg border-[#EEEEEE] text-sm"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard/owner/locations" className="flex-1">
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
              {isEdit ? "Zapisz zmiany" : "Dodaj lokalizację"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
