"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const pinIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 36px; height: 36px;
    background: #FF4D4F;
    border: 3px solid white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    font-size: 16px;
  ">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16, { animate: true });
  }, [map, lat, lng]);
  return null;
}

type AddressMapProps = {
  latitude: number;
  longitude: number;
  label?: string;
};

export default function AddressMap({
  latitude,
  longitude,
  label,
}: AddressMapProps) {
  return (
    <div style={{ height: "250px", width: "100%" }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={latitude} lng={longitude} />
        <Marker position={[latitude, longitude]} icon={pinIcon}>
          <Popup>
            <div className="text-center">
              <p className="text-sm font-semibold">
                📍 {label ?? "Twoja lokalizacja"}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
