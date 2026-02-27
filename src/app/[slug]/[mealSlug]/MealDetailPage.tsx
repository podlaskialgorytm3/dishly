"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Scale,
  Flame,
  Leaf,
  Check,
  Plus,
  Minus,
  ShoppingCart,
  Wheat,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Restaurant = {
  name: string;
  slug: string;
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
  category: Category;
  variants: MealVariant[];
  addons: MealAddon[];
  restaurant: Restaurant;
};

type MealDetailPageProps = {
  meal: Meal;
};

export default function MealDetailPage({ meal }: MealDetailPageProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    meal.variants.length > 0 ? meal.variants[0].id : null,
  );
  const [selectedAddons, setSelectedAddons] = useState<Map<string, number>>(
    new Map(),
  );
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  // Oblicz cenę końcową
  const totalPrice = useMemo(() => {
    let price = meal.basePrice;

    // Dodaj cenę wariantu
    if (selectedVariant) {
      const variant = meal.variants.find((v) => v.id === selectedVariant);
      if (variant) {
        price += variant.priceModifier;
      }
    }

    // Dodaj cenę dodatków
    selectedAddons.forEach((qty, addonId) => {
      const addon = meal.addons.find((a) => a.id === addonId);
      if (addon) {
        price += addon.price * qty;
      }
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

  const renderSpiceLevel = (level: number) => {
    const maxLevel = 5;
    const normalizedLevel = Math.min(level, maxLevel);

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: maxLevel }).map((_, i) => (
            <Flame
              key={i}
              className={`h-5 w-5 transition-colors ${
                i < normalizedLevel ? "text-[#FF5722]" : "text-[#E0E0E0]"
              }`}
            />
          ))}
        </div>
        <span className="text-[13px] text-[#8C8C8C]">
          {normalizedLevel === 0 && "Brak ostrości"}
          {normalizedLevel === 1 && "Delikatnie pikantne"}
          {normalizedLevel === 2 && "Lekko ostre"}
          {normalizedLevel === 3 && "Średnio ostre"}
          {normalizedLevel === 4 && "Ostre"}
          {normalizedLevel === 5 && "Bardzo ostre"}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Breadcrumb / Back navigation */}
      <div className="container mx-auto px-4 py-4 md:px-8">
        <Link
          href={`/${meal.restaurant.slug}`}
          className="inline-flex items-center gap-2 text-sm text-[#8C8C8C] transition-colors hover:text-[#FF4D4F]"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót do {meal.restaurant.name}
        </Link>
      </div>

      {/* Main content */}
      <div className="container mx-auto max-w-[1200px] px-4 pb-32 md:px-10 md:pb-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left column - Image */}
          <div className="relative">
            <div
              className={`aspect-square overflow-hidden rounded-[24px] bg-[#F5F5F5] shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition-opacity duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              {meal.imageUrl ? (
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  onLoad={() => setImageLoaded(true)}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-8xl">
                  🍽️
                </div>
              )}
            </div>

            {/* Skeleton loading */}
            {meal.imageUrl && !imageLoaded && (
              <div className="absolute inset-0 animate-pulse rounded-[24px] bg-gradient-to-r from-[#F0F0F0] to-[#E0E0E0]" />
            )}
          </div>

          {/* Right column - Details */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Category badge */}
              <span className="inline-block rounded-[12px] bg-[#FFF1F1] px-[10px] py-1 text-sm font-medium text-[#FF4D4F]">
                {meal.category.name}
              </span>

              {/* Name */}
              <h1 className="mt-2 text-[28px] font-bold leading-tight text-[#1F1F1F] md:text-[32px]">
                {meal.name}
              </h1>

              {/* Price */}
              <p className="mt-2 text-[24px] font-bold text-[#FF4D4F]">
                {formatPrice(meal.basePrice)}
                {selectedVariant && (
                  <span className="ml-2 text-sm font-normal text-[#8C8C8C]">
                    (cena bazowa)
                  </span>
                )}
              </p>
            </div>

            {/* Description */}
            {meal.description && (
              <p className="max-w-[90%] animate-in fade-in slide-in-from-bottom-4 text-[#8C8C8C] leading-relaxed duration-500 delay-100">
                {meal.description}
              </p>
            )}

            {/* Special labels */}
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              {meal.isVegan && (
                <span className="inline-flex items-center gap-1.5 rounded-[20px] bg-[#E8F5E9] px-[14px] py-1.5 text-[14px] font-medium text-[#2E7D32]">
                  <Leaf className="h-4 w-4" />
                  Wegańskie
                </span>
              )}
              {meal.isVegetarian && !meal.isVegan && (
                <span className="inline-flex items-center gap-1.5 rounded-[20px] bg-[#E8F5E9] px-[14px] py-1.5 text-[14px] font-medium text-[#2E7D32]">
                  <Leaf className="h-4 w-4" />
                  Wegetariańskie
                </span>
              )}
              {meal.isGlutenFree && (
                <span className="inline-flex items-center gap-1.5 rounded-[20px] bg-[#FFF8E1] px-[14px] py-1.5 text-[14px] font-medium text-[#F57F17]">
                  <Wheat className="h-4 w-4" />
                  Bezglutenowe
                </span>
              )}
            </div>

            {/* Spice level */}
            {meal.spiceLevel > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <h3 className="mb-2 text-sm font-semibold text-[#1F1F1F]">
                  Poziom ostrości
                </h3>
                {renderSpiceLevel(meal.spiceLevel)}
              </div>
            )}

            {/* Nutritional profile */}
            {(meal.calories ||
              meal.protein ||
              meal.carbs ||
              meal.fat ||
              meal.weight) && (
              <div className="rounded-[20px] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-250">
                <h3 className="mb-4 text-sm font-semibold text-[#1F1F1F]">
                  Profil dietetyczny
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {meal.calories && (
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#1F1F1F]">
                        {meal.calories}
                      </p>
                      <p className="text-xs text-[#8C8C8C]">kcal</p>
                    </div>
                  )}
                  {meal.protein && (
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#1F1F1F]">
                        {meal.protein}
                        <span className="text-sm font-normal">g</span>
                      </p>
                      <p className="text-xs text-[#8C8C8C]">białko (100g)</p>
                    </div>
                  )}
                  {meal.carbs && (
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#1F1F1F]">
                        {meal.carbs}
                        <span className="text-sm font-normal">g</span>
                      </p>
                      <p className="text-xs text-[#8C8C8C]">
                        węglowodany (100g)
                      </p>
                    </div>
                  )}
                  {meal.fat && (
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#1F1F1F]">
                        {meal.fat}
                        <span className="text-sm font-normal">g</span>
                      </p>
                      <p className="text-xs text-[#8C8C8C]">tłuszcze (100g)</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-center gap-6 border-t border-[#EEEEEE] pt-4 text-sm text-[#8C8C8C]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {meal.preparationTime} min
                  </span>
                  {meal.weight && (
                    <span className="flex items-center gap-1.5">
                      <Scale className="h-4 w-4" />
                      {meal.weight}g
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Variants */}
            {meal.variants.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <h3 className="mb-3 text-sm font-semibold text-[#1F1F1F]">
                  Wybierz rozmiar
                </h3>
                <div className="flex flex-wrap gap-3">
                  {meal.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      disabled={!variant.isAvailable}
                      className={`flex min-w-[120px] cursor-pointer items-center justify-between rounded-[16px] border-2 px-4 py-3 transition-all duration-200 ${
                        selectedVariant === variant.id
                          ? "border-[#FF4D4F] bg-[#FFF1F1]"
                          : "border-[#EEEEEE] bg-white hover:border-[#FF8C42]"
                      } ${!variant.isAvailable && "cursor-not-allowed opacity-50"}`}
                    >
                      <span className="font-medium text-[#1F1F1F]">
                        {variant.name}
                      </span>
                      <span
                        className={`ml-3 text-sm ${
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
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-350">
                <h3 className="mb-3 text-sm font-semibold text-[#1F1F1F]">
                  Dodatki
                </h3>
                <div className="space-y-0">
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
                        className={`flex cursor-pointer items-center justify-between border-b border-[#F5F5F5] py-3 transition-colors last:border-b-0 ${
                          !addon.isAvailable && "cursor-not-allowed opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200 ${
                              isSelected
                                ? "border-[#FF4D4F] bg-[#FF4D4F]"
                                : "border-[#EEEEEE] bg-white"
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-[#1F1F1F]">
                              {addon.name}
                            </span>
                            {addon.isRequired && (
                              <span className="ml-2 text-xs text-[#FF4D4F]">
                                (wymagane)
                              </span>
                            )}
                            {addon.maxQuantity > 1 && (
                              <span className="ml-2 text-xs text-[#8C8C8C]">
                                max: {addon.maxQuantity}
                                {selectedQty > 0 &&
                                  ` (wybrano: ${selectedQty})`}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-medium text-[#1F1F1F]">
                          +{formatPrice(addon.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity selector - Desktop */}
            <div className="hidden md:flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
              <span className="text-sm font-semibold text-[#1F1F1F]">
                Ilość:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EEEEEE] bg-white transition-colors hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-lg font-semibold text-[#1F1F1F]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EEEEEE] bg-white transition-colors hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CTA Button - Desktop */}
            <Button className="hidden md:flex w-full gap-2 rounded-[16px] bg-[#FF4D4F] py-6 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#FF3B30] animate-in fade-in slide-in-from-bottom-4 delay-500">
              <ShoppingCart className="h-5 w-5" />
              Dodaj do koszyka • {formatPrice(totalPrice)}
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky CTA - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white px-4 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.15)] md:hidden">
        <div className="flex items-center gap-4">
          {/* Quantity selector - Mobile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EEEEEE] bg-white transition-colors hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-lg font-semibold text-[#1F1F1F]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EEEEEE] bg-white transition-colors hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add to cart button */}
          <Button className="flex-1 gap-2 rounded-[16px] bg-[#FF4D4F] py-6 text-base font-semibold text-white transition-all duration-200 hover:bg-[#FF3B30]">
            <ShoppingCart className="h-5 w-5" />
            <span className="truncate">Dodaj • {formatPrice(totalPrice)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
