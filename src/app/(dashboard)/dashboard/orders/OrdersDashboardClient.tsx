"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatus, getLocationOrders } from "@/actions/orders";

// ============================================
// TYPES
// ============================================

type OrderItem = {
  id: string;
  mealName: string;
  variantName: string | null;
  quantity: number;
  totalPrice: number;
  note: string | null;
  addons: { name: string; quantity: number }[];
};

type OrderData = {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  estimatedTime: number | null;
  estimatedDeliveryAt: string | null;
  deliveryAddress: string | null;
  guestName: string | null;
  guestPhone: string | null;
  notes: string | null;
  createdAt: string;
  acceptedAt: string | null;
  preparingAt: string | null;
  readyAt: string | null;
  inDeliveryAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  locationName: string;
  locationCity: string;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  items: OrderItem[];
};

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
    borderColor: string;
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
    nextStatus: "ACCEPTED",
    nextLabel: "Przyjmij zamówienie",
  },
  ACCEPTED: {
    label: "Przyjęte",
    icon: CheckCircle2,
    color: "#4CAF50",
    bgColor: "#E8F5E9",
    borderColor: "#A5D6A7",
    nextStatus: "PREPARING",
    nextLabel: "Zacznij przygotowywać",
  },
  PREPARING: {
    label: "W przygotowaniu",
    icon: ChefHat,
    color: "#FF4D4F",
    bgColor: "#FFF1F1",
    borderColor: "#FFAAAB",
    nextStatus: "READY",
    nextLabel: "Oznacz jako gotowe",
  },
  READY: {
    label: "Gotowe",
    icon: Package,
    color: "#2196F3",
    bgColor: "#E3F2FD",
    borderColor: "#90CAF9",
    nextStatus: "IN_DELIVERY",
    nextLabel: "Wyślij kuriera",
  },
  IN_DELIVERY: {
    label: "W dostawie",
    icon: Truck,
    color: "#9C27B0",
    bgColor: "#F3E5F5",
    borderColor: "#CE93D8",
    nextStatus: "DELIVERED",
    nextLabel: "Potwierdź dostarczenie",
  },
  DELIVERED: {
    label: "Dostarczone",
    icon: UtensilsCrossed,
    color: "#4CAF50",
    bgColor: "#E8F5E9",
    borderColor: "#A5D6A7",
    nextStatus: null,
    nextLabel: null,
  },
  CANCELLED: {
    label: "Anulowane",
    icon: XCircle,
    color: "#F44336",
    bgColor: "#FFEBEE",
    borderColor: "#EF9A9A",
    nextStatus: null,
    nextLabel: null,
  },
};

const FILTER_TABS = [
  { key: "active", label: "Aktywne", count: 0 },
  { key: "all", label: "Wszystkie", count: 0 },
  { key: "PENDING", label: "Nowe", count: 0 },
  { key: "PREPARING", label: "W przygotowaniu", count: 0 },
  { key: "READY", label: "Gotowe", count: 0 },
  { key: "DELIVERED", label: "Dostarczone", count: 0 },
  { key: "CANCELLED", label: "Anulowane", count: 0 },
];

// ============================================
// ORDER CARD
// ============================================

function OrderCard({
  order,
  onStatusUpdate,
}: {
  order: OrderData;
  onStatusUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
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

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus as any);
      if (result.success) {
        onStatusUpdate();
      }
    });
  };

  const orderId = order.id;

  // Time since order was placed
  const minutesSincePlaced = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / 60000,
  );

  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-md"
      style={{ borderColor: config.borderColor }}
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
          <span className="font-mono text-xs text-[#8C8C8C]">
            {order.orderNumber}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-[#8C8C8C]">
            <Clock className="h-3 w-3" />
            {minutesSincePlaced} min temu
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
          {order.customer.phone && (
            <a
              href={`tel:${order.customer.phone}`}
              className="flex items-center gap-1 rounded-full bg-[#F5F5F5] px-2 py-1 text-xs text-[#8C8C8C] hover:bg-[#EEEEEE]"
            >
              <Phone className="h-3 w-3" />
              {order.customer.phone}
            </a>
          )}
        </div>

        {/* Items summary */}
        <div className="mb-3 space-y-1.5">
          {order.items.slice(0, expanded ? undefined : 3).map((item) => (
            <div key={item.id} className="flex items-start justify-between">
              <div className="flex-1">
                <span className="text-sm text-[#1F1F1F]">
                  <span className="font-semibold">{item.quantity}×</span>{" "}
                  {item.mealName}
                </span>
                {item.variantName && (
                  <span className="ml-1 text-xs text-[#8C8C8C]">
                    ({item.variantName})
                  </span>
                )}
                {item.addons.length > 0 && (
                  <p className="text-xs text-[#AAAAAA]">
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
                  <p className="mt-0.5 flex items-center gap-1 text-xs italic text-amber-600">
                    <MessageSquare className="h-3 w-3" />
                    {item.note}
                  </p>
                )}
              </div>
              <span className="ml-2 text-xs font-medium text-[#8C8C8C]">
                {formatPrice(item.totalPrice)}
              </span>
            </div>
          ))}
          {!expanded && order.items.length > 3 && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs font-medium text-[#FF4D4F] hover:underline"
            >
              + {order.items.length - 3} więcej pozycji
            </button>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <span className="font-semibold">Uwagi:</span> {order.notes}
          </div>
        )}

        {/* Delivery info */}
        {order.deliveryAddress && (
          <div className="mb-3 flex items-start gap-1.5 text-xs text-[#8C8C8C]">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{order.deliveryAddress}</span>
          </div>
        )}

        {/* Price + expand */}
        <div className="flex items-center justify-between border-t border-[#F5F5F5] pt-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-[#1F1F1F]">
              {formatPrice(order.totalPrice)}
            </span>
            {order.estimatedTime && (
              <span className="flex items-center gap-1 text-xs text-[#8C8C8C]">
                <Timer className="h-3 w-3" />~{order.estimatedTime} min
              </span>
            )}
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

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 space-y-2 border-t border-[#F5F5F5] pt-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#8C8C8C]">Złożono:</span>{" "}
                <span className="text-[#1F1F1F]">
                  {formatDate(order.createdAt)}
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
              {order.inDeliveryAt && (
                <div>
                  <span className="text-[#8C8C8C]">Wysłano:</span>{" "}
                  <span className="text-[#1F1F1F]">
                    {formatTime(order.inDeliveryAt)}
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
              <div>
                <span className="text-[#8C8C8C]">Lokalizacja:</span>{" "}
                <span className="text-[#1F1F1F]">
                  {order.locationName}, {order.locationCity}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {config.nextStatus && (
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => handleStatusChange(config.nextStatus!)}
              disabled={isPending}
              className="flex-1 gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: config.color }}
            >
              {isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : null}
              {config.nextLabel}
            </Button>
            {order.status !== "IN_DELIVERY" && (
              <Button
                onClick={() => handleStatusChange("CANCELLED")}
                disabled={isPending}
                variant="outline"
                className="rounded-xl border-red-200 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
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
// MAIN DASHBOARD COMPONENT
// ============================================

export default function OrdersDashboardClient({
  initialOrders,
}: {
  initialOrders: OrderData[];
}) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [filter, setFilter] = useState("active");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updated = await getLocationOrders();
      setOrders(updated);
    } catch (e) {
      // Ignore
    }
    setIsRefreshing(false);
  }, []);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(refreshOrders, 15000);
    return () => clearInterval(interval);
  }, [refreshOrders]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === "active") {
      return !["DELIVERED", "CANCELLED"].includes(order.status);
    }
    if (filter === "all") return true;
    return order.status === filter;
  });

  // Count by status
  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    counts[o.status] = (counts[o.status] || 0) + 1;
  });
  counts["active"] = orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status),
  ).length;
  counts["all"] = orders.length;

  // Sound notification for new orders
  const [lastNewCount, setLastNewCount] = useState(
    orders.filter((o) => o.status === "PENDING").length,
  );

  useEffect(() => {
    const newCount = orders.filter((o) => o.status === "PENDING").length;
    if (newCount > lastNewCount) {
      // Play notification sound (if browser supports it)
      try {
        const audio = new Audio(
          "data:audio/wav;base64,UklGRl9vT19telefonWQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==",
        );
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {
        // Silent fail
      }
    }
    setLastNewCount(newCount);
  }, [orders, lastNewCount]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b border-[#EEEEEE] bg-white">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1F1F1F]">Zamówienia</h1>
              <p className="text-[#8C8C8C]">
                Zarządzaj zamówieniami w czasie rzeczywistym
              </p>
            </div>
            <div className="flex items-center gap-3">
              {counts["PENDING"] > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-[#FFF3E8] px-4 py-2 font-semibold text-[#FF8C42]">
                  <AlertCircle className="h-4 w-4" />
                  {counts["PENDING"]} nowe zamówienia
                </div>
              )}
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

          {/* Filter tabs */}
          <div className="mt-4 flex gap-1 overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  filter === tab.key
                    ? "bg-[#FF4D4F] text-white"
                    : "bg-white text-[#8C8C8C] hover:bg-[#F5F5F5]"
                }`}
              >
                {tab.label}
                {(counts[tab.key] ?? 0) > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs ${
                      filter === tab.key
                        ? "bg-white/20 text-white"
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
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F5] text-3xl">
              📋
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#1F1F1F]">
              Brak zamówień
            </h3>
            <p className="mt-1 text-sm text-[#8C8C8C]">
              {filter === "active"
                ? "Brak aktywnych zamówień. Nowe zamówienia pojawią się automatycznie."
                : "Brak zamówień o podanym statusie."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={refreshOrders}
              />
            ))}
          </div>
        )}

        {/* Quick stats footer */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
            <div
              key={key}
              className="rounded-xl border p-3 text-center"
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
