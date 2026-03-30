"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import {
  LocateFixed,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  ScanSearch,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import type { RestaurantMapLocation } from "@/actions/storefront";

type RestaurantsMapClientProps = {
  locations: RestaurantMapLocation[];
};

const openPinIcon = new L.DivIcon({
  className: "dishly-map-pin-open",
  html: `<div style="
    width: 26px;
    height: 26px;
    border-radius: 999px;
    border: 3px solid white;
    background: #22C55E;
    box-shadow: 0 6px 16px rgba(0,0,0,0.28);
  "></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
});

const closedPinIcon = new L.DivIcon({
  className: "dishly-map-pin-closed",
  html: `<div style="
    width: 26px;
    height: 26px;
    border-radius: 999px;
    border: 3px solid white;
    background: #EF4444;
    box-shadow: 0 6px 16px rgba(0,0,0,0.28);
  "></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
});

const userPinIcon = new L.DivIcon({
  className: "dishly-map-user-pin",
  html: `<div style="
    width: 24px;
    height: 24px;
    border-radius: 999px;
    border: 3px solid white;
    background: #2563EB;
    box-shadow: 0 6px 16px rgba(0,0,0,0.28);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

function FitMapToMarkers({ points }: { points: Array<[number, number]> }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, points]);

  return null;
}

function CaptureMapInstance({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();

  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  return null;
}

export function RestaurantsMapClient({ locations }: RestaurantsMapClientProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null,
  );

  const markerPoints = useMemo(
    () =>
      locations.map(
        (location) =>
          [location.latitude, location.longitude] as [number, number],
      ),
    [locations],
  );

  const fitAllMarkers = () => {
    if (!mapRef.current || markerPoints.length === 0) {
      return;
    }
    const bounds = L.latLngBounds(markerPoints);
    mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  };

  const toggleFullscreen = async () => {
    const element = mapContainerRef.current;
    if (!element) {
      return;
    }

    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen errors silently.
    }
  };

  const goToUserLocation = () => {
    if (!navigator.geolocation || !mapRef.current) {
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPosition: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserPosition(nextPosition);
        mapRef.current?.flyTo(nextPosition, 14, {
          animate: true,
          duration: 1.2,
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreenOn =
        document.fullscreenElement === mapContainerRef.current;
      setIsFullscreen(fullscreenOn);
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 200);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#EEEEEE] bg-white p-4 shadow-sm">
        <p className="text-sm text-[#4B5563]">
          Kliknij punkt na mapie, aby zobaczyć status lokalu i przejść do strony
          restauracji.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#6B7280]">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F9FAFB] px-3 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
            Otwarte teraz
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F9FAFB] px-3 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
            Zamknięte
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F9FAFB] px-3 py-1.5">
            Łącznie punktów: {locations.length}
          </span>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className="relative h-[65vh] min-h-[420px] overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-sm"
      >
        <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#111827] shadow-md hover:bg-[#F9FAFB]"
            aria-label="Przybliż mapę"
            type="button"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#111827] shadow-md hover:bg-[#F9FAFB]"
            aria-label="Oddal mapę"
            type="button"
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            onClick={fitAllMarkers}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#111827] shadow-md hover:bg-[#F9FAFB]"
            aria-label="Dopasuj wszystkie punkty"
            type="button"
          >
            <ScanSearch className="h-5 w-5" />
          </button>
          <button
            onClick={goToUserLocation}
            disabled={isLocating}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#111827] shadow-md hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Wróć do mojej lokalizacji"
            type="button"
          >
            <LocateFixed className="h-5 w-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#111827] shadow-md hover:bg-[#F9FAFB]"
            aria-label={isFullscreen ? "Wyjdź z pełnego ekranu" : "Pełny ekran"}
            type="button"
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </div>

        <MapContainer
          center={[52.23196, 21.00672]}
          zoom={11}
          scrollWheelZoom
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CaptureMapInstance
            onReady={(map) => {
              mapRef.current = map;
            }}
          />
          <FitMapToMarkers points={markerPoints} />

          {userPosition && (
            <Marker position={userPosition} icon={userPinIcon}>
              <Popup>
                <p className="text-xs font-semibold">Twoja lokalizacja</p>
              </Popup>
            </Marker>
          )}

          {locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={location.isOpenNow ? openPinIcon : closedPinIcon}
            >
              <Popup>
                <div className="min-w-[210px] space-y-2">
                  <p className="text-sm font-bold text-[#111827]">
                    {location.restaurant.name}
                  </p>
                  <p className="text-xs text-[#6B7280]">{location.name}</p>
                  <p className="text-xs text-[#6B7280]">
                    {location.address}, {location.city}
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                      location.isOpenNow
                        ? "bg-[#DCFCE7] text-[#166534]"
                        : "bg-[#FEE2E2] text-[#991B1B]"
                    }`}
                  >
                    {location.isOpenNow ? "Otwarte" : "Zamknięte"}:{" "}
                    {location.statusLabel}
                  </span>
                  <div>
                    <Link
                      href={`/${location.restaurant.slug}`}
                      className="inline-flex rounded-md bg-[#FF4D4F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#FF3B30]"
                    >
                      Przejdź do restauracji
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
