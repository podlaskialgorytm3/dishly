"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  ChefHat,
  Truck,
  Package,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Navigation,
  ShoppingBag,
  UtensilsCrossed,
  Timer,
} from "lucide-react";
import { getOrderTracking } from "@/actions/orders";

// ============================================
// TYPES
// ============================================

type OrderData = NonNullable<Awaited<ReturnType<typeof getOrderTracking>>>;

type StatusStep = {
  key: string;
  label: string;
  sublabel: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
};

// ============================================
// CONSTANTS
// ============================================

const ORDER_STATUSES: StatusStep[] = [
  {
    key: "PENDING",
    label: "Oczekujące",
    sublabel: "Zamówienie złożone",
    icon: ShoppingBag,
    color: "#FF8C42",
    bgColor: "#FFF3E8",
  },
  {
    key: "ACCEPTED",
    label: "Przyjęte",
    sublabel: "Restauracja potwierdziła",
    icon: CheckCircle2,
    color: "#4CAF50",
    bgColor: "#E8F5E9",
  },
  {
    key: "PREPARING",
    label: "W przygotowaniu",
    sublabel: "Kuchnia przygotowuje",
    icon: ChefHat,
    color: "#FF4D4F",
    bgColor: "#FFF1F1",
  },
  {
    key: "READY",
    label: "Gotowe",
    sublabel: "Czeka na kuriera",
    icon: Package,
    color: "#2196F3",
    bgColor: "#E3F2FD",
  },
  {
    key: "IN_DELIVERY",
    label: "W dostawie",
    sublabel: "Kurier w drodze",
    icon: Truck,
    color: "#9C27B0",
    bgColor: "#F3E5F5",
  },
  {
    key: "DELIVERED",
    label: "Dostarczone",
    sublabel: "Smacznego!",
    icon: UtensilsCrossed,
    color: "#4CAF50",
    bgColor: "#E8F5E9",
  },
];

const STATUS_INDEX: Record<string, number> = {};
ORDER_STATUSES.forEach((s, i) => {
  STATUS_INDEX[s.key] = i;
});

// ============================================
// DELIVERY MAP COMPONENT (Leaflet / OpenStreetMap)
// ============================================

type LeafletMapProps = {
  customerLat: number;
  customerLng: number;
  restaurantLat: number;
  restaurantLng: number;
  status: string;
  progress: number;
  deliveryAddress?: string;
  restaurantName?: string;
};

// Dynamically load map to avoid SSR issues with Leaflet
const LeafletMap = dynamic<LeafletMapProps>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  () => import("./LeafletMap") as any,
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[350px] items-center justify-center rounded-2xl border border-[#EEEEEE] bg-[#F8F9FA]">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-[#EEEEEE] border-t-[#FF4D4F]" />
          <p className="text-sm text-[#8C8C8C]">Ładowanie mapy...</p>
        </div>
      </div>
    ),
  },
);

function DeliveryMap({
  customerLat,
  customerLng,
  restaurantLat,
  restaurantLng,
  status,
  progress,
  deliveryAddress,
  restaurantName,
}: {
  customerLat: number | null;
  customerLng: number | null;
  restaurantLat: number | null;
  restaurantLng: number | null;
  status: string;
  progress: number;
  deliveryAddress?: string;
  restaurantName?: string;
}) {
  const custLat = customerLat ?? 52.2297;
  const custLng = customerLng ?? 21.0122;
  const restLat = restaurantLat ?? 52.2351;
  const restLng = restaurantLng ?? 21.0022;

  // Haversine distance
  const distance = useMemo(() => {
    const R = 6371;
    const dLat = ((custLat - restLat) * Math.PI) / 180;
    const dLng = ((custLng - restLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((restLat * Math.PI) / 180) *
        Math.cos((custLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [custLat, custLng, restLat, restLng]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
      <LeafletMap
        customerLat={custLat}
        customerLng={custLng}
        restaurantLat={restLat}
        restaurantLng={restLng}
        status={status}
        progress={progress}
        deliveryAddress={deliveryAddress}
        restaurantName={restaurantName}
      />
      {/* Map overlay info */}
      <div className="absolute bottom-3 left-3 z-[1000] flex gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF4D4F]" />
          Restauracja
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-[#4CAF50]" />
          Twoja lokalizacja
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
          ~{distance.toFixed(1)} km
        </div>
      </div>
    </div>
  );
}

// ============================================
// COUNTDOWN TIMER
// ============================================

function CountdownTimer({
  estimatedDeliveryAt,
  status,
}: {
  estimatedDeliveryAt: string | null;
  status: string;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
    total: number;
    expired: boolean;
  }>({ minutes: 0, seconds: 0, total: 0, expired: false });

  useEffect(() => {
    if (
      !estimatedDeliveryAt ||
      status === "DELIVERED" ||
      status === "CANCELLED"
    ) {
      return;
    }

    const target = new Date(estimatedDeliveryAt).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, total: 0, expired: true });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ minutes, seconds, total: totalSeconds, expired: false });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [estimatedDeliveryAt, status]);

  if (status === "DELIVERED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
        <div>
          <p className="text-lg font-bold text-green-700">Dostarczone!</p>
          <p className="text-sm text-green-600">Smacznego! 🎉</p>
        </div>
      </div>
    );
  }

  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4">
        <XCircle className="h-8 w-8 text-red-500" />
        <div>
          <p className="text-lg font-bold text-red-700">Anulowane</p>
          <p className="text-sm text-red-600">Zamówienie zostało anulowane</p>
        </div>
      </div>
    );
  }

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4">
        <Timer className="h-8 w-8 text-amber-500" />
        <div>
          <p className="text-lg font-bold text-amber-700">
            Czas szacunkowy minął
          </p>
          <p className="text-sm text-amber-600">
            Twoje zamówienie jest już w drodze
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[#FFF1F1] p-4">
      <Timer className="h-8 w-8 text-[#FF4D4F]" />
      <div>
        <p className="text-sm font-medium text-[#8C8C8C]">
          Szacowany czas dostawy
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tabular-nums text-[#1F1F1F]">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-lg text-[#8C8C8C]">min</span>
          <span className="text-3xl font-bold tabular-nums text-[#1F1F1F]">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-lg text-[#8C8C8C]">sek</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STATUS STEPS
// ============================================

function StatusSteps({ currentStatus }: { currentStatus: string }) {
  const currentIdx = STATUS_INDEX[currentStatus] ?? -1;
  const isCancelled = currentStatus === "CANCELLED";

  return (
    <div className="space-y-0">
      {ORDER_STATUSES.map((step, idx) => {
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture = idx > currentIdx;

        return (
          <div key={step.key} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  isCancelled && isCurrent
                    ? "bg-red-100"
                    : isComplete
                      ? "bg-green-100"
                      : isCurrent
                        ? `bg-[${step.bgColor}]`
                        : "bg-[#F5F5F5]"
                }`}
                style={{
                  backgroundColor: isCancelled
                    ? "#FEE2E2"
                    : isComplete
                      ? "#E8F5E9"
                      : isCurrent
                        ? step.bgColor
                        : "#F5F5F5",
                }}
              >
                {isCancelled && isCurrent ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <step.icon
                    className="h-5 w-5"
                    style={{
                      color: isCurrent ? step.color : "#CCCCCC",
                    }}
                  />
                )}
              </div>
              {idx < ORDER_STATUSES.length - 1 && (
                <div
                  className="w-0.5 flex-1"
                  style={{
                    minHeight: "24px",
                    backgroundColor: isComplete ? "#4CAF50" : "#EEEEEE",
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <p
                className={`font-semibold ${
                  isCancelled && isCurrent
                    ? "text-red-600"
                    : isComplete || isCurrent
                      ? "text-[#1F1F1F]"
                      : "text-[#CCCCCC]"
                }`}
              >
                {isCancelled && isCurrent ? "Anulowane" : step.label}
              </p>
              <p
                className={`text-sm ${
                  isComplete || isCurrent ? "text-[#8C8C8C]" : "text-[#DDDDDD]"
                }`}
              >
                {isCancelled && isCurrent
                  ? "Zamówienie zostało anulowane"
                  : step.sublabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function OrderTrackingClient({ order }: { order: OrderData }) {
  const router = useRouter();
  const [data, setData] = useState(order);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 10 seconds for active orders
  useEffect(() => {
    if (data.status === "DELIVERED" || data.status === "CANCELLED") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await getOrderTracking(data.id);
        if (updated) setData(updated);
      } catch (e) {
        // Ignore
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [data.id, data.status]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updated = await getOrderTracking(data.id);
      if (updated) setData(updated);
    } catch (e) {
      // Ignore
    }
    setIsRefreshing(false);
  }, [data.id]);

  // Calculate progress for map
  const overallProgress = (() => {
    if (!data.estimatedDeliveryAt) return 0;
    const created = new Date(data.createdAt).getTime();
    const estimated = new Date(data.estimatedDeliveryAt).getTime();
    const now = Date.now();
    if (now >= estimated) return 1;
    return Math.min((now - created) / (estimated - created), 1);
  })();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const currentStatusStep =
    ORDER_STATUSES.find((s) => s.key === data.status) ?? ORDER_STATUSES[0];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b border-[#EEEEEE] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-[#8C8C8C] hover:text-[#1F1F1F]"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Link>

          <div className="text-center">
            <p className="text-xs text-[#8C8C8C]">Zamówienie</p>
            <p className="font-mono text-sm font-bold text-[#1F1F1F]">
              {data.orderNumber}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-full bg-[#F5F5F5] px-3 py-1.5 text-xs font-medium text-[#8C8C8C] transition-all hover:bg-[#EEEEEE]"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Odśwież
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left column - Map + Timer */}
          <div className="space-y-4 lg:col-span-3">
            {/* Status banner */}
            <div
              className="flex items-center gap-3 rounded-2xl p-4"
              style={{ backgroundColor: currentStatusStep.bgColor }}
            >
              <currentStatusStep.icon
                className="h-6 w-6"
                style={{ color: currentStatusStep.color }}
              />
              <div>
                <p
                  className="text-lg font-bold"
                  style={{ color: currentStatusStep.color }}
                >
                  {data.status === "CANCELLED"
                    ? "Anulowane"
                    : currentStatusStep.label}
                </p>
                <p
                  className="text-sm"
                  style={{ color: currentStatusStep.color }}
                >
                  {data.status === "CANCELLED"
                    ? "Zamówienie zostało anulowane"
                    : currentStatusStep.sublabel}
                </p>
              </div>
            </div>

            {/* Countdown Timer */}
            <CountdownTimer
              estimatedDeliveryAt={data.estimatedDeliveryAt}
              status={data.status}
            />

            {/* Map */}
            <DeliveryMap
              customerLat={data.customerLat}
              customerLng={data.customerLng}
              restaurantLat={data.location.latitude}
              restaurantLng={data.location.longitude}
              status={data.status}
              progress={overallProgress}
              deliveryAddress={data.deliveryAddress ?? undefined}
              restaurantName={data.restaurantName ?? data.location.name}
            />

            {/* Restaurant info */}
            <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F1] text-2xl">
                {data.location.restaurantLogoUrl ? (
                  <img
                    src={data.location.restaurantLogoUrl}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  "🍽️"
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1F1F1F]">
                  {data.location.restaurantName}
                </p>
                <p className="text-sm text-[#8C8C8C]">
                  {data.location.address}, {data.location.city}
                </p>
              </div>
              {data.location.phone && (
                <a
                  href={`tel:${data.location.phone}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5] text-[#8C8C8C] hover:bg-[#FF4D4F] hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Delivery address */}
            {data.deliveryAddress && (
              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <MapPin className="h-5 w-5 text-[#FF4D4F]" />
                <div>
                  <p className="text-xs font-medium text-[#8C8C8C]">
                    Adres dostawy
                  </p>
                  <p className="text-sm font-medium text-[#1F1F1F]">
                    {data.deliveryAddress}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Status Steps + Order Details */}
          <div className="space-y-4 lg:col-span-2">
            {/* Status Progress */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#8C8C8C]">
                Status zamówienia
              </h3>
              <StatusSteps currentStatus={data.status} />

              {/* Timestamps */}
              <div className="mt-2 space-y-1 border-t border-[#F5F5F5] pt-3">
                <div className="flex justify-between text-xs text-[#8C8C8C]">
                  <span>Złożono</span>
                  <span>{formatTime(data.createdAt)}</span>
                </div>
                {data.acceptedAt && (
                  <div className="flex justify-between text-xs text-[#8C8C8C]">
                    <span>Przyjęto</span>
                    <span>{formatTime(data.acceptedAt)}</span>
                  </div>
                )}
                {data.preparingAt && (
                  <div className="flex justify-between text-xs text-[#8C8C8C]">
                    <span>Przygotowywanie</span>
                    <span>{formatTime(data.preparingAt)}</span>
                  </div>
                )}
                {data.readyAt && (
                  <div className="flex justify-between text-xs text-[#8C8C8C]">
                    <span>Gotowe</span>
                    <span>{formatTime(data.readyAt)}</span>
                  </div>
                )}
                {data.inDeliveryAt && (
                  <div className="flex justify-between text-xs text-[#8C8C8C]">
                    <span>Wysłano</span>
                    <span>{formatTime(data.inDeliveryAt)}</span>
                  </div>
                )}
                {data.deliveredAt && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Dostarczone</span>
                    <span>{formatTime(data.deliveredAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order items */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#8C8C8C]">
                Twoje zamówienie
              </h3>
              <div className="space-y-3">
                {data.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 border-b border-[#F5F5F5] pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F5F5] text-lg">
                      {item.mealImageUrl ? (
                        <img
                          src={item.mealImageUrl}
                          alt=""
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        "🍽️"
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1F1F1F]">
                        {item.quantity}× {item.mealName}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-[#8C8C8C]">
                          Rozmiar: {item.variantName}
                        </p>
                      )}
                      {item.addons.length > 0 && (
                        <p className="text-xs text-[#8C8C8C]">
                          +{" "}
                          {item.addons
                            .map(
                              (a) =>
                                `${a.name}${a.quantity > 1 ? ` ×${a.quantity}` : ""}`,
                            )
                            .join(", ")}
                        </p>
                      )}
                      {item.note && (
                        <p className="text-xs italic text-[#AAAAAA]">
                          „{item.note}"
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#1F1F1F]">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="mt-4 space-y-1.5 border-t border-[#F5F5F5] pt-3">
                <div className="flex justify-between text-sm text-[#8C8C8C]">
                  <span>Produkty</span>
                  <span>{formatPrice(data.subtotal)}</span>
                </div>
                {data.discountPercent > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Rabat ({data.discountPercent}%)</span>
                    <span>
                      -
                      {formatPrice(
                        data.subtotal * (data.discountPercent / 100),
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-[#8C8C8C]">
                  <span>Dostawa</span>
                  <span>
                    {data.deliveryFee === 0
                      ? "Darmowa"
                      : formatPrice(data.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#EEEEEE] pt-1.5 text-base font-bold text-[#1F1F1F]">
                  <span>Razem</span>
                  <span>{formatPrice(data.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Order info */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8C8C8C]">Numer zamówienia</span>
                  <span className="font-mono font-medium text-[#1F1F1F]">
                    {data.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C8C8C]">Data</span>
                  <span className="text-[#1F1F1F]">
                    {new Date(data.createdAt).toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C8C8C]">Płatność</span>
                  {data.paymentStatus === "PAID" ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Opłacone
                    </span>
                  ) : data.paymentStatus === "PENDING" ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Oczekuje na płatność
                    </span>
                  ) : data.paymentStatus === "FAILED" ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Płatność nieudana
                    </span>
                  ) : data.paymentStatus === "REFUNDED" ? (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      Zwrócone
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {data.paymentStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
