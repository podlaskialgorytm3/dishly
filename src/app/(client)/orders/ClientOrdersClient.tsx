"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  Truck,
  Package,
  XCircle,
  UtensilsCrossed,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

type ClientOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  estimatedDeliveryAt: string | null;
  restaurantName: string | null;
  restaurantSlug: string | null;
  restaurantLogoUrl: string | null;
  locationName: string;
  createdAt: string;
  deliveredAt: string | null;
  itemCount: number;
  items: { mealName: string; quantity: number }[];
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
  }
> = {
  PENDING: {
    label: "Oczekujące",
    icon: ShoppingBag,
    color: "#FF8C42",
    bgColor: "#FFF3E8",
  },
  ACCEPTED: {
    label: "Przyjęte",
    icon: CheckCircle2,
    color: "#4CAF50",
    bgColor: "#E8F5E9",
  },
  PREPARING: {
    label: "W przygotowaniu",
    icon: ChefHat,
    color: "#FF4D4F",
    bgColor: "#FFF1F1",
  },
  READY: {
    label: "Gotowe",
    icon: Package,
    color: "#2196F3",
    bgColor: "#E3F2FD",
  },
  IN_DELIVERY: {
    label: "W dostawie",
    icon: Truck,
    color: "#9C27B0",
    bgColor: "#F3E5F5",
  },
  DELIVERED: {
    label: "Dostarczone",
    icon: UtensilsCrossed,
    color: "#4CAF50",
    bgColor: "#E8F5E9",
  },
  CANCELLED: {
    label: "Anulowane",
    icon: XCircle,
    color: "#F44336",
    bgColor: "#FFEBEE",
  },
};

export default function ClientOrdersClient({
  orders,
}: {
  orders: ClientOrder[];
}) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);

  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status),
  );
  const pastOrders = orders.filter((o) =>
    ["DELIVERED", "CANCELLED"].includes(o.status),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[#1F1F1F]">
        Moje Zamówienia
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 text-6xl">📦</div>
          <h2 className="mb-2 text-xl font-bold text-[#1F1F1F]">
            Brak zamówień
          </h2>
          <p className="mb-4 text-[#8C8C8C]">
            Nie masz jeszcze żadnych zamówień.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF4D4F] px-6 py-2.5 font-semibold text-white hover:bg-[#FF3B30]"
          >
            Przeglądaj restauracje
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active orders */}
          {activeOrders.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-bold text-[#1F1F1F]">
                Aktywne zamówienia
              </h2>
              <div className="space-y-3">
                {activeOrders.map((order) => {
                  const conf =
                    STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                  return (
                    <Link
                      key={order.id}
                      href={`/order/${order.id}`}
                      className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: conf.bgColor }}
                      >
                        <conf.icon
                          className="h-6 w-6"
                          style={{ color: conf.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#1F1F1F]">
                            {order.restaurantName ?? "Restauracja"}
                          </p>
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: conf.bgColor,
                              color: conf.color,
                            }}
                          >
                            {conf.label}
                          </span>
                        </div>
                        <p className="text-sm text-[#8C8C8C]">
                          {order.items
                            .map((i) => `${i.quantity}× ${i.mealName}`)
                            .join(", ")}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-[#CCCCCC]">
                          {order.orderNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#FF4D4F]">
                          {formatPrice(order.totalPrice)}
                        </p>
                        <p className="text-xs text-[#8C8C8C]">
                          Śledź zamówienie
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-[#CCCCCC] group-hover:text-[#FF4D4F]" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past orders */}
          {pastOrders.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-bold text-[#1F1F1F]">
                Historia zamówień
              </h2>
              <div className="space-y-3">
                {pastOrders.map((order) => {
                  const conf =
                    STATUS_CONFIG[order.status] ?? STATUS_CONFIG.DELIVERED;
                  return (
                    <Link
                      key={order.id}
                      href={`/order/${order.id}`}
                      className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: conf.bgColor }}
                      >
                        <conf.icon
                          className="h-6 w-6"
                          style={{ color: conf.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#1F1F1F]">
                          {order.restaurantName ?? "Restauracja"}
                        </p>
                        <p className="text-sm text-[#8C8C8C]">
                          {order.itemCount} pozycji &middot;{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "pl-PL",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1F1F1F]">
                          {formatPrice(order.totalPrice)}
                        </p>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: conf.bgColor,
                            color: conf.color,
                          }}
                        >
                          {conf.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
