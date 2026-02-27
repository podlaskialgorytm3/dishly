"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const pinIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 32px; height: 32px;
    background: #4CAF50;
    border: 3px solid white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    font-size: 14px;
  ">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
  }, [map, lat, lng]);
  return null;
}

type CheckoutMapProps = {
  latitude: number;
  longitude: number;
  address?: string;
};

export default function CheckoutMap({
  latitude,
  longitude,
  address,
}: CheckoutMapProps) {
  return (
    <div style={{ height: "180px", width: "100%" }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        dragging={false}
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={latitude} lng={longitude} />
        <Marker position={[latitude, longitude]} icon={pinIcon}>
          <Popup>
            <p className="text-xs font-semibold">
              📍 {address ?? "Miejsce dostawy"}
            </p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
