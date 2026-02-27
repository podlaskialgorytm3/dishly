"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocationStore } from "@/stores/location-store";
import { motion, AnimatePresence } from "framer-motion";

type SavedAddress = {
  id: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
};

type LocationPickerProps = {
  savedAddresses?: SavedAddress[];
  isLoggedIn?: boolean;
};

export function LocationPicker({
  savedAddresses = [],
  isLoggedIn = false,
}: LocationPickerProps) {
  const {
    userLocation,
    isLoading,
    error,
    detectLocation,
    setManualAddress,
    setUserLocation,
  } = useLocationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [manualAddress, setManualAddressInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDetectLocation = async () => {
    await detectLocation();
    setIsOpen(false);
  };

  const handleManualSubmit = () => {
    if (manualAddress.trim() && manualCity.trim()) {
      setManualAddress(manualAddress.trim(), manualCity.trim());
      setIsOpen(false);
      setManualAddressInput("");
      setManualCity("");
    }
  };

  const handleSavedAddress = (addr: SavedAddress) => {
    setUserLocation({
      latitude: 0,
      longitude: 0,
      address: addr.street,
      city: addr.city,
      source: "profile",
    });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
      >
        <MapPin className="h-4 w-4" />
        {userLocation ? (
          <span className="max-w-[200px] truncate">
            {userLocation.address}
            {userLocation.city ? `, ${userLocation.city}` : ""}
          </span>
        ) : (
          <span>Podaj adres dostawy</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full z-50 mt-2 w-[340px] rounded-2xl bg-white p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1F1F1F]">
                Adres dostawy
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#8C8C8C] hover:text-[#1F1F1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Detect location button */}
            <Button
              onClick={handleDetectLocation}
              disabled={isLoading}
              variant="outline"
              className="mb-3 w-full justify-start gap-2 rounded-xl border-[#EEEEEE] text-[#1F1F1F] hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              Użyj mojej lokalizacji
            </Button>

            {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

            {/* Saved addresses */}
            {isLoggedIn && savedAddresses.length > 0 && (
              <div className="mb-3">
                <p className="mb-2 text-xs font-medium text-[#8C8C8C] uppercase tracking-wide">
                  Zapisane adresy
                </p>
                <div className="space-y-1">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => handleSavedAddress(addr)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#1F1F1F] transition-colors hover:bg-[#FFF1F1]"
                    >
                      <MapPin className="h-3 w-3 flex-shrink-0 text-[#FF4D4F]" />
                      <span className="truncate">
                        {addr.street}, {addr.city}
                        {addr.isDefault && (
                          <span className="ml-1 text-xs text-[#FF4D4F]">
                            (domyślny)
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Separator */}
            <div className="mb-3 border-t border-[#EEEEEE]" />

            {/* Manual address input */}
            <p className="mb-2 text-xs font-medium text-[#8C8C8C] uppercase tracking-wide">
              Wpisz adres ręcznie
            </p>
            <div className="space-y-2">
              <Input
                placeholder="Ulica i numer"
                value={manualAddress}
                onChange={(e) => setManualAddressInput(e.target.value)}
                className="rounded-xl border-[#EEEEEE] text-sm"
              />
              <Input
                placeholder="Miasto"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                className="rounded-xl border-[#EEEEEE] text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleManualSubmit();
                }}
              />
              <Button
                onClick={handleManualSubmit}
                disabled={!manualAddress.trim() || !manualCity.trim()}
                className="w-full rounded-xl bg-[#FF4D4F] text-sm hover:bg-[#FF3B30]"
              >
                Zapisz adres
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
