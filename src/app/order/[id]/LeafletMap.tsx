"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ============================================
// CUSTOM MARKER ICONS
// ============================================

const restaurantIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 36px; height: 36px;
    background: #FF4D4F;
    border: 3px solid white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    font-size: 16px;
  ">🍽️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const customerIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 36px; height: 36px;
    background: #4CAF50;
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

const deliveryIcon = new L.DivIcon({
  className: "custom-marker delivery-pulse",
  html: `<div style="
    width: 28px; height: 28px;
    background: #FF4D4F;
    border: 3px solid white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 12px rgba(255,77,79,0.5);
    font-size: 14px;
    animation: deliveryPulse 1.5s ease-in-out infinite;
  ">🛵</div>
  <style>
    @keyframes deliveryPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255,77,79,0.4); }
      50% { box-shadow: 0 0 0 12px rgba(255,77,79,0); }
    }
  </style>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

// ============================================
// FIT BOUNDS COMPONENT
// ============================================

function FitBounds({
  bounds,
}: {
  bounds: [[number, number], [number, number]];
}) {
  const map = useMap();

  useEffect(() => {
    const leafletBounds = L.latLngBounds(bounds);
    map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 15 });
  }, [map, bounds]);

  return null;
}

// ============================================
// ANIMATED DELIVERY MARKER
// ============================================

function AnimatedDeliveryMarker({
  from,
  to,
  progress,
}: {
  from: [number, number];
  to: [number, number];
  progress: number;
}) {
  const position: [number, number] = useMemo(() => {
    const p = Math.min(Math.max(progress, 0), 1);
    return [from[0] + (to[0] - from[0]) * p, from[1] + (to[1] - from[1]) * p];
  }, [from, to, progress]);

  return (
    <Marker position={position} icon={deliveryIcon}>
      <Popup>
        <span className="text-sm font-medium">🛵 Kurier w drodze</span>
      </Popup>
    </Marker>
  );
}

// ============================================
// MAIN LEAFLET MAP COMPONENT
// ============================================

type LeafletMapProps = {
  customerLat: number;
  customerLng: number;
  restaurantLat: number;
  restaurantLng: number;
  status: string;
  progress: number;
};

export default function LeafletMap({
  customerLat,
  customerLng,
  restaurantLat,
  restaurantLng,
  status,
  progress,
}: LeafletMapProps) {
  const restPos: [number, number] = [restaurantLat, restaurantLng];
  const custPos: [number, number] = [customerLat, customerLng];
  const bounds: [[number, number], [number, number]] = [restPos, custPos];

  // Center between both points
  const center: [number, number] = [
    (restaurantLat + customerLat) / 2,
    (restaurantLng + customerLng) / 2,
  ];

  // Route path - straight line between restaurant and customer
  // (In production you'd use a routing API like OSRM for real roads)
  const routePath: [number, number][] = useMemo(() => {
    // Generate a slight curve to make it look more natural
    const points: [number, number][] = [];
    const steps = 20;
    const midLat = (restaurantLat + customerLat) / 2;
    const midLng = (restaurantLng + customerLng) / 2;
    // Offset for the curve
    const perpLat = -(customerLng - restaurantLng) * 0.15;
    const perpLng = (customerLat - restaurantLat) * 0.15;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Quadratic bezier
      const lat =
        (1 - t) * (1 - t) * restaurantLat +
        2 * (1 - t) * t * (midLat + perpLat) +
        t * t * customerLat;
      const lng =
        (1 - t) * (1 - t) * restaurantLng +
        2 * (1 - t) * t * (midLng + perpLng) +
        t * t * customerLng;
      points.push([lat, lng]);
    }
    return points;
  }, [restaurantLat, restaurantLng, customerLat, customerLng]);

  // Traveled portion of the route
  const traveledPath = useMemo(() => {
    if (status !== "IN_DELIVERY" && status !== "DELIVERED") return [];
    const p = status === "DELIVERED" ? 1 : Math.min(progress * 2, 1);
    const idx = Math.floor(p * (routePath.length - 1));
    return routePath.slice(0, idx + 1);
  }, [routePath, status, progress]);

  // Delivery position for animated marker
  const deliveryProgress = useMemo(() => {
    if (status !== "IN_DELIVERY") return 0;
    return Math.min(progress * 2, 1);
  }, [status, progress]);

  return (
    <div style={{ height: "350px", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds bounds={bounds} />

        {/* Full route - dashed gray line */}
        <Polyline
          positions={routePath}
          pathOptions={{
            color: "#9CA3AF",
            weight: 3,
            dashArray: "8 6",
            opacity: 0.6,
          }}
        />

        {/* Traveled route - solid red line */}
        {traveledPath.length > 1 && (
          <Polyline
            positions={traveledPath}
            pathOptions={{
              color: "#FF4D4F",
              weight: 4,
              opacity: 0.9,
            }}
          />
        )}

        {/* Restaurant marker */}
        <Marker position={restPos} icon={restaurantIcon}>
          <Popup>
            <div className="text-center">
              <span className="text-sm font-bold">🍽️ Restauracja</span>
            </div>
          </Popup>
        </Marker>

        {/* Customer marker */}
        <Marker position={custPos} icon={customerIcon}>
          <Popup>
            <div className="text-center">
              <span className="text-sm font-bold">📍 Twoja lokalizacja</span>
            </div>
          </Popup>
        </Marker>

        {/* Delivery driver marker (animated during IN_DELIVERY) */}
        {status === "IN_DELIVERY" && (
          <AnimatedDeliveryMarker
            from={restPos}
            to={custPos}
            progress={deliveryProgress}
          />
        )}
      </MapContainer>
    </div>
  );
}
