"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getStatusBoardOrders } from "@/actions/kitchen";
import { useOrderNotification } from "@/hooks/use-order-notification";
import {
  ChefHat,
  Package,
  Clock,
  UtensilsCrossed,
  Bell,
  Truck,
  ShoppingBag,
  Timer,
} from "lucide-react";

type OrderData = {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  createdAt: string;
  estimatedDeliveryAt: string | null;
  acceptedAt: string | null;
  preparingAt: string | null;
};

type StatusBoardData = {
  location: {
    name: string;
    city: string;
    restaurantName: string;
    restaurantSlug: string;
    logoUrl: string | null;
  };
  orders: OrderData[];
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
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [activated, setActivated] = useState(false);
  const previousOrderIdsRef = useRef<Set<string>>(
    new Set(initialData?.orders.map((o) => o.id) ?? []),
  );

  const { playNotification, requestNotificationPermission } =
    useOrderNotification();

  // Activate board on first interaction (required for audio)
  const handleActivate = useCallback(() => {
    setActivated(true);
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Refresh data every 10 seconds
  const refreshData = useCallback(async () => {
    try {
      const updated = await getStatusBoardOrders(locationId);
      if (updated) {
        const currentIds = new Set(updated.orders.map((o) => o.id));
        const prevIds = previousOrderIdsRef.current;

        // Detect new orders
        const brandNew = new Set<string>();
        for (const id of currentIds) {
          if (!prevIds.has(id)) {
            brandNew.add(id);
          }
        }

        if (brandNew.size > 0 && activated) {
          playNotification();
          setNewOrderIds(brandNew);
          // Clear "new" highlight after 8 seconds
          setTimeout(() => setNewOrderIds(new Set()), 8000);
        }

        previousOrderIdsRef.current = currentIds;
      }
      setData(updated);
    } catch {
      // Ignore errors silently
    }
  }, [locationId, activated, playNotification]);

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

  // Calculate time elapsed since a given date
  const elapsedMinutes = (from: string) => {
    const diff = currentTime.getTime() - new Date(from).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  };

  // Format ETA time
  const formatETA = (eta: string) => {
    return new Date(eta).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A1A]">
        <p className="text-2xl text-white/60">
          Lokalizacja nie została znaleziona
        </p>
      </div>
    );
  }

  // Activation screen — required for browser audio autoplay policy
  if (!activated) {
    return (
      <div
        className="flex h-screen cursor-pointer flex-col items-center justify-center gap-6 bg-[#0A0A1A] text-white"
        onClick={handleActivate}
      >
        <div className="relative">
          <div className="sb-glow-ring absolute -inset-8 rounded-full bg-linear-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 blur-xl" />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-amber-500 to-orange-600 shadow-2xl shadow-orange-500/30">
            <Bell className="h-16 w-16 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold">{data.location.restaurantName}</h1>
          <p className="mt-2 text-lg text-white/50">
            {data.location.name} — {data.location.city}
          </p>
        </div>
        <p className="sb-blink mt-4 text-xl text-white/70">
          Kliknij aby aktywować tablicę zamówień
        </p>
        <p className="text-sm text-white/30">
          Wymagane do odtwarzania powiadomień dźwiękowych
        </p>
      </div>
    );
  }

  const acceptedOrders = data.orders.filter((o) => o.status === "ACCEPTED");
  const preparingOrders = data.orders.filter((o) => o.status === "PREPARING");
  const readyOrders = data.orders.filter((o) => o.status === "READY");
  const totalActive = acceptedOrders.length + preparingOrders.length;

  // Short order number (last segment)
  const shortNumber = (orderNumber: string) => {
    const parts = orderNumber.split("-");
    return parts.length >= 3 ? parts[parts.length - 1] : orderNumber;
  };

  const OrderCard = ({
    order,
    variant,
  }: {
    order: OrderData;
    variant: "accepted" | "preparing" | "ready";
  }) => {
    const isNew = newOrderIds.has(order.id);
    const elapsed =
      variant === "preparing" && order.preparingAt
        ? elapsedMinutes(order.preparingAt)
        : elapsedMinutes(order.createdAt);

    const colors = {
      accepted: {
        border: "border-amber-400/50",
        bg: "bg-amber-400/10",
        text: "text-amber-400",
        glow: "shadow-amber-400/20",
      },
      preparing: {
        border: "border-[#FF4D4F]/40",
        bg: "bg-[#FF4D4F]/10",
        text: "text-[#FF4D4F]",
        glow: "shadow-[#FF4D4F]/20",
      },
      ready: {
        border: "border-emerald-400/50",
        bg: "bg-emerald-400/12",
        text: "text-emerald-400",
        glow: "shadow-emerald-400/30",
      },
    };

    const c = colors[variant];

    return (
      <div
        className={`sb-card-enter relative flex flex-col items-center justify-center rounded-2xl border-2 ${c.border} ${c.bg} p-5 shadow-lg ${c.glow} transition-all duration-300 ${
          isNew ? "sb-new-order" : ""
        } ${variant === "ready" ? "sb-pulse-ready" : ""}`}
      >
        {/* Order number */}
        <span
          className={`font-black tabular-nums ${c.text} ${
            variant === "ready"
              ? "text-5xl lg:text-7xl"
              : "text-4xl lg:text-5xl"
          }`}
        >
          {shortNumber(order.orderNumber)}
        </span>

        {/* Time info */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-white/40">
          <Clock className="h-3 w-3" />
          {new Date(order.createdAt).toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {variant !== "ready" && (
            <span className="ml-1 text-white/25">• {elapsed} min</span>
          )}
        </div>

        {/* ETA */}
        {order.estimatedDeliveryAt && variant !== "ready" && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-white/30">
            <Timer className="h-3 w-3" />
            ETA {formatETA(order.estimatedDeliveryAt)}
          </div>
        )}

        {/* Order type badge */}
        <div className="mt-2">
          {order.type === "PICKUP" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-300">
              <ShoppingBag className="h-3 w-3" />
              Odbiór
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
              <Truck className="h-3 w-3" />
              Dostawa
            </span>
          )}
        </div>

        {/* New indicator */}
        {isNew && (
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center">
            <span className="sb-ping absolute h-full w-full rounded-full bg-amber-400/60" />
            <span className="relative h-3 w-3 rounded-full bg-amber-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-[#0A0A1A] text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/6 bg-[#0F0F23] px-8 py-3">
        <div className="flex items-center gap-4">
          {data.location.logoUrl ? (
            <img
              src={data.location.logoUrl}
              alt={data.location.restaurantName}
              className="h-12 w-12 rounded-xl object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
              <UtensilsCrossed className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {data.location.restaurantName}
            </h1>
            <p className="text-sm text-white/40">
              {data.location.name} — {data.location.city}
            </p>
          </div>
        </div>

        {/* Center: summary counters */}
        <div className="hidden items-center gap-6 md:flex">
          {acceptedOrders.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2">
              <Bell className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">
                {acceptedOrders.length} nowe
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg bg-[#FF4D4F]/10 px-4 py-2">
            <ChefHat className="h-4 w-4 text-[#FF4D4F]" />
            <span className="text-sm font-medium text-[#FF4D4F]">
              {preparingOrders.length} gotowane
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2">
            <Package className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              {readyOrders.length} gotowe
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-4xl font-bold tabular-nums tracking-tight">
            {currentTime.toLocaleTimeString("pl-PL", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
          <p className="text-sm text-white/30">
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
        {/* Left column - ACCEPTED + PREPARING */}
        <div className="flex flex-1 flex-col border-r border-white/6">
          {/* Accepted sub-header (if any) */}
          {acceptedOrders.length > 0 && (
            <>
              <div className="flex items-center gap-3 border-b border-white/6 bg-amber-500/8 px-8 py-3">
                <Bell className="h-6 w-6 text-amber-400" />
                <h2 className="text-xl font-bold text-amber-400">
                  NOWE ZAMÓWIENIA
                </h2>
                <span className="ml-auto rounded-full bg-amber-400 px-3.5 py-0.5 text-base font-bold text-black">
                  {acceptedOrders.length}
                </span>
              </div>
              <div className="border-b border-white/6 bg-amber-500/4 p-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
                  {acceptedOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      variant="accepted"
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Preparing header */}
          <div className="flex items-center gap-3 bg-[#FF4D4F]/8 px-8 py-3">
            <ChefHat className="h-6 w-6 text-[#FF4D4F]" />
            <h2 className="text-xl font-bold text-[#FF4D4F]">
              W PRZYGOTOWANIU
            </h2>
            <span className="ml-auto rounded-full bg-[#FF4D4F] px-3.5 py-0.5 text-base font-bold">
              {preparingOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {preparingOrders.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <ChefHat className="mx-auto h-16 w-16 text-white/10" />
                  <p className="mt-3 text-lg text-white/20">
                    Brak zamówień w przygotowaniu
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {preparingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} variant="preparing" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - READY */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-3 bg-emerald-500/8 px-8 py-3">
            <Package className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-emerald-400">DO ODBIORU</h2>
            <span className="ml-auto rounded-full bg-emerald-500 px-3.5 py-0.5 text-base font-bold">
              {readyOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {readyOrders.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Package className="mx-auto h-16 w-16 text-white/10" />
                  <p className="mt-3 text-lg text-white/20">
                    Brak zamówień do odbioru
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {readyOrders.map((order) => (
                  <OrderCard key={order.id} order={order} variant="ready" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar - total orders today */}
      <footer className="flex items-center justify-between border-t border-white/6 bg-[#0F0F23] px-8 py-2">
        <p className="text-sm text-white/30">
          Łącznie aktywnych:{" "}
          <span className="font-bold text-white/60">
            {totalActive + readyOrders.length}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 sb-live-dot" />
          <span className="text-sm text-white/30">LIVE</span>
        </div>
      </footer>

      {/* Animation styles */}
      <style>{`
        @keyframes sb-pulse-ready {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.3); }
          50% { transform: scale(1.03); box-shadow: 0 0 20px 4px rgba(52, 211, 153, 0.15); }
        }
        .sb-pulse-ready {
          animation: sb-pulse-ready 2.5s ease-in-out infinite;
        }

        @keyframes sb-card-enter {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sb-card-enter {
          animation: sb-card-enter 0.4s ease-out;
        }

        @keyframes sb-new-flash {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
          25% { box-shadow: 0 0 24px 8px rgba(251, 191, 36, 0.4); }
          50% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
          75% { box-shadow: 0 0 24px 8px rgba(251, 191, 36, 0.4); }
        }
        .sb-new-order {
          animation: sb-new-flash 1.5s ease-in-out 3;
        }

        @keyframes sb-ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .sb-ping {
          animation: sb-ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes sb-glow-ring {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .sb-glow-ring {
          animation: sb-glow-ring 3s ease-in-out infinite;
        }

        @keyframes sb-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .sb-blink {
          animation: sb-blink 2s ease-in-out infinite;
        }

        @keyframes sb-live-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .sb-live-dot {
          animation: sb-live-dot 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
