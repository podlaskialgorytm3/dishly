"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserLocation = {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  source: "geolocation" | "manual" | "profile";
};

type LocationState = {
  userLocation: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  setUserLocation: (location: UserLocation) => void;
  setManualAddress: (address: string, city: string) => void;
  detectLocation: () => Promise<void>;
  clearLocation: () => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      userLocation: null,
      isLoading: false,
      error: null,

      setUserLocation: (location) => {
        set({ userLocation: location, error: null });
      },

      setManualAddress: (address, city) => {
        set({
          userLocation: {
            latitude: 0,
            longitude: 0,
            address,
            city,
            source: "manual",
          },
          error: null,
        });
      },

      detectLocation: async () => {
        set({ isLoading: true, error: null });

        if (!navigator.geolocation) {
          set({
            isLoading: false,
            error: "Geolokalizacja nie jest wspierana przez Twoją przeglądarkę",
          });
          return;
        }

        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes cache
              });
            },
          );

          const { latitude, longitude } = position.coords;

          // Try reverse geocoding with Nominatim (OpenStreetMap)
          let address = "";
          let city = "";
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pl`,
            );
            if (response.ok) {
              const data = await response.json();
              const addr = data.address;
              const road = addr.road || addr.pedestrian || "";
              const houseNumber = addr.house_number || "";
              address = `${road} ${houseNumber}`.trim();
              city =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.municipality ||
                "";
            }
          } catch {
            // Reverse geocoding failed, use coordinates only
            address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }

          set({
            userLocation: {
              latitude,
              longitude,
              address,
              city,
              source: "geolocation",
            },
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const geoError = error as GeolocationPositionError;
          let message = "Nie udało się pobrać lokalizacji";
          if (geoError.code === geoError.PERMISSION_DENIED) {
            message = "Brak zgody na udostępnienie lokalizacji";
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            message = "Lokalizacja niedostępna";
          } else if (geoError.code === geoError.TIMEOUT) {
            message = "Przekroczono czas oczekiwania";
          }
          set({ isLoading: false, error: message });
        }
      },

      clearLocation: () => {
        set({ userLocation: null, error: null });
      },
    }),
    {
      name: "dishly-location",
      partialize: (state) => ({
        userLocation: state.userLocation,
      }),
    },
  ),
);
