"use client";

import { useState, useMemo } from "react";
import {
  X,
  Plus,
  Minus,
  Check,
  ShoppingCart,
  Flame,
  Clock,
  Scale,
  Zap,
  Leaf,
  Wheat,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, type CartAddon } from "@/stores/cart-store";

// ============================================
// TYPES
// ============================================

type MealVariant = {
  id: string;
  name: string;
  priceModifier: number;
  isAvailable: boolean;
};

type MealAddon = {
  id: string;
  name: string;
  price: number;
  isRequired: boolean;
  maxQuantity: number;
  isAvailable: boolean;
};

type Meal = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  preparationTime: number;
  weight: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  spiceLevel: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isAvailable: boolean;
  variants: MealVariant[];
  addons: MealAddon[];
};

type RestaurantInfo = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

type LocationInfo = {
  id: string;
  name: string;
  city: string;
  address: string;
  deliveryFee: number;
  minOrderValue: number;
  deliveryRadius: number;
};

type MealConfiguratorModalProps = {
  meal: Meal;
  restaurant: RestaurantInfo;
  location: LocationInfo;
  isOpen: boolean;
  onClose: () => void;
  onConfirmClearCart?: () => void;
};

// ============================================
// COMPONENT
// ============================================

export function MealConfiguratorModal({
  meal,
  restaurant,
  location,
  isOpen,
  onClose,
  onConfirmClearCart,
}: MealConfiguratorModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const confirmClearAndAdd = useCartStore((s) => s.confirmClearAndAdd);

  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    meal.variants.length > 0 ? meal.variants[0].id : null,
  );
  const [selectedAddons, setSelectedAddons] = useState<Map<string, number>>(
    new Map(),
  );
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    let price = meal.basePrice;

    if (selectedVariant) {
      const variant = meal.variants.find((v) => v.id === selectedVariant);
      if (variant) price += variant.priceModifier;
    }

    selectedAddons.forEach((qty, addonId) => {
      const addon = meal.addons.find((a) => a.id === addonId);
      if (addon) price += addon.price * qty;
    });

    return price * quantity;
  }, [meal, selectedVariant, selectedAddons, quantity]);

  const toggleAddon = (addonId: string, maxQty: number) => {
    setSelectedAddons((prev) => {
      const newMap = new Map(prev);
      const currentQty = newMap.get(addonId) || 0;

      if (currentQty === 0) {
        newMap.set(addonId, 1);
      } else if (currentQty < maxQty) {
        newMap.set(addonId, currentQty + 1);
      } else {
        newMap.delete(addonId);
      }

      return newMap;
    });
  };

  const handleAddToCart = () => {
    if (!meal.isAvailable) return;

    // Check required addons
    const requiredAddons = meal.addons.filter((a) => a.isRequired);
    for (const addon of requiredAddons) {
      if (!selectedAddons.has(addon.id)) {
        return; // Don't add if required addon is missing
      }
    }

    const cartAddons: CartAddon[] = [];
    selectedAddons.forEach((qty, addonId) => {
      const addon = meal.addons.find((a) => a.id === addonId);
      if (addon) {
        cartAddons.push({
          id: addon.id,
          name: addon.name,
          price: addon.price,
          quantity: qty,
        });
      }
    });

    const variant = selectedVariant
      ? meal.variants.find((v) => v.id === selectedVariant)
      : null;

    const cartItem = {
      mealId: meal.id,
      mealName: meal.name,
      mealSlug: meal.slug,
      mealImageUrl: meal.imageUrl,
      variantId: selectedVariant,
      variantName: variant?.name || null,
      basePrice: meal.basePrice,
      variantPriceModifier: variant?.priceModifier || 0,
      addons: cartAddons,
      quantity,
      note,
      isAvailable: meal.isAvailable,
    };

    const result = addItem(
      {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logoUrl,
      },
      location,
      cartItem,
    );

    if (result === "confirm-clear") {
      setShowClearConfirm(true);
      return;
    }

    // Success
    onClose();
    resetState();
  };

  const handleConfirmClear = () => {
    const cartAddons: CartAddon[] = [];
    selectedAddons.forEach((qty, addonId) => {
      const addon = meal.addons.find((a) => a.id === addonId);
      if (addon) {
        cartAddons.push({
          id: addon.id,
          name: addon.name,
          price: addon.price,
          quantity: qty,
        });
      }
    });

    const variant = selectedVariant
      ? meal.variants.find((v) => v.id === selectedVariant)
      : null;

    confirmClearAndAdd(
      {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logoUrl,
      },
      location,
      {
        mealId: meal.id,
        mealName: meal.name,
        mealSlug: meal.slug,
        mealImageUrl: meal.imageUrl,
        variantId: selectedVariant,
        variantName: variant?.name || null,
        basePrice: meal.basePrice,
        variantPriceModifier: variant?.priceModifier || 0,
        addons: cartAddons,
        quantity,
        note,
        isAvailable: meal.isAvailable,
      },
    );

    setShowClearConfirm(false);
    onClose();
    resetState();
  };

  const resetState = () => {
    setSelectedVariant(meal.variants.length > 0 ? meal.variants[0].id : null);
    setSelectedAddons(new Map());
    setQuantity(1);
    setNote("");
    setShowNote(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[24px] bg-white md:rounded-[24px]"
          >
            {/* Clear cart confirmation overlay */}
            {showClearConfirm && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[24px] bg-white/95 p-8">
                <div className="text-center">
                  <div className="mb-4 text-5xl">⚠️</div>
                  <h3 className="mb-2 text-lg font-bold text-[#1F1F1F]">
                    Wyczyścić koszyk?
                  </h3>
                  <p className="mb-6 text-sm text-[#8C8C8C]">
                    Masz w koszyku produkty z innej restauracji. Czy chcesz
                    wyczyścić koszyk i dodać nowe danie?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 rounded-xl"
                    >
                      Anuluj
                    </Button>
                    <Button
                      onClick={handleConfirmClear}
                      className="flex-1 rounded-xl bg-[#FF4D4F] hover:bg-[#FF3B30]"
                    >
                      Wyczyść i dodaj
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
            >
              <X className="h-4 w-4 text-[#1F1F1F]" />
            </button>

            {/* Image */}
            <div className="relative h-48 overflow-hidden rounded-t-[24px] bg-[#F5F5F5] md:rounded-t-[24px]">
              {meal.imageUrl ? (
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">
                  🍽️
                </div>
              )}

              {!meal.isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#1F1F1F]">
                    Niedostępne
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-bold text-[#1F1F1F]">
                    {meal.name}
                  </h2>
                  <span className="ml-3 text-xl font-bold text-[#FF4D4F]">
                    {formatPrice(meal.basePrice)}
                  </span>
                </div>

                {meal.description && (
                  <p className="mt-1 text-sm text-[#8C8C8C]">
                    {meal.description}
                  </p>
                )}

                {/* Quick info badges */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {meal.isVegan && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      <Leaf className="h-3 w-3" />
                      Wegańskie
                    </span>
                  )}
                  {meal.isVegetarian && !meal.isVegan && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      <Leaf className="h-3 w-3" />
                      Wege
                    </span>
                  )}
                  {meal.isGlutenFree && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      <Wheat className="h-3 w-3" />
                      B/G
                    </span>
                  )}
                  {meal.spiceLevel > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                      {Array.from({
                        length: Math.min(meal.spiceLevel, 5),
                      }).map((_, i) => (
                        <Flame key={i} className="h-3 w-3" />
                      ))}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-[#8C8C8C]">
                    <Clock className="h-3 w-3" />
                    {meal.preparationTime} min
                  </span>
                  {meal.weight && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#8C8C8C]">
                      <Scale className="h-3 w-3" />
                      {meal.weight}g
                    </span>
                  )}
                  {meal.calories && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#8C8C8C]">
                      <Zap className="h-3 w-3" />
                      {meal.calories} kcal
                    </span>
                  )}
                </div>
              </div>

              {/* Variants */}
              {meal.variants.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold text-[#1F1F1F]">
                    Wybierz wariant
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {meal.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant.id)}
                        disabled={!variant.isAvailable}
                        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm transition-all ${
                          selectedVariant === variant.id
                            ? "border-[#FF4D4F] bg-[#FFF1F1]"
                            : "border-[#EEEEEE] hover:border-[#FF8C42]"
                        } ${!variant.isAvailable && "cursor-not-allowed opacity-50"}`}
                      >
                        <span className="font-medium">{variant.name}</span>
                        <span
                          className={`text-xs ${
                            selectedVariant === variant.id
                              ? "text-[#FF4D4F]"
                              : "text-[#8C8C8C]"
                          }`}
                        >
                          {variant.priceModifier >= 0 ? "+" : ""}
                          {formatPrice(variant.priceModifier)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Addons */}
              {meal.addons.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold text-[#1F1F1F]">
                    Dodatki
                  </h3>
                  <div className="space-y-0 rounded-xl border border-[#EEEEEE] overflow-hidden">
                    {meal.addons.map((addon) => {
                      const selectedQty = selectedAddons.get(addon.id) || 0;
                      const isSelected = selectedQty > 0;

                      return (
                        <div
                          key={addon.id}
                          onClick={() =>
                            addon.isAvailable &&
                            toggleAddon(addon.id, addon.maxQuantity)
                          }
                          className={`flex cursor-pointer items-center justify-between border-b border-[#F5F5F5] px-3 py-2.5 transition-colors last:border-b-0 hover:bg-[#FAFAFA] ${
                            !addon.isAvailable &&
                            "cursor-not-allowed opacity-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                                isSelected
                                  ? "border-[#FF4D4F] bg-[#FF4D4F]"
                                  : "border-[#CCCCCC]"
                              }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-[#1F1F1F]">
                                {addon.name}
                              </span>
                              {addon.isRequired && (
                                <span className="ml-1 text-xs text-[#FF4D4F]">
                                  *
                                </span>
                              )}
                              {addon.maxQuantity > 1 && selectedQty > 0 && (
                                <span className="ml-2 text-xs text-[#8C8C8C]">
                                  ({selectedQty}/{addon.maxQuantity})
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-[#8C8C8C]">
                            +{formatPrice(addon.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Note for chef */}
              <div className="mb-4">
                {!showNote ? (
                  <button
                    onClick={() => setShowNote(true)}
                    className="flex items-center gap-2 text-sm text-[#8C8C8C] hover:text-[#FF4D4F] transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Dodaj notatkę dla kucharza
                  </button>
                ) : (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1F1F1F]">
                      Notatka dla kucharza
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="np. bez cebuli, extra sos..."
                      maxLength={200}
                      className="w-full rounded-xl border border-[#EEEEEE] p-3 text-sm text-[#1F1F1F] placeholder:text-[#CCCCCC] focus:border-[#FF4D4F] focus:outline-none resize-none"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Quantity + Add to cart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#EEEEEE] px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8C8C8C] hover:bg-[#F5F5F5] hover:text-[#FF4D4F]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[24px] text-center font-semibold text-[#1F1F1F]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8C8C8C] hover:bg-[#F5F5F5] hover:text-[#FF4D4F]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!meal.isAvailable}
                  className="flex-1 gap-2 rounded-xl bg-[#FF4D4F] py-5 text-sm font-semibold text-white transition-all hover:bg-[#FF3B30] disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {meal.isAvailable
                    ? `Dodaj do koszyka • ${formatPrice(totalPrice)}`
                    : "Niedostępne"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
