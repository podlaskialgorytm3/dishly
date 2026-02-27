"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cart-store";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [showDiscount, setShowDiscount] = useState(false);
  const [mounted, setMounted] = useState(false);

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
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const applyDiscountCode = useCartStore((s) => s.applyDiscountCode);
  const removeDiscountCode = useCartStore((s) => s.removeDiscountCode);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          onClick={() => setIsOpen(true)}
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
              onClick={() => setIsOpen(false)}
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
                    onClick={() => setIsOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F5F5]"
                  >
                    <X className="h-5 w-5 text-[#1F1F1F]" />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
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
                                      updateQuantity(item.id, item.quantity - 1)
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
                                      updateQuantity(item.id, item.quantity + 1)
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
                    })}
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
                  <Button
                    disabled={!meetsMinOrder}
                    className="w-full gap-2 rounded-xl bg-[#FF4D4F] py-5 text-base font-semibold text-white transition-all hover:bg-[#FF3B30] disabled:opacity-50"
                  >
                    Zamów
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
