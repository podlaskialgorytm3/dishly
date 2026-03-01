"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  Truck,
  Package,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User,
  MessageSquare,
  UtensilsCrossed,
  Timer,
  AlertCircle,
  Plus,
  Minus,
  CreditCard,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Settings,
  Monitor,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getKitchenOrders,
  updateKitchenOrderStatus,
  updateEstimatedTime,
  updateLocationETAOffset,
  type KitchenOrder,
} from "@/actions/kitchen";
import { useOrderNotification } from "@/hooks/use-order-notification";

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
    color: string;
    bgColor: string;
    borderColor: string;
    pulseColor: string;
    nextStatus: string | null;
    nextLabel: string | null;
  }
> = {
  PENDING: {
    label: "Nowe",
    icon: ShoppingBag,
    color: "#FF8C42",
    bgColor: "#FFF3E8",
    borderColor: "#FFD9B3",
    pulseColor: "rgba(255, 140, 66, 0.4)",
    nextStatus: "ACCEPTED",
    nextLabel: "Przyjmij",
  },
  ACCEPTED: {
    label: "Przyjęte",
    icon: CheckCircle2,
    color: "#4CAF50",
    bgColor: "#E8F5E9",
    borderColor: "#A5D6A7",
    pulseColor: "rgba(76, 175, 80, 0.3)",
    nextStatus: "PREPARING",
    nextLabel: "Przygotowuj",
  },
  PREPARING: {
    label: "W przygotowaniu",
    icon: ChefHat,
    color: "#FF4D4F",
    bgColor: "#FFF1F1",
    borderColor: "#FFAAAB",
    pulseColor: "rgba(255, 77, 79, 0.3)",
    nextStatus: "READY",
    nextLabel: "Gotowe",
  },
  READY: {
    label: "Gotowe",
    icon: Package,
    color: "#2196F3",
    bgColor: "#E3F2FD",
    borderColor: "#90CAF9",
    pulseColor: "rgba(33, 150, 243, 0.3)",
    nextStatus: "IN_DELIVERY",
    nextLabel: "Wydaj / Wyślij",
  },
  IN_DELIVERY: {
    label: "W dostawie",
    icon: Truck,
    color: "#9C27B0",
    bgColor: "#F3E5F5",
    borderColor: "#CE93D8",
    pulseColor: "rgba(156, 39, 176, 0.3)",
    nextStatus: "DELIVERED",
    nextLabel: "Dostarczone",
  },
  DELIVERED: {
    label: "Dostarczone",
    icon: UtensilsCrossed,
    color: "#4CAF50",
    bgColor: "#E8F5E9",
    borderColor: "#A5D6A7",
    pulseColor: "rgba(76, 175, 80, 0.2)",
    nextStatus: null,
    nextLabel: null,
  },
  CANCELLED: {
    label: "Anulowane",
    icon: XCircle,
    color: "#F44336",
    bgColor: "#FFEBEE",
    borderColor: "#EF9A9A",
    pulseColor: "rgba(244, 67, 54, 0.2)",
    nextStatus: null,
    nextLabel: null,
  },
};

// ============================================
// KITCHEN ORDER CARD
// ============================================

function KitchenOrderCard({
  order,
  isNew,
  onStatusUpdate,
}: {
  order: KitchenOrder;
  isNew: boolean;
  onStatusUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showTimeEditor, setShowTimeEditor] = useState(false);
  const [editedTime, setEditedTime] = useState(order.estimatedTime ?? 30);
  const [isTimePending, startTimeTransition] = useTransition();
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

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

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateKitchenOrderStatus(
        order.id,
        newStatus as Parameters<typeof updateKitchenOrderStatus>[1],
      );
      if (result.success) {
        onStatusUpdate();
      }
    });
  };

  // Time since order was placed
  const minutesSincePlaced = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / 60000,
  );

  // Max prep time from items
  const maxPrepTime = Math.max(...order.items.map((i) => i.preparationTime), 0);

  return (
    <div
      className={`overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 hover:shadow-lg ${
        isNew ? "animate-pulse-border" : ""
      }`}
      style={{
        borderColor: config.borderColor,
        boxShadow: isNew
          ? `0 0 20px ${config.pulseColor}, 0 0 40px ${config.pulseColor}`
          : undefined,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: config.bgColor }}
      >
        <div className="flex items-center gap-2">
          <config.icon className="h-5 w-5" style={{ color: config.color }} />
          <span className="text-sm font-bold" style={{ color: config.color }}>
            {config.label}
          </span>
          <span className="font-mono text-sm font-bold text-[#1F1F1F]">
            {order.orderNumber}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {order.type === "PICKUP" && (
            <span className="flex items-center gap-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              <Package className="h-3 w-3" />
              Odbiór
            </span>
          )}
          {order.type === "DELIVERY" && (
            <span className="flex items-center gap-0.5 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              <Truck className="h-3 w-3" />
              Dostawa
            </span>
          )}
          <span className="flex items-center gap-1 text-xs font-medium text-[#8C8C8C]">
            <Clock className="h-3 w-3" />
            {minutesSincePlaced} min
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Customer info */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#8C8C8C]" />
            <span className="text-sm font-medium text-[#1F1F1F]">
              {order.customer.name || "Gość"}
            </span>
          </div>
          {(order.customer.phone || order.guestPhone) && (
            <a
              href={`tel:${order.customer.phone || order.guestPhone}`}
              className="flex items-center gap-1 rounded-full bg-[#F5F5F5] px-2 py-1 text-xs text-[#8C8C8C] hover:bg-[#EEEEEE]"
            >
              <Phone className="h-3 w-3" />
              {order.customer.phone || order.guestPhone}
            </a>
          )}
        </div>

        {/* Items - always visible in kitchen */}
        <div className="mb-3 space-y-1.5">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between">
              <div className="flex-1">
                <span className="text-sm text-[#1F1F1F]">
                  <span className="rounded bg-[#FF4D4F]/10 px-1.5 py-0.5 font-bold text-[#FF4D4F]">
                    {item.quantity}×
                  </span>{" "}
                  <span className="font-medium">{item.mealName}</span>
                </span>
                {item.variantName && (
                  <span className="ml-1 text-xs text-[#8C8C8C]">
                    ({item.variantName})
                  </span>
                )}
                {item.addons.length > 0 && (
                  <p className="ml-7 text-xs text-[#AAAAAA]">
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
                  <p className="ml-7 mt-0.5 flex items-center gap-1 text-xs italic text-amber-600">
                    <MessageSquare className="h-3 w-3" />
                    {item.note}
                  </p>
                )}
              </div>
              <span className="ml-2 flex items-center gap-1 text-xs text-[#8C8C8C]">
                <Timer className="h-3 w-3" />
                {item.preparationTime}m
              </span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 border border-amber-200">
            <span className="font-semibold">⚠️ Uwagi:</span> {order.notes}
          </div>
        )}

        {/* Delivery info */}
        {order.deliveryAddress && (
          <div className="mb-3 flex items-start gap-1.5 rounded-lg bg-[#F5F5F5] px-3 py-2 text-xs text-[#8C8C8C]">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{order.deliveryAddress}</span>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between border-t border-[#F5F5F5] pt-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-[#1F1F1F]">
              {formatPrice(order.totalPrice)}
            </span>
            {order.estimatedTime && !showTimeEditor && (
              <button
                onClick={() => {
                  setEditedTime(order.estimatedTime ?? 30);
                  setShowTimeEditor(true);
                }}
                className="flex items-center gap-1 rounded-full bg-[#F5F5F5] px-2 py-1 text-xs text-[#8C8C8C] transition-colors hover:bg-[#EEEEEE]"
              >
                <Timer className="h-3 w-3" />~{order.estimatedTime} min
              </button>
            )}
            <span className="flex items-center gap-1 rounded-full bg-[#FFF3E8] px-2 py-1 text-xs text-[#FF8C42]">
              <ChefHat className="h-3 w-3" />
              max {maxPrepTime}m
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-[#8C8C8C] hover:text-[#1F1F1F]"
          >
            {expanded ? (
              <>
                Zwiń <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Szczegóły <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        </div>

        {/* Time editor */}
        {showTimeEditor &&
          !["DELIVERED", "CANCELLED"].includes(order.status) && (
            <div className="mt-3 rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-3">
              <p className="mb-2 text-xs font-semibold text-[#1F1F1F]">
                Zmień szacowany czas realizacji
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setEditedTime((t) => Math.max(5, t - 5))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EEEEEE] text-[#8C8C8C] hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={editedTime}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v >= 5 && v <= 180) setEditedTime(v);
                  }}
                  className="w-14 rounded-lg border border-[#EEEEEE] py-1 text-center text-sm font-bold focus:border-[#FF4D4F] focus:outline-none"
                  min={5}
                  max={180}
                />
                <span className="text-xs text-[#8C8C8C]">min</span>
                <button
                  onClick={() => setEditedTime((t) => Math.min(180, t + 5))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EEEEEE] text-[#8C8C8C] hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <div className="flex gap-1">
                  {[15, 30, 45, 60].map((t) => (
                    <button
                      key={t}
                      onClick={() => setEditedTime(t)}
                      className={`rounded-md px-2 py-1 text-xs transition-colors ${
                        editedTime === t
                          ? "bg-[#FF4D4F] text-white"
                          : "border border-[#EEEEEE] bg-white text-[#8C8C8C] hover:border-[#FF4D4F]"
                      }`}
                    >
                      {t}m
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTimeEditor(false)}
                  className="h-8 rounded-lg text-xs"
                  disabled={isTimePending}
                >
                  Anuluj
                </Button>
                <Button
                  onClick={() => {
                    startTimeTransition(async () => {
                      const result = await updateEstimatedTime(
                        order.id,
                        editedTime,
                      );
                      if (result.success) {
                        setShowTimeEditor(false);
                        onStatusUpdate();
                      }
                    });
                  }}
                  disabled={isTimePending}
                  className="h-8 rounded-lg bg-[#FF4D4F] text-xs text-white hover:bg-[#FF3B30]"
                >
                  {isTimePending ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    "Zapisz"
                  )}
                </Button>
              </div>
            </div>
          )}

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 space-y-2 border-t border-[#F5F5F5] pt-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#8C8C8C]">Złożono:</span>{" "}
                <span className="text-[#1F1F1F]">
                  {new Date(order.createdAt).toLocaleString("pl-PL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              {order.acceptedAt && (
                <div>
                  <span className="text-[#8C8C8C]">Przyjęto:</span>{" "}
                  <span className="text-[#1F1F1F]">
                    {formatTime(order.acceptedAt)}
                  </span>
                </div>
              )}
              {order.preparingAt && (
                <div>
                  <span className="text-[#8C8C8C]">Przygotowywanie:</span>{" "}
                  <span className="text-[#1F1F1F]">
                    {formatTime(order.preparingAt)}
                  </span>
                </div>
              )}
              {order.readyAt && (
                <div>
                  <span className="text-[#8C8C8C]">Gotowe:</span>{" "}
                  <span className="text-[#1F1F1F]">
                    {formatTime(order.readyAt)}
                  </span>
                </div>
              )}
              {order.deliveredAt && (
                <div>
                  <span className="text-green-600">Dostarczone:</span>{" "}
                  <span className="text-green-700">
                    {formatTime(order.deliveredAt)}
                  </span>
                </div>
              )}
              {order.estimatedDeliveryAt && (
                <div>
                  <span className="text-[#8C8C8C]">ETA:</span>{" "}
                  <span className="font-medium text-[#FF4D4F]">
                    {formatTime(order.estimatedDeliveryAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {config.nextStatus && (
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => handleStatusChange(config.nextStatus!)}
              disabled={isPending}
              className="flex-1 gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: config.color }}
            >
              {isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : null}
              {config.nextLabel}
            </Button>
            {!["IN_DELIVERY", "DELIVERED"].includes(order.status) && (
              <Button
                onClick={() => handleStatusChange("CANCELLED")}
                disabled={isPending}
                variant="outline"
                className="rounded-xl border-red-200 px-4 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// ETA OFFSET PANEL
// ============================================

function ETAOffsetPanel({
  currentOffset,
  onUpdate,
}: {
  currentOffset: number;
  onUpdate: (offset: number) => void;
}) {
  const [offset, setOffset] = useState(currentOffset);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-[#EEEEEE] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Settings className="h-5 w-5 text-[#FF4D4F]" />
        <h3 className="text-sm font-bold text-[#1F1F1F]">Narzut czasu ETA</h3>
      </div>
      <p className="mb-3 text-xs text-[#8C8C8C]">
        Dodaj lub odejmij minuty do szacowanego czasu realizacji dla wszystkich
        nowych zamówień. Użyj w godzinach szczytu.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOffset((o) => Math.max(-30, o - 5))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EEEEEE] text-[#8C8C8C] transition-colors hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
        >
          <Minus className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1">
          <span
            className={`text-2xl font-bold ${
              offset > 0
                ? "text-[#FF4D4F]"
                : offset < 0
                  ? "text-[#4CAF50]"
                  : "text-[#1F1F1F]"
            }`}
          >
            {offset > 0 ? "+" : ""}
            {offset}
          </span>
          <span className="text-sm text-[#8C8C8C]">min</span>
        </div>
        <button
          onClick={() => setOffset((o) => Math.min(120, o + 5))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EEEEEE] text-[#8C8C8C] transition-colors hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
        >
          <Plus className="h-5 w-5" />
        </button>
        <div className="flex gap-1">
          {[0, 15, 30].map((v) => (
            <button
              key={v}
              onClick={() => setOffset(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                offset === v
                  ? "bg-[#FF4D4F] text-white"
                  : "border border-[#EEEEEE] bg-white text-[#8C8C8C] hover:border-[#FF4D4F]"
              }`}
            >
              {v === 0 ? "Reset" : `+${v}m`}
            </button>
          ))}
        </div>
        <Button
          onClick={() => {
            startTransition(async () => {
              onUpdate(offset);
            });
          }}
          disabled={isPending || offset === currentOffset}
          className="rounded-xl bg-[#FF4D4F] px-4 text-sm text-white hover:bg-[#FF3B30]"
        >
          {isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            "Zastosuj"
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================
// FILTER TABS
// ============================================

const KITCHEN_FILTERS = [
  { key: "active", label: "Bieżące" },
  { key: "PENDING", label: "Nowe" },
  { key: "ACCEPTED", label: "Przyjęte" },
  { key: "PREPARING", label: "W przygotowaniu" },
  { key: "READY", label: "Gotowe" },
  { key: "history", label: "Historia dnia" },
];

// ============================================
// MAIN LIVE KITCHEN PANEL
// ============================================

export default function LiveKitchenPanel({
  initialOrders,
  locationId,
  etaOffset,
}: {
  initialOrders: KitchenOrder[];
  locationId: string | null;
  etaOffset: number;
}) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const [filter, setFilter] = useState("active");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showETAPanel, setShowETAPanel] = useState(false);
  const [currentETAOffset, setCurrentETAOffset] = useState(etaOffset);
  const prevPendingCountRef = useRef(
    initialOrders.filter((o) => o.status === "PENDING").length,
  );

  const { playNotification, requestNotificationPermission } =
    useOrderNotification();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const refreshOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updated = await getKitchenOrders(locationId ?? undefined);
      setOrders(updated);
    } catch {
      // Ignore
    }
    setIsRefreshing(false);
  }, [locationId]);

  // Auto-refresh every 10 seconds (Vercel-safe polling)
  useEffect(() => {
    const interval = setInterval(refreshOrders, 10000);
    return () => clearInterval(interval);
  }, [refreshOrders]);

  // Sound notification for new PENDING orders
  useEffect(() => {
    const newPendingCount = orders.filter((o) => o.status === "PENDING").length;
    if (newPendingCount > prevPendingCountRef.current && soundEnabled) {
      playNotification();
    }
    prevPendingCountRef.current = newPendingCount;
  }, [orders, soundEnabled, playNotification]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === "active") {
      return !["DELIVERED", "CANCELLED"].includes(order.status);
    }
    if (filter === "history") {
      return ["DELIVERED", "CANCELLED"].includes(order.status);
    }
    return order.status === filter;
  });

  // Sort: PENDING first (newest), then by creation time
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // PENDING always first
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (a.status !== "PENDING" && b.status === "PENDING") return 1;
    // Then by creation time (oldest first for kitchen queue)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Count by status
  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    counts[o.status] = (counts[o.status] || 0) + 1;
  });
  counts["active"] = orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status),
  ).length;
  counts["history"] = orders.filter((o) =>
    ["DELIVERED", "CANCELLED"].includes(o.status),
  ).length;

  // New pending orders IDs for pulse animation
  const pendingOrderIds = new Set(
    orders.filter((o) => o.status === "PENDING").map((o) => o.id),
  );

  const handleETAUpdate = async (offset: number) => {
    if (!locationId) return;
    const result = await updateLocationETAOffset(locationId, offset);
    if (result.success) {
      setCurrentETAOffset(offset);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Inline styles for pulse animation */}
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 140, 66, 0.4); }
          50% { box-shadow: 0 0 20px 4px rgba(255, 140, 66, 0.6); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-[#EEEEEE] bg-white">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1F1F1F]">
                🍳 Panel Kuchni
              </h1>
              <p className="text-[#8C8C8C]">
                Zamówienia LIVE — odświeżanie co 10s
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* New orders counter */}
              {(counts["PENDING"] ?? 0) > 0 && (
                <div className="flex animate-bounce items-center gap-2 rounded-full bg-[#FFF3E8] px-4 py-2 font-bold text-[#FF8C42]">
                  <Bell className="h-5 w-5" />
                  {counts["PENDING"]} nowe!
                </div>
              )}

              {/* Sound toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  soundEnabled
                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                    : "bg-red-50 text-red-500 hover:bg-red-100"
                }`}
                title={soundEnabled ? "Dźwięk włączony" : "Dźwięk wyłączony"}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </button>

              {/* ETA settings toggle */}
              <button
                onClick={() => setShowETAPanel(!showETAPanel)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  showETAPanel
                    ? "bg-[#FF4D4F] text-white"
                    : "bg-[#F5F5F5] text-[#8C8C8C] hover:bg-[#EEEEEE]"
                }`}
              >
                <Settings className="h-4 w-4" />
                ETA{" "}
                {currentETAOffset !== 0 && (
                  <span className="rounded-full bg-white/20 px-1.5 text-xs">
                    {currentETAOffset > 0 ? "+" : ""}
                    {currentETAOffset}m
                  </span>
                )}
              </button>

              {/* Refresh */}
              <button
                onClick={refreshOrders}
                disabled={isRefreshing}
                className="flex items-center gap-2 rounded-xl bg-[#F5F5F5] px-4 py-2 text-sm font-medium text-[#8C8C8C] transition-all hover:bg-[#EEEEEE]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Odśwież
              </button>
            </div>
          </div>

          {/* ETA Offset Panel (collapsible) */}
          {showETAPanel && locationId && (
            <div className="mt-4">
              <ETAOffsetPanel
                currentOffset={currentETAOffset}
                onUpdate={handleETAUpdate}
              />
            </div>
          )}

          {/* Filter tabs */}
          <div className="mt-4 flex gap-1 overflow-x-auto">
            {KITCHEN_FILTERS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  filter === tab.key
                    ? "bg-[#FF4D4F] text-white shadow-md"
                    : "bg-white text-[#8C8C8C] hover:bg-[#F5F5F5]"
                }`}
              >
                {tab.label}
                {(counts[tab.key] ?? 0) > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                      filter === tab.key
                        ? "bg-white/20 text-white"
                        : tab.key === "PENDING"
                          ? "bg-[#FFF3E8] text-[#FF8C42]"
                          : "bg-[#F5F5F5] text-[#8C8C8C]"
                    }`}
                  >
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-8 py-6">
        {sortedOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F5] text-3xl">
              {filter === "active" ? "👨‍🍳" : "📋"}
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#1F1F1F]">
              {filter === "active"
                ? "Brak aktywnych zamówień"
                : filter === "history"
                  ? "Brak zamówień w historii"
                  : "Brak zamówień o tym statusie"}
            </h3>
            <p className="mt-1 text-sm text-[#8C8C8C]">
              Nowe zamówienia pojawią się automatycznie — odświeżanie co 10
              sekund
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedOrders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                isNew={pendingOrderIds.has(order.id)}
                onStatusUpdate={refreshOrders}
              />
            ))}
          </div>
        )}

        {/* Quick stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
            <div
              key={key}
              className="rounded-xl border p-3 text-center transition-all hover:shadow-sm"
              style={{
                borderColor: conf.borderColor,
                backgroundColor: conf.bgColor,
              }}
            >
              <conf.icon
                className="mx-auto h-5 w-5"
                style={{ color: conf.color }}
              />
              <p
                className="mt-1 text-xl font-bold"
                style={{ color: conf.color }}
              >
                {counts[key] ?? 0}
              </p>
              <p className="text-xs text-[#8C8C8C]">{conf.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
