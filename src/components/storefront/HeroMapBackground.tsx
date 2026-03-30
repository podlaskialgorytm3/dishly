"use client";

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
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 2px solid rgba(255,255,255,0.9);
    background: #FF4D4F;
    box-shadow: 0 0 0 6px rgba(255,77,79,0.2);
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export function HeroMapBackground({ locations }: HeroMapBackgroundProps) {
  const previewLocations = locations.slice(0, 400);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
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
