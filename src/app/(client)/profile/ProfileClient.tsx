"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  MapPin,
  Star,
  Clock,
  ShoppingBag,
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  Home,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  RefreshCw,
  Package,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateClientReview,
  deleteClientReview,
  type ClientReview,
} from "@/actions/client/reviews";
import { deleteAddress, setDefaultAddress } from "@/actions/client/addresses";
import { getReorderData } from "@/actions/orders";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

type UserData = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  memberSince: string;
};

type Address = {
  id: string;
  label: string | null;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
};

type OrderItem = {
  mealName: string;
  quantity: number;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  restaurantName: string | null;
  restaurantSlug: string | null;
  restaurantLogoUrl: string | null;
  locationName: string;
  createdAt: string;
  deliveredAt: string | null;
  estimatedDeliveryAt: string | null;
  itemCount: number;
  items: OrderItem[];
};

type QuickReorderOrder = {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantLogoUrl: string | null;
  totalPrice: number;
  deliveredAt: string | null;
  itemSummary: string;
  itemCount: number;
  firstItemImage: string | null;
};

// ============================================
// STATUS HELPERS
// ============================================

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Oczekuje",
  ACCEPTED: "Przyjęte",
  PREPARING: "W przygotowaniu",
  READY: "Gotowe",
  IN_DELIVERY: "W dostawie",
  DELIVERED: "Dostarczone",
  CANCELLED: "Anulowane",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-yellow-100", text: "text-yellow-700" },
  ACCEPTED: { bg: "bg-blue-100", text: "text-blue-700" },
  PREPARING: { bg: "bg-orange-100", text: "text-orange-700" },
  READY: { bg: "bg-purple-100", text: "text-purple-700" },
  IN_DELIVERY: { bg: "bg-indigo-100", text: "text-indigo-700" },
  DELIVERED: { bg: "bg-green-100", text: "text-green-700" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
};

// ============================================
// TABS
// ============================================

type TabKey = "overview" | "addresses" | "reviews" | "orders";

const TABS: {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "overview", label: "Przegląd", icon: User },
  { key: "addresses", label: "Adresy", icon: MapPin },
  { key: "reviews", label: "Opinie", icon: Star },
  { key: "orders", label: "Zamówienia", icon: ShoppingBag },
];

// ============================================
// EDIT REVIEW MODAL
// ============================================

function EditReviewModal({
  review,
  onClose,
  onSave,
}: {
  review: ClientReview;
  onClose: () => void;
  onSave: (rating: number, content: string) => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [content, setContent] = useState(review.content || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await onSave(rating, content);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-[#1F1F1F]">Edytuj opinię</h3>

        {/* Rating */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-[#1F1F1F]">
            Ocena
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-[#1F1F1F]">
            Komentarz
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-[#EEEEEE] p-3 text-sm focus:border-[#FF4D4F] focus:outline-none"
            rows={4}
            maxLength={1000}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-xl"
            disabled={isLoading}
          >
            Anuluj
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-[#FF4D4F] hover:bg-[#FF3B30]"
            disabled={isLoading}
          >
            {isLoading ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// QUICK REORDER CARD
// ============================================

function QuickReorderCard({
  order,
  formatPrice,
}: {
  order: QuickReorderOrder;
  formatPrice: (price: number) => string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleReorder = async () => {
    setIsLoading(true);
    try {
      const result = await getReorderData(order.id);
      if (result.success && result.data) {
        // Store reorder data in sessionStorage and redirect
        sessionStorage.setItem("reorderData", JSON.stringify(result.data));
        router.push(`/restauracja/${order.restaurantSlug}?reorder=true`);
      } else {
        toast.error(
          result.error || "Nie udało się przygotować ponownego zamówienia",
        );
      }
    } catch {
      toast.error("Wystąpił błąd podczas ponownego zamawiania");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-[#EEEEEE] bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
          {order.restaurantLogoUrl ? (
            <Image
              src={order.restaurantLogoUrl}
              alt={order.restaurantName}
              fill
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl">
              🍽️
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[#1F1F1F] truncate">
            {order.restaurantName}
          </h4>
          <p className="text-sm text-[#8C8C8C] line-clamp-1">
            {order.itemSummary}
          </p>
          <p className="mt-1 text-sm font-medium text-[#FF4D4F]">
            {formatPrice(order.totalPrice)}
          </p>
        </div>
      </div>
      <Button
        onClick={handleReorder}
        disabled={isLoading}
        className="mt-3 w-full rounded-xl bg-[#FF4D4F] hover:bg-[#FF3B30]"
        size="sm"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        Zamów ponownie
      </Button>
    </div>
  );
}

// ============================================
// ORDER STATUS BADGE
// ============================================

function OrderStatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {status === "DELIVERED" && <CheckCircle className="h-3 w-3" />}
      {status === "CANCELLED" && <XCircle className="h-3 w-3" />}
      {status === "IN_DELIVERY" && <Package className="h-3 w-3" />}
      {label}
    </span>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProfileClient({
  user,
  reviews: initialReviews,
  addresses: initialAddresses,
  orders,
  quickReorderOrders,
}: {
  user: UserData;
  reviews: ClientReview[];
  addresses: Address[];
  orders: Order[];
  quickReorderOrders: QuickReorderOrder[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [reviews, setReviews] = useState(initialReviews);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingReview, setEditingReview] = useState<ClientReview | null>(null);
  const [ordersFilter, setOrdersFilter] = useState<
    "all" | "active" | "completed"
  >("all");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (ordersFilter === "all") return true;
    if (ordersFilter === "active") {
      return !["DELIVERED", "CANCELLED"].includes(order.status);
    }
    return ["DELIVERED", "CANCELLED"].includes(order.status);
  });

  // Calculate stats
  const totalSpent = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  // Handle review update
  const handleUpdateReview = async (rating: number, content: string) => {
    if (!editingReview) return;

    const result = await updateClientReview(editingReview.id, rating, content);
    if (result.success) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingReview.id ? { ...r, rating, content } : r,
        ),
      );
      toast.success("Opinia została zaktualizowana");
      setEditingReview(null);
    } else {
      toast.error(result.error || "Nie udało się zaktualizować opinii");
    }
  };

  // Handle review delete
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę opinię?")) return;

    const result = await deleteClientReview(reviewId);
    if (result.success) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Opinia została usunięta");
    } else {
      toast.error(result.error || "Nie udało się usunąć opinii");
    }
  };

  // Handle address delete
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten adres?")) return;

    const result = await deleteAddress(addressId);
    if (result.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      toast.success("Adres został usunięty");
    } else {
      toast.error(result.error || "Nie udało się usunąć adresu");
    }
  };

  // Handle set default address
  const handleSetDefault = async (addressId: string) => {
    const result = await setDefaultAddress(addressId);
    if (result.success) {
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === addressId,
        })),
      );
      toast.success("Adres domyślny został zmieniony");
    } else {
      toast.error(result.error || "Nie udało się zmienić adresu domyślnego");
    }
  };

  const getLabelIcon = (label: string | null) => {
    const l = label?.toLowerCase();
    if (l?.includes("dom") || l?.includes("home")) return Home;
    if (l?.includes("praca") || l?.includes("work") || l?.includes("biuro"))
      return Briefcase;
    return MapPin;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSave={handleUpdateReview}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F1F1F]">Mój Profil</h1>
        <p className="text-[#8C8C8C]">Zarządzaj swoim kontem i preferencjami</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-[#FF4D4F] text-white"
                : "bg-white text-[#8C8C8C] hover:bg-[#F5F5F5]"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* User Info Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F1] text-2xl">
                  👤
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[#1F1F1F]">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : "Użytkownik"}
                  </h2>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-[#8C8C8C]">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-[#8C8C8C]">
                        <Phone className="h-4 w-4" />
                        {user.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-[#8C8C8C]">
                      <Calendar className="h-4 w-4" />
                      Członek od {formatDate(user.memberSince)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1F1]">
                    <ShoppingBag className="h-5 w-5 text-[#FF4D4F]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F1F1F]">
                      {deliveredCount}
                    </p>
                    <p className="text-xs text-[#8C8C8C]">Zamówień</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F1F1F]">
                      {formatPrice(totalSpent)}
                    </p>
                    <p className="text-xs text-[#8C8C8C]">Wydano</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F1F1F]">
                      {reviews.length}
                    </p>
                    <p className="text-xs text-[#8C8C8C]">Opinii</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F1F1F]">
                      {addresses.length}
                    </p>
                    <p className="text-xs text-[#8C8C8C]">Adresów</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Reorder Section */}
            {quickReorderOrders.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#1F1F1F]">Zamów ponownie</h3>
                    <p className="text-sm text-[#8C8C8C]">
                      Twoje ostatnie restauracje
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {quickReorderOrders.slice(0, 3).map((order) => (
                    <QuickReorderCard
                      key={order.id}
                      order={order}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Active Orders */}
            {orders.some(
              (o) => !["DELIVERED", "CANCELLED"].includes(o.status),
            ) && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-[#1F1F1F]">
                    Aktywne zamówienia
                  </h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-sm font-medium text-[#FF4D4F] hover:underline"
                  >
                    Zobacz wszystkie
                  </button>
                </div>
                <div className="space-y-3">
                  {orders
                    .filter(
                      (o) => !["DELIVERED", "CANCELLED"].includes(o.status),
                    )
                    .slice(0, 3)
                    .map((order) => (
                      <Link
                        key={order.id}
                        href={`/order/${order.id}`}
                        className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#F5F5F5]"
                      >
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#F5F5F5]">
                          {order.restaurantLogoUrl ? (
                            <Image
                              src={order.restaurantLogoUrl}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg">
                              🍽️
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[#1F1F1F] truncate">
                              {order.restaurantName || "Restauracja"}
                            </p>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <p className="text-sm text-[#8C8C8C]">
                            {order.itemCount} pozycji • #{order.orderNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#FF4D4F]">
                            {formatPrice(order.totalPrice)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#CCCCCC]" />
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* Recent Completed Orders */}
            {orders.some((o) => o.status === "DELIVERED") && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-[#1F1F1F]">
                    Ostatnie zamówienia
                  </h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-sm font-medium text-[#FF4D4F] hover:underline"
                  >
                    Zobacz wszystkie
                  </button>
                </div>
                <div className="space-y-3">
                  {orders
                    .filter((o) => o.status === "DELIVERED")
                    .slice(0, 3)
                    .map((order) => (
                      <Link
                        key={order.id}
                        href={`/order/${order.id}`}
                        className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#F5F5F5]"
                      >
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#F5F5F5]">
                          {order.restaurantLogoUrl ? (
                            <Image
                              src={order.restaurantLogoUrl}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg">
                              🍽️
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1F1F1F] truncate">
                            {order.restaurantName || "Restauracja"}
                          </p>
                          <p className="text-sm text-[#8C8C8C]">
                            {order.items
                              .map((i) => `${i.quantity}× ${i.mealName}`)
                              .join(", ")
                              .slice(0, 50)}
                            ...
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#FF4D4F]">
                            {formatPrice(order.totalPrice)}
                          </p>
                          <p className="text-xs text-[#8C8C8C]">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#CCCCCC]" />
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-[#1F1F1F]">Zapisane adresy</h3>
              <Link href="/delivery-settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-[#FF4D4F] text-[#FF4D4F] hover:bg-[#FF4D4F]/5"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Dodaj adres
                </Button>
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="py-8 text-center">
                <MapPin className="mx-auto mb-2 h-12 w-12 text-[#CCCCCC]" />
                <p className="text-[#8C8C8C]">
                  Nie masz jeszcze zapisanych adresów
                </p>
                <Link href="/delivery-settings">
                  <Button className="mt-4 rounded-xl bg-[#FF4D4F] hover:bg-[#FF3B30]">
                    Dodaj pierwszy adres
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => {
                  const Icon = getLabelIcon(address.label);
                  return (
                    <div
                      key={address.id}
                      className={`flex items-center gap-4 rounded-xl border p-4 ${
                        address.isDefault
                          ? "border-[#FF4D4F] bg-[#FFF1F1]/30"
                          : "border-[#EEEEEE]"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          address.isDefault ? "bg-[#FF4D4F]" : "bg-[#F5F5F5]"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            address.isDefault ? "text-white" : "text-[#8C8C8C]"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[#1F1F1F]">
                            {address.label || "Adres"}
                          </p>
                          {address.isDefault && (
                            <span className="rounded-full bg-[#FF4D4F] px-2 py-0.5 text-xs font-medium text-white">
                              Domyślny
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#8C8C8C]">
                          {address.street}, {address.postalCode} {address.city}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#8C8C8C] hover:bg-[#F5F5F5]"
                          >
                            Ustaw domyślny
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="rounded-lg p-1.5 text-[#8C8C8C] hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-[#1F1F1F]">Moje opinie</h3>

            {reviews.length === 0 ? (
              <div className="py-8 text-center">
                <Star className="mx-auto mb-2 h-12 w-12 text-[#CCCCCC]" />
                <p className="text-[#8C8C8C]">
                  Nie masz jeszcze żadnych opinii
                </p>
                <p className="mt-1 text-sm text-[#CCCCCC]">
                  Po dostarczeniu zamówienia będziesz mógł ocenić restaurację
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-[#EEEEEE] p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-[#F5F5F5]">
                          {review.restaurant.logoUrl ? (
                            <Image
                              src={review.restaurant.logoUrl}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg">
                              🍽️
                            </span>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/restauracja/${review.restaurant.slug}`}
                            className="font-medium text-[#1F1F1F] hover:underline"
                          >
                            {review.restaurant.name}
                          </Link>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-[#8C8C8C]">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingReview(review)}
                          className="rounded-lg p-1.5 text-[#8C8C8C] hover:bg-[#F5F5F5] hover:text-[#FF4D4F]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="rounded-lg p-1.5 text-[#8C8C8C] hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {review.content && (
                      <p className="mt-3 text-sm text-[#8C8C8C]">
                        &ldquo;{review.content}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setOrdersFilter("all")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  ordersFilter === "all"
                    ? "bg-[#FF4D4F] text-white"
                    : "bg-white text-[#8C8C8C] hover:bg-[#F5F5F5]"
                }`}
              >
                Wszystkie ({orders.length})
              </button>
              <button
                onClick={() => setOrdersFilter("active")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  ordersFilter === "active"
                    ? "bg-[#FF4D4F] text-white"
                    : "bg-white text-[#8C8C8C] hover:bg-[#F5F5F5]"
                }`}
              >
                Aktywne (
                {
                  orders.filter(
                    (o) => !["DELIVERED", "CANCELLED"].includes(o.status),
                  ).length
                }
                )
              </button>
              <button
                onClick={() => setOrdersFilter("completed")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  ordersFilter === "completed"
                    ? "bg-[#FF4D4F] text-white"
                    : "bg-white text-[#8C8C8C] hover:bg-[#F5F5F5]"
                }`}
              >
                Zakończone (
                {
                  orders.filter((o) =>
                    ["DELIVERED", "CANCELLED"].includes(o.status),
                  ).length
                }
                )
              </button>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-[#1F1F1F]">
                Historia zamówień
              </h3>

              {filteredOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingBag className="mx-auto mb-2 h-12 w-12 text-[#CCCCCC]" />
                  <p className="text-[#8C8C8C]">Brak zamówień</p>
                  <Link href="/">
                    <Button className="mt-4 rounded-xl bg-[#FF4D4F] hover:bg-[#FF3B30]">
                      Przeglądaj restauracje
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/order/${order.id}`}
                      className="flex items-center gap-3 rounded-xl border border-[#EEEEEE] p-4 transition-colors hover:border-[#FF4D4F]/30 hover:bg-[#FFF1F1]/10"
                    >
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-[#F5F5F5]">
                        {order.restaurantLogoUrl ? (
                          <Image
                            src={order.restaurantLogoUrl}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xl">
                            🍽️
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-[#1F1F1F] truncate">
                            {order.restaurantName || "Restauracja"}
                          </p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-[#8C8C8C]">
                          {order.itemCount} pozycji • #{order.orderNumber}
                        </p>
                        <p className="text-xs text-[#CCCCCC]">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#FF4D4F]">
                          {formatPrice(order.totalPrice)}
                        </p>
                        {order.status === "DELIVERED" && order.deliveredAt && (
                          <p className="text-xs text-green-600">
                            Dostarczono {formatDate(order.deliveredAt)}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#CCCCCC]" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
