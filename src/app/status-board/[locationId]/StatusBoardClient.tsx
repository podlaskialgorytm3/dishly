"use client";

import { useState, useEffect, useCallback } from "react";
import { getStatusBoardOrders } from "@/actions/kitchen";
import { ChefHat, Package, Clock, UtensilsCrossed } from "lucide-react";

type StatusBoardData = {
  location: {
    name: string;
    city: string;
    restaurantName: string;
    restaurantSlug: string;
    logoUrl: string | null;
  };
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    type: string;
    createdAt: string;
    estimatedDeliveryAt: string | null;
  }[];
} | null;

export default function StatusBoardClient({
  locationId,
  initialData,
}: {
  locationId: string;
  initialData: StatusBoardData;
}) {
  const [data, setData] = useState<StatusBoardData>(initialData);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Refresh data every 10 seconds
  const refreshData = useCallback(async () => {
    try {
      const updated = await getStatusBoardOrders(locationId);
      setData(updated);
    } catch {
      // Ignore errors
    }
  }, [locationId]);

  useEffect(() => {
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Update clock every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1F1F1F]">
        <p className="text-2xl text-white">
          Lokalizacja nie została znaleziona
        </p>
      </div>
    );
  }

  const preparingOrders = data.orders.filter((o) => o.status === "PREPARING");
  const readyOrders = data.orders.filter((o) => o.status === "READY");

  // Extract short order number (last part)
  const shortNumber = (orderNumber: string) => {
    const parts = orderNumber.split("-");
    return parts.length >= 3 ? parts[parts.length - 1] : orderNumber;
  };

  return (
    <div className="flex h-screen flex-col bg-[#1A1A2E] text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-[#16213E] px-8 py-4">
        <div className="flex items-center gap-4">
          {data.location.logoUrl ? (
            <img
              src={data.location.logoUrl}
              alt={data.location.restaurantName}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4D4F] to-[#FF8C42]">
              <UtensilsCrossed className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {data.location.restaurantName}
            </h1>
            <p className="text-sm text-white/60">
              {data.location.name} — {data.location.city}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold tabular-nums">
            {currentTime.toLocaleTimeString("pl-PL", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
          <p className="text-sm text-white/50">
            {currentTime.toLocaleDateString("pl-PL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </header>

      {/* Main content - two columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column - PREPARING */}
        <div className="flex flex-1 flex-col border-r border-white/10">
          <div className="flex items-center gap-3 bg-[#FF4D4F]/20 px-8 py-4">
            <ChefHat className="h-7 w-7 text-[#FF4D4F]" />
            <h2 className="text-2xl font-bold text-[#FF4D4F]">
              W PRZYGOTOWANIU
            </h2>
            <span className="ml-auto rounded-full bg-[#FF4D4F] px-4 py-1 text-lg font-bold">
              {preparingOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {preparingOrders.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-xl text-white/30">Brak zamówień</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {preparingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#FF4D4F]/30 bg-[#FF4D4F]/10 p-6 transition-all"
                  >
                    <span className="text-4xl font-black tabular-nums text-[#FF4D4F] lg:text-5xl">
                      {shortNumber(order.orderNumber)}
                    </span>
                    <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                      <Clock className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleTimeString("pl-PL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {order.type === "PICKUP" && (
                      <span className="mt-1.5 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">
                        Odbiór
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - READY */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-3 bg-[#4CAF50]/20 px-8 py-4">
            <Package className="h-7 w-7 text-[#4CAF50]" />
            <h2 className="text-2xl font-bold text-[#4CAF50]">DO ODBIORU</h2>
            <span className="ml-auto rounded-full bg-[#4CAF50] px-4 py-1 text-lg font-bold">
              {readyOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {readyOrders.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-xl text-white/30">Brak zamówień</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="animate-pulse-ready flex flex-col items-center justify-center rounded-2xl border-2 border-[#4CAF50]/40 bg-[#4CAF50]/15 p-6 transition-all"
                  >
                    <span className="text-5xl font-black tabular-nums text-[#4CAF50] lg:text-6xl">
                      {shortNumber(order.orderNumber)}
                    </span>
                    <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                      <Clock className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleTimeString("pl-PL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {order.type === "PICKUP" && (
                      <span className="mt-1.5 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">
                        Odbiór
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes pulse-ready {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-ready {
          animation: pulse-ready 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
