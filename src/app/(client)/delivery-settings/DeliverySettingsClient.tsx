"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Trash2,
  Star,
  Edit3,
  Navigation,
  Loader2,
  Home,
  Briefcase,
  Heart,
  Check,
  X,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  reverseGeocode,
} from "@/actions/client/addresses";
import dynamic from "next/dynamic";

// ============================================
// TYPES
// ============================================

type Address = {
  id: string;
  label: string | null;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
};

type AddressMapProps = {
  latitude: number;
  longitude: number;
  label?: string;
};

// Dynamic Leaflet map import (no SSR)
const AddressMap = dynamic<AddressMapProps>(() => import("./AddressMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[250px] items-center justify-center rounded-xl bg-gray-100">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  ),
});

// ============================================
// LABEL PRESETS
// ============================================

const LABEL_PRESETS = [
  { value: "Dom", icon: Home, color: "#4CAF50" },
  { value: "Biuro", icon: Briefcase, color: "#2196F3" },
  { value: "Inne", icon: Heart, color: "#FF9800" },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function DeliverySettingsClient({
  addresses: initialAddresses,
}: {
  addresses: Address[];
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [geoLoading, setGeoLoading] = useState(false);
  const [previewMapId, setPreviewMapId] = useState<string | null>(null);

  // Form state
  const [formLabel, setFormLabel] = useState("");
  const [formStreet, setFormStreet] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formPostalCode, setFormPostalCode] = useState("");
  const [formLat, setFormLat] = useState<number | null>(null);
  const [formLng, setFormLng] = useState<number | null>(null);
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setFormLabel("");
    setFormStreet("");
    setFormCity("");
    setFormPostalCode("");
    setFormLat(null);
    setFormLng(null);
    setFormIsDefault(false);
    setFormError(null);
    setShowForm(false);
    setEditingId(null);
  }, []);

  const openNewForm = () => {
    resetForm();
    setFormIsDefault(addresses.length === 0);
    setShowForm(true);
  };

  const openEditForm = (addr: Address) => {
    setFormLabel(addr.label ?? "");
    setFormStreet(addr.street);
    setFormCity(addr.city);
    setFormPostalCode(addr.postalCode);
    setFormLat(addr.latitude);
    setFormLng(addr.longitude);
    setFormIsDefault(addr.isDefault);
    setFormError(null);
    setEditingId(addr.id);
    setShowForm(true);
  };

  // ============================================
  // GEOLOCATION
  // ============================================

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setFormError("Twoja przeglądarka nie wspiera geolokalizacji");
      return;
    }

    setGeoLoading(true);
    setFormError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormLat(latitude);
        setFormLng(longitude);

        // Reverse geocode to get address
        try {
          const result = await reverseGeocode(latitude, longitude);
          if (result) {
            setFormStreet(result.street);
            setFormCity(result.city);
            setFormPostalCode(result.postalCode);
          }
        } catch {
          // Keep coordinates even if reverse geocode fails
        }

        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setFormError(
              "Odmówiono dostępu do lokalizacji. Włącz uprawnienia w ustawieniach przeglądarki.",
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setFormError("Informacja o lokalizacji jest niedostępna.");
            break;
          case error.TIMEOUT:
            setFormError("Upłynął czas oczekiwania na lokalizację.");
            break;
          default:
            setFormError("Wystąpił nieznany błąd geolokalizacji.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // ============================================
  // CRUD HANDLERS
  // ============================================

  const handleSave = () => {
    if (!formStreet.trim() || !formCity.trim()) {
      setFormError("Ulica i miasto są wymagane");
      return;
    }

    setFormError(null);
    startTransition(async () => {
      const input = {
        label: formLabel.trim() || undefined,
        street: formStreet.trim(),
        city: formCity.trim(),
        postalCode: formPostalCode.trim(),
        latitude: formLat ?? undefined,
        longitude: formLng ?? undefined,
        isDefault: formIsDefault,
      };

      const result = editingId
        ? await updateAddress(editingId, input)
        : await createAddress(input);

      if (result.success) {
        resetForm();
        router.refresh();
        // Optimistic: re-fetch on refresh
        const { getClientAddresses } =
          await import("@/actions/client/addresses");
        const fresh = await getClientAddresses();
        setAddresses(fresh);
      } else {
        setFormError(result.error ?? "Wystąpił błąd");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteAddress(id);
      if (result.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      }
    });
  };

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      const result = await setDefaultAddress(id);
      if (result.success) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id })),
        );
      }
    });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1F1F1F]">Adresy dostawy</h1>
        <p className="mt-1 text-sm text-[#8C8C8C]">
          Zarządzaj swoimi adresami dostawy. Domyślny adres będzie automatycznie
          używany przy składaniu zamówień.
        </p>
      </div>

      {/* Add button */}
      {!showForm && (
        <Button
          onClick={openNewForm}
          className="mb-6 gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]"
        >
          <Plus className="h-4 w-4" />
          Dodaj nowy adres
        </Button>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                {editingId ? "Edytuj adres" : "Nowy adres"}
              </h2>
              <button
                onClick={resetForm}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-[#8C8C8C]" />
              </button>
            </div>

            {/* Label presets */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-[#8C8C8C]">
                Etykieta (opcjonalna)
              </p>
              <div className="flex gap-2">
                {LABEL_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = formLabel === preset.value;
                  return (
                    <button
                      key={preset.value}
                      onClick={() =>
                        setFormLabel(isSelected ? "" : preset.value)
                      }
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "text-white shadow-md"
                          : "border border-[#EEEEEE] text-[#8C8C8C] hover:border-[#CCCCCC]"
                      }`}
                      style={
                        isSelected ? { backgroundColor: preset.color } : {}
                      }
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {preset.value}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Geolocation button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGeolocate}
              disabled={geoLoading}
              className="mb-4 w-full gap-2 rounded-xl border-dashed border-[#FF4D4F] text-[#FF4D4F] hover:bg-[#FFF1F1]"
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              {geoLoading
                ? "Pobieranie lokalizacji..."
                : "Użyj mojej lokalizacji"}
            </Button>

            {/* Map preview if we have coordinates */}
            {formLat && formLng && (
              <div className="mb-4 overflow-hidden rounded-xl">
                <AddressMap
                  latitude={formLat}
                  longitude={formLng}
                  label={formStreet || "Twoja lokalizacja"}
                />
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#8C8C8C]">
                  Ulica i numer *
                </label>
                <Input
                  placeholder="np. Marszałkowska 10/5"
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#8C8C8C]">
                    Miasto *
                  </label>
                  <Input
                    placeholder="np. Warszawa"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#8C8C8C]">
                    Kod pocztowy
                  </label>
                  <Input
                    placeholder="np. 00-001"
                    value={formPostalCode}
                    onChange={(e) => setFormPostalCode(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Default toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#FF4D4F] focus:ring-[#FF4D4F]"
                />
                <span className="text-sm text-[#1F1F1F]">
                  Ustaw jako domyślny adres
                </span>
              </label>

              {formLat && formLng && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Współrzędne GPS: {formLat.toFixed(4)}, {formLng.toFixed(4)}
                </p>
              )}

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1 rounded-xl"
                >
                  Anuluj
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isPending || !formStreet.trim() || !formCity.trim()}
                  className="flex-1 gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Zapisz zmiany" : "Dodaj adres"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address list */}
      <div className="space-y-3">
        <AnimatePresence>
          {addresses.map((addr) => {
            const labelPreset = LABEL_PRESETS.find(
              (p) => p.value === addr.label,
            );
            const LabelIcon = labelPreset?.icon ?? MapPin;
            const showMap = previewMapId === addr.id;

            return (
              <motion.div
                key={addr.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`rounded-2xl border p-4 transition-all ${
                  addr.isDefault
                    ? "border-[#FF4D4F]/30 bg-[#FFF8F8] shadow-sm"
                    : "border-[#EEEEEE] bg-white hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: labelPreset
                        ? `${labelPreset.color}15`
                        : "#F5F5F5",
                    }}
                  >
                    <LabelIcon
                      className="h-5 w-5"
                      style={{
                        color: labelPreset?.color ?? "#8C8C8C",
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#1F1F1F] truncate">
                        {addr.label || "Adres"}
                      </h3>
                      {addr.isDefault && (
                        <span className="flex items-center gap-1 rounded-full bg-[#FF4D4F] px-2 py-0.5 text-[10px] font-semibold text-white">
                          <Star className="h-2.5 w-2.5" />
                          Domyślny
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#8C8C8C]">{addr.street}</p>
                    <p className="text-xs text-[#8C8C8C]">
                      {addr.postalCode} {addr.city}
                    </p>
                    {addr.latitude && addr.longitude && (
                      <p className="mt-0.5 text-[10px] text-green-500">
                        GPS: {addr.latitude.toFixed(4)},{" "}
                        {addr.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {addr.latitude && addr.longitude && (
                      <button
                        onClick={() =>
                          setPreviewMapId(showMap ? null : addr.id)
                        }
                        className={`rounded-full p-2 transition-colors ${
                          showMap
                            ? "bg-[#FF4D4F]/10 text-[#FF4D4F]"
                            : "text-[#CCCCCC] hover:bg-gray-100 hover:text-[#8C8C8C]"
                        }`}
                        title="Podgląd na mapie"
                      >
                        <Map className="h-4 w-4" />
                      </button>
                    )}
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        disabled={isPending}
                        className="rounded-full p-2 text-[#CCCCCC] transition-colors hover:bg-amber-50 hover:text-amber-500"
                        title="Ustaw jako domyślny"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditForm(addr)}
                      className="rounded-full p-2 text-[#CCCCCC] transition-colors hover:bg-blue-50 hover:text-blue-500"
                      title="Edytuj"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={isPending}
                      className="rounded-full p-2 text-[#CCCCCC] transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Usuń"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Map preview */}
                <AnimatePresence>
                  {showMap && addr.latitude && addr.longitude && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <AddressMap
                        latitude={addr.latitude}
                        longitude={addr.longitude}
                        label={`${addr.label ?? "Adres"}: ${addr.street}`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {addresses.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EEEEEE] py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F1]">
              <MapPin className="h-8 w-8 text-[#FF4D4F]" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-[#1F1F1F]">
              Brak zapisanych adresów
            </h3>
            <p className="mb-4 text-sm text-[#8C8C8C]">
              Dodaj swój pierwszy adres dostawy, aby szybciej składać zamówienia
            </p>
            <Button
              onClick={openNewForm}
              className="gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]"
            >
              <Plus className="h-4 w-4" />
              Dodaj adres
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
