"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
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

export function RestaurantsMapClient({ locations }: RestaurantsMapClientProps) {
  const markerPoints = useMemo(
    () =>
      locations.map(
        (location) =>
          [location.latitude, location.longitude] as [number, number],
      ),
    [locations],
  );

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

      <div className="h-[65vh] min-h-[420px] overflow-hidden rounded-2xl border border-[#EEEEEE] shadow-sm">
        <MapContainer
          center={[52.23196, 21.00672]}
          zoom={11}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitMapToMarkers points={markerPoints} />

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
