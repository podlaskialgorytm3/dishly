"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RestaurantMapLocation } from "@/actions/storefront";

type HeroMapBackgroundProps = {
  locations: RestaurantMapLocation[];
};

const mapPinIcon = new L.DivIcon({
  className: "dishly-hero-map-pin",
  html: `<div style="
    position: relative;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #E8503A;
    opacity: 0.9;
  "><span class="dishly-hero-map-pin-ring"></span></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

export function HeroMapBackground({ locations }: HeroMapBackgroundProps) {
  const [isMobile, setIsMobile] = useState(false);
  const previewLocations = locations.slice(0, 400);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 768);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  const staticPins = useMemo(() => {
    const minLat = 51.95;
    const maxLat = 52.45;
    const minLng = 20.65;
    const maxLng = 21.35;

    return previewLocations.slice(0, 44).map((location) => {
      const x = ((location.longitude - minLng) / (maxLng - minLng)) * 900;
      const y = ((maxLat - location.latitude) / (maxLat - minLat)) * 600;
      return {
        id: location.id,
        x: Math.max(16, Math.min(884, x)),
        y: Math.max(16, Math.min(584, y)),
      };
    });
  }, [previewLocations]);

  if (isMobile) {
    return (
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <svg
          viewBox="0 0 900 600"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <rect width="900" height="600" fill="#e8e2d6" />
          <path
            d="M40 120 C220 90, 300 170, 460 130 C620 90, 720 170, 860 120"
            stroke="#bbb0a0"
            strokeWidth="3"
            fill="none"
            opacity="0.65"
          />
          <path
            d="M80 360 C200 320, 370 430, 520 360 C640 300, 790 390, 880 340"
            stroke="#bbb0a0"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          <ellipse
            cx="220"
            cy="220"
            rx="120"
            ry="70"
            fill="#d4e8c2"
            opacity="0.4"
          />
          <ellipse
            cx="700"
            cy="420"
            rx="130"
            ry="85"
            fill="#c8ddb0"
            opacity="0.35"
          />
          <rect
            x="300"
            y="250"
            width="180"
            height="110"
            rx="20"
            fill="#d0c8b8"
            opacity="0.45"
          />

          {staticPins.map((pin) => (
            <g key={pin.id} transform={`translate(${pin.x}, ${pin.y})`}>
              <circle r="10" fill="#E8503A" opacity="0.22">
                <animate
                  attributeName="r"
                  values="8;15;8"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.26;0.06;0.26"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="5" fill="#E8503A" opacity="0.9" />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      <MapContainer
        center={[52.23196, 21.00672]}
        zoom={11}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
        attributionControl={false}
        preferCanvas
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {previewLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={mapPinIcon}
          />
        ))}
      </MapContainer>
    </div>
  );
}
