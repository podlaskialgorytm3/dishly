"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ChevronRight,
  AlertCircle,
  MapPin,
  Loader2,
  Navigation,
  ChevronDown,
  Star,
  CreditCard,
  Package,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cart-store";
import { verifyCartAvailability } from "@/actions/orders";
import { getClientAddresses, reverseGeocode } from "@/actions/client/addresses";

type CheckoutMapProps = {
  latitude: number;
  longitude: number;
  address?: string;
};

const CheckoutMap = dynamic<CheckoutMapProps>(
  () => import("@/components/storefront/CheckoutMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[180px] items-center justify-center rounded-xl bg-gray-100">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    ),
  },
);

type SavedAddress = {
  id: string;
  label: string | null;
  street: string;
  city: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
};

export function CartDrawer() {
  const router = useRouter();
  const [discountInput, setDiscountInput] = useState("");
  const [showDiscount, setShowDiscount] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");

  // Geolocation & saved addresses state
  const [customerLat, setCustomerLat] = useState<number | undefined>();
  const [customerLng, setCustomerLng] = useState<number | undefined>();
  const [geoLoading, setGeoLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [geoAsked, setGeoAsked] = useState(false);

  const items = useCartStore((s) => s.items);
  const restaurant = useCartStore((s) => s.restaurant);
  const location = useCartStore((s) => s.location);
  const itemCount = useCartStore((s) => s.itemCount);
  const subtotal = useCartStore((s) => s.subtotal);
  const deliveryFee = useCartStore((s) => s.deliveryFee);
  const total = useCartStore((s) => s.total);
  const meetsMinOrder = useCartStore((s) => s.meetsMinOrder);
  const discountCode = useCartStore((s) => s.discountCode);
  const discountPercent = useCartStore((s) => s.discountPercent);
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const applyDiscountCode = useCartStore((s) => s.applyDiscountCode);
  const removeDiscountCode = useCartStore((s) => s.removeDiscountCode);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved addresses when checkout opens
  const loadSavedAddresses = useCallback(async () => {
    if (addressesLoaded) return;
    try {
      const addrs = await getClientAddresses();
      setSavedAddresses(addrs as SavedAddress[]);
      setAddressesLoaded(true);

      // Auto-fill from default address if no address filled yet
      if (!deliveryAddress.trim()) {
        const defaultAddr = addrs.find((a) => a.isDefault);
        if (defaultAddr) {
          setDeliveryAddress(
            `${defaultAddr.street}, ${defaultAddr.postalCode} ${defaultAddr.city}`,
          );
          if (defaultAddr.latitude && defaultAddr.longitude) {
            setCustomerLat(defaultAddr.latitude);
            setCustomerLng(defaultAddr.longitude);
          }
        }
      }
    } catch {
      // Ignore - user might not be logged in
    }
  }, [addressesLoaded, deliveryAddress]);

  // Ask for geolocation when checkout opens
  const askGeolocation = useCallback(() => {
    if (geoAsked || customerLat) return;
    setGeoAsked(true);

    if (!navigator.geolocation) return;

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCustomerLat(latitude);
        setCustomerLng(longitude);

        // If no address filled yet, reverse geocode
        if (!deliveryAddress.trim()) {
          try {
            const result = await reverseGeocode(latitude, longitude);
            if (result) {
              const addr = `${result.street}, ${result.postalCode} ${result.city}`;
              setDeliveryAddress(addr);
            }
          } catch {}
        }

        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [geoAsked, customerLat, deliveryAddress]);

  // When showCheckout changes to true, load addresses + ask geolocation
  useEffect(() => {
    if (showCheckout) {
      loadSavedAddresses();
      askGeolocation();
    }
  }, [showCheckout, loadSavedAddresses, askGeolocation]);

  const selectSavedAddress = (addr: SavedAddress) => {
    setDeliveryAddress(`${addr.street}, ${addr.postalCode} ${addr.city}`);
    if (addr.latitude && addr.longitude) {
      setCustomerLat(addr.latitude);
      setCustomerLng(addr.longitude);
    }
    setShowAddressPicker(false);
  };

  const handleManualGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCustomerLat(latitude);
        setCustomerLng(longitude);

        try {
          const result = await reverseGeocode(latitude, longitude);
          if (result) {
            setDeliveryAddress(
              `${result.street}, ${result.postalCode} ${result.city}`,
            );
          }
        } catch {}

        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const handleApplyDiscount = () => {
    // Mock discount code validation
    const code = discountInput.trim().toUpperCase();
    if (code === "DISHLY10") {
      applyDiscountCode(code, 10);
      setDiscountInput("");
      setShowDiscount(false);
    } else if (code === "DISHLY20") {
      applyDiscountCode(code, 20);
      setDiscountInput("");
      setShowDiscount(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating cart button */}
      {itemCount > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={openDrawer}
          className="fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-[#FF4D4F] px-5 text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold">{formatPrice(total)}</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#FF4D4F]">
            {itemCount}
          </span>
        </motion.button>
      )}

      {/* Drawer overlay & panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={closeDrawer}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#EEEEEE] px-5 py-4">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-[#FF4D4F]" />
                  <div>
                    <h2 className="text-lg font-bold text-[#1F1F1F]">
                      Twój koszyk
                    </h2>
                    {restaurant && (
                      <p className="text-xs text-[#8C8C8C]">
                        {restaurant.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-[#8C8C8C] hover:text-[#FF4D4F] transition-colors"
                    >
                      Wyczyść
                    </button>
                  )}
                  <button
                    onClick={closeDrawer}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F5F5]"
                  >
                    <X className="h-5 w-5 text-[#1F1F1F]" />
                  </button>
                </div>
              </div>

              {/* Scrollable content area (items + footer combined) */}
              <div className="flex-1 overflow-y-auto">
                {/* Items */}
                <div className="px-5 py-4">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 text-5xl">🛒</div>
                      <h3 className="mb-1 text-lg font-semibold text-[#1F1F1F]">
                        Koszyk jest pusty
                      </h3>
                      <p className="text-sm text-[#8C8C8C]">
                        Dodaj produkty, aby złożyć zamówienie
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => {
                        const addonTotal = item.addons.reduce(
                          (sum, a) => sum + a.price * a.quantity,
                          0,
                        );
                        const itemTotal =
                          (item.basePrice +
                            item.variantPriceModifier +
                            addonTotal) *
                          item.quantity;

                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="rounded-xl border border-[#EEEEEE] p-3"
                          >
                            <div className="flex gap-3">
                              {/* Image */}
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#F5F5F5]">
                                {item.mealImageUrl ? (
                                  <img
                                    src={item.mealImageUrl}
                                    alt={item.mealName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-2xl">
                                    🍽️
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="text-sm font-semibold text-[#1F1F1F] truncate">
                                      {item.mealName}
                                    </h4>
                                    {item.variantName && (
                                      <p className="text-xs text-[#8C8C8C]">
                                        {item.variantName}
                                      </p>
                                    )}
                                    {item.addons.length > 0 && (
                                      <p className="text-xs text-[#8C8C8C]">
                                        +{" "}
                                        {item.addons
                                          .map(
                                            (a) =>
                                              `${a.name}${a.quantity > 1 ? ` x${a.quantity}` : ""}`,
                                          )
                                          .join(", ")}
                                      </p>
                                    )}
                                    {item.note && (
                                      <p className="text-xs italic text-[#8C8C8C]">
                                        &ldquo;{item.note}&rdquo;
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="ml-2 flex-shrink-0 text-[#CCCCCC] hover:text-[#FF4D4F]"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.id,
                                          item.quantity - 1,
                                        )
                                      }
                                      className="flex h-6 w-6 items-center justify-center rounded-md border border-[#EEEEEE] text-[#8C8C8C] hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="min-w-[20px] text-center text-sm font-semibold text-[#1F1F1F]">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.id,
                                          item.quantity + 1,
                                        )
                                      }
                                      className="flex h-6 w-6 items-center justify-center rounded-md border border-[#EEEEEE] text-[#8C8C8C] hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <span className="text-sm font-bold text-[#1F1F1F]">
                                    {formatPrice(itemTotal)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}{" "}
                    </div>
                  )}
                </div>

                {/* Footer / Summary */}
                {items.length > 0 && (
                  <div className="border-t border-[#EEEEEE] px-5 py-4 space-y-3">
                    {/* Discount code */}
                    {!discountCode ? (
                      <div>
                        {!showDiscount ? (
                          <button
                            onClick={() => setShowDiscount(true)}
                            className="flex items-center gap-2 text-sm text-[#FF4D4F] hover:underline"
                          >
                            <Tag className="h-4 w-4" />
                            Masz kod rabatowy?
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Wpisz kod..."
                              value={discountInput}
                              onChange={(e) => setDiscountInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleApplyDiscount();
                              }}
                              className="rounded-xl border-[#EEEEEE] text-sm"
                            />
                            <Button
                              onClick={handleApplyDiscount}
                              variant="outline"
                              className="rounded-xl border-[#FF4D4F] text-[#FF4D4F] hover:bg-[#FFF1F1]"
                            >
                              Zastosuj
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl bg-green-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            {discountCode} (-{discountPercent}%)
                          </span>
                        </div>
                        <button
                          onClick={removeDiscountCode}
                          className="text-green-600 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Price breakdown */}
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-[#8C8C8C]">
                        <span>Suma produktów</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      {discountCode && (
                        <div className="flex justify-between text-green-600">
                          <span>Rabat ({discountPercent}%)</span>
                          <span>
                            -{formatPrice(subtotal * (discountPercent / 100))}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#8C8C8C]">
                        <span>Dostawa</span>
                        <span>
                          {deliveryFee === 0
                            ? "Darmowa"
                            : formatPrice(deliveryFee)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-[#EEEEEE] pt-1.5 text-base font-bold text-[#1F1F1F]">
                        <span>Razem</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>

                    {/* Location info */}
                    {location && (
                      <div className="flex items-center gap-2 text-xs text-[#8C8C8C]">
                        <MapPin className="h-3 w-3" />
                        <span>
                          Dostawa z: {location.name}, {location.city}
                        </span>
                      </div>
                    )}

                    {/* Min order warning */}
                    {!meetsMinOrder && location && (
                      <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>
                          Minimalna kwota zamówienia:{" "}
                          {formatPrice(location.minOrderValue)}. Brakuje{" "}
                          {formatPrice(location.minOrderValue - subtotal)}.
                        </span>
                      </div>
                    )}

                    {/* Order button */}
                    {!showCheckout ? (
                      <Button
                        disabled={!meetsMinOrder}
                        onClick={() => setShowCheckout(true)}
                        className="w-full gap-2 rounded-xl bg-[#FF4D4F] py-5 text-base font-semibold text-white transition-all hover:bg-[#FF3B30] disabled:opacity-50"
                      >
                        Zamów
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="space-y-3 rounded-xl border border-[#EEEEEE] p-3">
                        <p className="text-sm font-semibold text-[#1F1F1F]">
                          Finalizacja zamówienia
                        </p>

                        {/* Delivery / Pickup toggle */}
                        <div className="flex rounded-lg border border-[#EEEEEE] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setOrderType("DELIVERY")}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                              orderType === "DELIVERY"
                                ? "bg-[#FF4D4F] text-white"
                                : "bg-white text-[#8C8C8C] hover:bg-[#F5F5F5]"
                            }`}
                          >
                            <Truck className="h-3.5 w-3.5" />
                            Dostawa
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderType("PICKUP")}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                              orderType === "PICKUP"
                                ? "bg-[#FF4D4F] text-white"
                                : "bg-white text-[#8C8C8C] hover:bg-[#F5F5F5]"
                            }`}
                          >
                            <Package className="h-3.5 w-3.5" />
                            Odbiór osobisty
                          </button>
                        </div>

                        <p className="text-xs font-medium text-[#8C8C8C]">
                          Dane kontaktowe
                        </p>
                        <Input
                          placeholder="Imię i nazwisko"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="rounded-lg text-sm"
                        />
                        <Input
                          placeholder="Numer telefonu"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="rounded-lg text-sm"
                        />
                        <Input
                          placeholder="E-mail (opcjonalnie, dla potwierdzenia)"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="rounded-lg text-sm"
                          type="email"
                        />

                        {/* Address section — only for DELIVERY */}
                        {orderType === "DELIVERY" && (
                          <>
                            <p className="text-xs font-medium text-[#8C8C8C]">
                              Adres dostawy
                            </p>
                            {/* Delivery address with geolocation + saved addresses */}
                            <div className="space-y-2">
                              <div className="relative">
                                <Input
                                  placeholder="Adres dostawy"
                                  value={deliveryAddress}
                                  onChange={(e) => {
                                    setDeliveryAddress(e.target.value);
                                    setCustomerLat(undefined);
                                    setCustomerLng(undefined);
                                  }}
                                  className="rounded-lg pr-10 text-sm"
                                />
                                {savedAddresses.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowAddressPicker(!showAddressPicker)
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8C8C8C] hover:text-[#FF4D4F]"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              {/* Saved addresses dropdown */}
                              <AnimatePresence>
                                {showAddressPicker &&
                                  savedAddresses.length > 0 && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden rounded-lg border border-[#EEEEEE]"
                                    >
                                      <div className="max-h-36 overflow-y-auto">
                                        {savedAddresses.map((addr) => (
                                          <button
                                            key={addr.id}
                                            type="button"
                                            onClick={() =>
                                              selectSavedAddress(addr)
                                            }
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-[#FFF1F1] transition-colors"
                                          >
                                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#FF4D4F]" />
                                            <div className="flex-1 min-w-0">
                                              <span className="font-medium text-[#1F1F1F] truncate block">
                                                {addr.label && (
                                                  <span className="text-[#8C8C8C]">
                                                    {addr.label} –{" "}
                                                  </span>
                                                )}
                                                {addr.street}
                                              </span>
                                              <span className="text-[#8C8C8C] block">
                                                {addr.postalCode} {addr.city}
                                              </span>
                                            </div>
                                            {addr.isDefault && (
                                              <Star className="h-3 w-3 flex-shrink-0 text-amber-400" />
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                              </AnimatePresence>

                              {/* Geolocation button */}
                              <button
                                type="button"
                                onClick={handleManualGeolocate}
                                disabled={geoLoading}
                                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#FF4D4F]/40 py-1.5 text-xs text-[#FF4D4F] transition-colors hover:bg-[#FFF1F1]"
                              >
                                {geoLoading ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Navigation className="h-3.5 w-3.5" />
                                )}
                                {geoLoading
                                  ? "Pobieranie lokalizacji..."
                                  : "Użyj mojej lokalizacji"}
                              </button>

                              {/* Map preview */}
                              {customerLat && customerLng && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="overflow-hidden rounded-xl"
                                >
                                  <CheckoutMap
                                    latitude={customerLat}
                                    longitude={customerLng}
                                    address={deliveryAddress}
                                  />
                                  <p className="mt-1 flex items-center gap-1 text-[10px] text-green-600">
                                    <MapPin className="h-3 w-3" />
                                    GPS: {customerLat.toFixed(4)},{" "}
                                    {customerLng.toFixed(4)}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          </>
                        )}

                        {/* Pickup info */}
                        {orderType === "PICKUP" && location && (
                          <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                            <div className="flex items-center gap-1.5 font-medium">
                              <MapPin className="h-3.5 w-3.5" />
                              Punkt odbioru
                            </div>
                            <p className="mt-1">
                              {location.name}, {location.city}
                            </p>
                          </div>
                        )}

                        <Input
                          placeholder="Notatka do zamówienia (np. kod do domofonu, bez sztućców...)"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          className="rounded-lg text-sm"
                        />
                        {orderError && (
                          <p className="text-xs text-red-500">{orderError}</p>
                        )}

                        {/* Payment info notice */}
                        <div className="flex items-center gap-2 rounded-lg bg-[#F5F5F5] px-3 py-2 text-xs text-[#8C8C8C]">
                          <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            Po kliknięciu zostaniesz przekierowany na bezpieczną
                            stronę płatności Stripe
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowCheckout(false);
                              setOrderError(null);
                            }}
                            className="flex-1 rounded-lg text-sm"
                          >
                            Wróć
                          </Button>
                          <Button
                            disabled={
                              isPending ||
                              (orderType === "DELIVERY" &&
                                !deliveryAddress.trim()) ||
                              !guestName.trim()
                            }
                            onClick={() => {
                              setOrderError(null);
                              startTransition(async () => {
                                try {
                                  // 1. Server-side check: restaurant open + items available
                                  const check = await verifyCartAvailability(
                                    location!.id,
                                    items.map((item) => ({
                                      mealId: item.mealId,
                                      variantId: item.variantId,
                                      addonIds: item.addons.map((a) => a.id),
                                    })),
                                  );

                                  if (!check.available) {
                                    setOrderError(
                                      check.error ??
                                        "Koszyk uległ zmianie. Odśwież stronę.",
                                    );
                                    return;
                                  }

                                  // 2. Create Stripe Checkout Session via API
                                  const res = await fetch("/api/checkout", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      locationId: location!.id,
                                      restaurantName:
                                        restaurant?.name ?? "Restauracja",
                                      restaurantSlug: restaurant?.slug ?? "",
                                      items: items.map((item) => ({
                                        mealId: item.mealId,
                                        mealName: item.mealName,
                                        variantId: item.variantId,
                                        variantName: item.variantName,
                                        basePrice: item.basePrice,
                                        variantPriceModifier:
                                          item.variantPriceModifier,
                                        addons: item.addons.map((a) => ({
                                          addonId: a.id,
                                          name: a.name,
                                          price: a.price,
                                          quantity: a.quantity,
                                        })),
                                        quantity: item.quantity,
                                        note: item.note,
                                      })),
                                      subtotal,
                                      deliveryFee,
                                      discountPercent,
                                      totalPrice: total,
                                      deliveryAddress:
                                        orderType === "DELIVERY"
                                          ? deliveryAddress.trim()
                                          : null,
                                      customerLat:
                                        orderType === "DELIVERY"
                                          ? customerLat
                                          : undefined,
                                      customerLng:
                                        orderType === "DELIVERY"
                                          ? customerLng
                                          : undefined,
                                      guestName: guestName.trim(),
                                      guestEmail:
                                        guestEmail.trim() || undefined,
                                      guestPhone:
                                        guestPhone.trim() || undefined,
                                      notes: orderNotes.trim() || undefined,
                                      orderType,
                                    }),
                                  });

                                  const data = await res.json();

                                  if (!res.ok || data.error) {
                                    setOrderError(
                                      data.error ??
                                        "Nie udało się utworzyć sesji płatności",
                                    );
                                    return;
                                  }

                                  // 3. Redirect to Stripe Checkout
                                  if (data.sessionUrl) {
                                    // Stripe Checkout URL redirect (recommended)
                                    clearCart();
                                    window.location.href = data.sessionUrl;
                                  } else {
                                    setOrderError(
                                      "Nie udało się uzyskać URL płatności. Spróbuj ponownie.",
                                    );
                                  }
                                } catch (err) {
                                  setOrderError(
                                    "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
                                  );
                                }
                              });
                            }}
                            className="flex-1 gap-2 rounded-lg bg-[#FF4D4F] text-sm font-semibold text-white hover:bg-[#FF3B30]"
                          >
                            {isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CreditCard className="h-4 w-4" />
                            )}
                            Zapłać i zamów
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* End of scrollable content area */}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
