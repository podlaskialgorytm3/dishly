"use client";

import { useState } from "react";
import {
  Search,
  Star,
  SlidersHorizontal,
  X,
  Leaf,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type CuisineType = {
  id: string;
  name: string;
  slug: string;
};

type RestaurantTag = {
  id: string;
  name: string;
  slug: string;
};

type MealCategory = {
  id: string;
  name: string;
  slug: string;
};

export type FilterValues = {
  mode: "restaurants" | "meals";
  page: number;
  perPage: number;
  sortBy: string;
  query: string;
  city: string;
  minRating: number;
  maxDeliveryFee: number | undefined;
  maxMinOrderValue: number | undefined;
  freeDeliveryOnly: boolean;
  multiLocationOnly: boolean;
  cuisineTypeIds: string[];
  tagIds: string[];
  categoryIds: string[];
  minPrice: number | undefined;
  maxPrice: number | undefined;
  // Nutritional
  minCalories: number | undefined;
  maxCalories: number | undefined;
  minProtein: number | undefined;
  maxProtein: number | undefined;
  minCarbs: number | undefined;
  maxCarbs: number | undefined;
  minFat: number | undefined;
  maxFat: number | undefined;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  maxSpiceLevel: number | undefined;
};

export const defaultFilters: FilterValues = {
  mode: "restaurants",
  page: 1,
  perPage: 24,
  sortBy: "rating_desc",
  query: "",
  city: "",
  minRating: 0,
  maxDeliveryFee: undefined,
  maxMinOrderValue: undefined,
  freeDeliveryOnly: false,
  multiLocationOnly: false,
  cuisineTypeIds: [],
  tagIds: [],
  categoryIds: [],
  minPrice: undefined,
  maxPrice: undefined,
  minCalories: undefined,
  maxCalories: undefined,
  minProtein: undefined,
  maxProtein: undefined,
  minCarbs: undefined,
  maxCarbs: undefined,
  minFat: undefined,
  maxFat: undefined,
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  maxSpiceLevel: undefined,
};

type StorefrontFiltersProps = {
  cuisineTypes: CuisineType[];
  restaurantTags: RestaurantTag[];
  mealCategories: MealCategory[];
  onFiltersChange: (filters: FilterValues) => void;
  currentFilters: FilterValues;
};

export function StorefrontFilters({
  cuisineTypes,
  restaurantTags,
  mealCategories,
  onFiltersChange,
  currentFilters,
}: StorefrontFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = [
    currentFilters.minRating > 0,
    currentFilters.city.trim().length > 0,
    currentFilters.maxDeliveryFee !== undefined,
    currentFilters.maxMinOrderValue !== undefined,
    currentFilters.freeDeliveryOnly,
    currentFilters.multiLocationOnly,
    currentFilters.cuisineTypeIds.length > 0,
    currentFilters.tagIds.length > 0,
    currentFilters.categoryIds.length > 0,
    currentFilters.minPrice !== undefined ||
      currentFilters.maxPrice !== undefined,
    currentFilters.minCalories !== undefined ||
      currentFilters.maxCalories !== undefined,
    currentFilters.minProtein !== undefined ||
      currentFilters.maxProtein !== undefined,
    currentFilters.minCarbs !== undefined ||
      currentFilters.maxCarbs !== undefined,
    currentFilters.minFat !== undefined || currentFilters.maxFat !== undefined,
    currentFilters.isVegetarian,
    currentFilters.isVegan,
    currentFilters.isGlutenFree,
    currentFilters.maxSpiceLevel !== undefined,
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K],
  ) => {
    const shouldResetPage = key !== "page" && key !== "perPage";
    onFiltersChange({
      ...currentFilters,
      [key]: value,
      ...(shouldResetPage ? { page: 1 } : {}),
    });
  };

  const resetFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const toggleCuisine = (id: string) => {
    const current = currentFilters.cuisineTypeIds;
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    updateFilter("cuisineTypeIds", updated);
  };

  const toggleTag = (id: string) => {
    const current = currentFilters.tagIds;
    const updated = current.includes(id)
      ? current.filter((t) => t !== id)
      : [...current, id];
    updateFilter("tagIds", updated);
  };

  const toggleCategory = (id: string) => {
    const current = currentFilters.categoryIds;
    const updated = current.includes(id)
      ? current.filter((t) => t !== id)
      : [...current, id];
    updateFilter("categoryIds", updated);
  };

  const restaurantSortOptions = [
    { value: "rating_desc", label: "Najlepiej oceniane" },
    { value: "rating_asc", label: "Najniżej oceniane" },
    { value: "name_asc", label: "Nazwa A-Z" },
    { value: "delivery_fee_asc", label: "Najtańsza dostawa" },
    { value: "min_order_asc", label: "Najniższe minimum" },
    { value: "locations_desc", label: "Najwięcej lokalizacji" },
  ];

  const mealSortOptions = [
    { value: "newest", label: "Najnowsze" },
    { value: "price_asc", label: "Cena: od najtańszego" },
    { value: "price_desc", label: "Cena: od najdroższego" },
    { value: "calories_asc", label: "Najmniej kalorii" },
    { value: "calories_desc", label: "Najwięcej kalorii" },
    { value: "protein_desc", label: "Najwięcej białka" },
    { value: "name_asc", label: "Nazwa A-Z" },
  ];

  return (
    <div
      className="rounded-[20px] bg-white p-4 md:p-6"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}
    >
      {/* Search bar with toggle */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8C8C]" />
          <Input
            placeholder={
              currentFilters.mode === "restaurants"
                ? "Szukaj restauracji..."
                : "Szukaj dań i składników..."
            }
            value={currentFilters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            className="pl-10 rounded-xl border-[#EEEEEE] text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`gap-2 rounded-xl border-[#EEEEEE] text-sm ${
              showAdvanced || activeFilterCount > 0
                ? "border-[#FF4D4F] text-[#FF4D4F]"
                : "text-[#1F1F1F]"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtry
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4D4F] text-xs text-white">
                {activeFilterCount}
              </span>
            )}
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="gap-1 text-sm text-[#8C8C8C] hover:text-[#FF4D4F]"
            >
              <X className="h-4 w-4" />
              Wyczyść
            </Button>
          )}
        </div>
      </div>

      {/* Search mode */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() =>
            onFiltersChange({
              ...defaultFilters,
              mode: "restaurants",
              sortBy: "rating_desc",
              query: currentFilters.query,
              perPage: currentFilters.perPage,
              page: 1,
            })
          }
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            currentFilters.mode === "restaurants"
              ? "bg-[#FF4D4F] text-white"
              : "bg-[#F5F5F5] text-[#1F1F1F] hover:bg-[#E8E8E8]"
          }`}
        >
          Wyszukiwarka Restauracji
        </button>
        <button
          onClick={() =>
            onFiltersChange({
              ...defaultFilters,
              mode: "meals",
              sortBy: "newest",
              query: currentFilters.query,
              perPage: currentFilters.perPage,
              page: 1,
            })
          }
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            currentFilters.mode === "meals"
              ? "bg-[#FF4D4F] text-white"
              : "bg-[#F5F5F5] text-[#1F1F1F] hover:bg-[#E8E8E8]"
          }`}
        >
          Wyszukiwarka Jedzenia
        </button>
      </div>

      {/* Quick rating filter */}
      {currentFilters.mode === "restaurants" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => updateFilter("minRating", rating)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                currentFilters.minRating === rating
                  ? "bg-[#FF4D4F] text-white"
                  : "bg-[#F5F5F5] text-[#1F1F1F] hover:bg-[#FFF1F1]"
              }`}
            >
              {rating === 0 ? (
                "Wszystkie"
              ) : (
                <>
                  <Star className="h-3 w-3 fill-current" />
                  {rating}+
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Cuisine types */}
      {currentFilters.mode === "restaurants" && cuisineTypes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {cuisineTypes.map((cuisine) => (
            <button
              key={cuisine.id}
              onClick={() => toggleCuisine(cuisine.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                currentFilters.cuisineTypeIds.includes(cuisine.id)
                  ? "bg-[#FF4D4F] text-white"
                  : "bg-[#FFF1F1] text-[#FF4D4F] border border-[#FF4D4F]/20 hover:bg-[#FF4D4F]/10"
              }`}
            >
              {cuisine.name}
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 border-t border-[#EEEEEE] pt-4">
              {/* Sort */}
              <div>
                <p className="mb-1 text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                  Sortowanie
                </p>
                <select
                  value={currentFilters.sortBy}
                  onChange={(e) => updateFilter("sortBy", e.target.value)}
                  className="w-full rounded-xl border border-[#EEEEEE] bg-white px-3 py-2 text-sm text-[#1F1F1F] focus:border-[#FF4D4F] focus:outline-none"
                >
                  {(currentFilters.mode === "restaurants"
                    ? restaurantSortOptions
                    : mealSortOptions
                  ).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                  Elementów na stronę
                </p>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={currentFilters.perPage}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value || "", 10);
                    const safe = Number.isFinite(raw)
                      ? Math.min(100, Math.max(1, raw))
                      : 24;
                    updateFilter("perPage", safe);
                  }}
                  className="rounded-xl border-[#EEEEEE] text-sm"
                />
              </div>

              {/* Amenity Tags */}
              {currentFilters.mode === "restaurants" &&
                restaurantTags.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                      Udogodnienia
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {restaurantTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            currentFilters.tagIds.includes(tag.id)
                              ? "bg-[#1F1F1F] text-white"
                              : "bg-[#F5F5F5] text-[#1F1F1F] hover:bg-[#E8E8E8]"
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Restaurant-specific controls */}
              {currentFilters.mode === "restaurants" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                      Miasto
                    </p>
                    <Input
                      placeholder="np. Warszawa"
                      value={currentFilters.city}
                      onChange={(e) => updateFilter("city", e.target.value)}
                      className="rounded-xl border-[#EEEEEE] text-sm"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                      Max opłata dostawy
                    </p>
                    <Input
                      type="number"
                      placeholder="PLN"
                      value={currentFilters.maxDeliveryFee ?? ""}
                      onChange={(e) =>
                        updateFilter(
                          "maxDeliveryFee",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        )
                      }
                      className="rounded-xl border-[#EEEEEE] text-sm"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                      Max minimalne zam.
                    </p>
                    <Input
                      type="number"
                      placeholder="PLN"
                      value={currentFilters.maxMinOrderValue ?? ""}
                      onChange={(e) =>
                        updateFilter(
                          "maxMinOrderValue",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        )
                      }
                      className="rounded-xl border-[#EEEEEE] text-sm"
                    />
                  </div>
                </div>
              )}

              {currentFilters.mode === "restaurants" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      updateFilter(
                        "freeDeliveryOnly",
                        !currentFilters.freeDeliveryOnly,
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      currentFilters.freeDeliveryOnly
                        ? "bg-[#1F1F1F] text-white"
                        : "bg-[#F5F5F5] text-[#1F1F1F] hover:bg-[#E8E8E8]"
                    }`}
                  >
                    Tylko darmowa dostawa
                  </button>
                  <button
                    onClick={() =>
                      updateFilter(
                        "multiLocationOnly",
                        !currentFilters.multiLocationOnly,
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      currentFilters.multiLocationOnly
                        ? "bg-[#1F1F1F] text-white"
                        : "bg-[#F5F5F5] text-[#1F1F1F] hover:bg-[#E8E8E8]"
                    }`}
                  >
                    Tylko sieci (2+ lokalizacje)
                  </button>
                </div>
              )}

              {/* Meal-specific controls */}
              {currentFilters.mode === "meals" && (
                <div>
                  <p className="mb-3 text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                    Cena dania [PLN]
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <PriceRangeSlider
                      min={0}
                      max={200}
                      step={1}
                      valueMin={currentFilters.minPrice}
                      valueMax={currentFilters.maxPrice}
                      onChangeMin={(v) => updateFilter("minPrice", v)}
                      onChangeMax={(v) => updateFilter("maxPrice", v)}
                    />
                    <div className="rounded-xl bg-[#FAFAFA] p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Flame className="h-4 w-4 text-red-500" />
                        <span className="text-xs font-medium text-[#1F1F1F]">
                          Pikantność (max)
                        </span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={9}
                        value={currentFilters.maxSpiceLevel ?? ""}
                        onChange={(e) =>
                          updateFilter(
                            "maxSpiceLevel",
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs text-[#1F1F1F] focus:border-[#FF4D4F] focus:outline-none"
                        placeholder="0-9"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentFilters.mode === "meals" && mealCategories.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                    Kategorie dań
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mealCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          currentFilters.categoryIds.includes(category.id)
                            ? "bg-[#FF4D4F] text-white"
                            : "bg-[#FFF1F1] text-[#FF4D4F] border border-[#FF4D4F]/20 hover:bg-[#FF4D4F]/10"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietary Preferences */}
              {currentFilters.mode === "meals" && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                    Preferencje dietetyczne
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        updateFilter(
                          "isVegetarian",
                          !currentFilters.isVegetarian,
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        currentFilters.isVegetarian
                          ? "bg-green-600 text-white"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      <Leaf className="h-3 w-3" />
                      Wegetariańskie
                    </button>
                    <button
                      onClick={() =>
                        updateFilter("isVegan", !currentFilters.isVegan)
                      }
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        currentFilters.isVegan
                          ? "bg-green-600 text-white"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      <Leaf className="h-3 w-3" />
                      Wegańskie
                    </button>
                    <button
                      onClick={() =>
                        updateFilter(
                          "isGlutenFree",
                          !currentFilters.isGlutenFree,
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        currentFilters.isGlutenFree
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      }`}
                    >
                      <Wheat className="h-3 w-3" />
                      Bezglutenowe
                    </button>
                  </div>
                </div>
              )}

              {/* Macronutrient Sliders */}
              {currentFilters.mode === "meals" && (
                <div>
                  <p className="mb-3 text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                    Makroskładniki (na 100g)
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Calories */}
                    <NutrientSlider
                      icon={<Zap className="h-4 w-4 text-orange-500" />}
                      label="Kalorie [kcal]"
                      min={0}
                      max={1000}
                      step={50}
                      valueMin={currentFilters.minCalories}
                      valueMax={currentFilters.maxCalories}
                      onChangeMin={(v) => updateFilter("minCalories", v)}
                      onChangeMax={(v) => updateFilter("maxCalories", v)}
                    />

                    {/* Protein */}
                    <NutrientSlider
                      icon={<Dumbbell className="h-4 w-4 text-red-500" />}
                      label="Białko [g]"
                      min={0}
                      max={60}
                      step={5}
                      valueMin={currentFilters.minProtein}
                      valueMax={currentFilters.maxProtein}
                      onChangeMin={(v) => updateFilter("minProtein", v)}
                      onChangeMax={(v) => updateFilter("maxProtein", v)}
                    />

                    {/* Carbs */}
                    <NutrientSlider
                      icon={<Wheat className="h-4 w-4 text-amber-600" />}
                      label="Węglowodany [g]"
                      min={0}
                      max={100}
                      step={5}
                      valueMin={currentFilters.minCarbs}
                      valueMax={currentFilters.maxCarbs}
                      onChangeMin={(v) => updateFilter("minCarbs", v)}
                      onChangeMax={(v) => updateFilter("maxCarbs", v)}
                    />

                    {/* Fat */}
                    <NutrientSlider
                      icon={<Droplets className="h-4 w-4 text-blue-500" />}
                      label="Tłuszcze [g]"
                      min={0}
                      max={60}
                      step={5}
                      valueMin={currentFilters.minFat}
                      valueMax={currentFilters.maxFat}
                      onChangeMin={(v) => updateFilter("minFat", v)}
                      onChangeMax={(v) => updateFilter("maxFat", v)}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PriceRangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}: {
  min: number;
  max: number;
  step: number;
  valueMin: number | undefined;
  valueMax: number | undefined;
  onChangeMin: (value: number | undefined) => void;
  onChangeMax: (value: number | undefined) => void;
}) {
  const currentMin = valueMin ?? min;
  const currentMax = valueMax ?? max;
  const range = max - min;

  const leftPercent = ((currentMin - min) / range) * 100;
  const rightPercent = ((currentMax - min) / range) * 100;

  return (
    <div className="rounded-xl bg-[#FAFAFA] p-3">
      <div className="mb-2 flex items-center gap-2">
        <Zap className="h-4 w-4 text-[#FF4D4F]" />
        <span className="text-xs font-medium text-[#1F1F1F]">Cena</span>
      </div>

      <div className="mb-3 flex items-center justify-between text-xs text-[#8C8C8C]">
        <span>{currentMin} PLN</span>
        <span>{currentMax} PLN</span>
      </div>

      <div className="relative h-8">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-[#E8E8E8]" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#FF4D4F]"
          style={{
            left: `${leftPercent}%`,
            width: `${Math.max(0, rightPercent - leftPercent)}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentMin}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), currentMax);
            onChangeMin(next);
          }}
          className="pointer-events-none absolute left-0 top-0 h-8 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FF4D4F] [&::-webkit-slider-thumb]:bg-white"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentMax}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), currentMin);
            onChangeMax(next);
          }}
          className="pointer-events-none absolute left-0 top-0 h-8 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FF4D4F] [&::-webkit-slider-thumb]:bg-white"
        />
      </div>
    </div>
  );
}

// ============================================
// NUTRIENT SLIDER COMPONENT
// ============================================

function NutrientSlider({
  icon,
  label,
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}: {
  icon: React.ReactNode;
  label: string;
  min: number;
  max: number;
  step: number;
  valueMin: number | undefined;
  valueMax: number | undefined;
  onChangeMin: (value: number | undefined) => void;
  onChangeMax: (value: number | undefined) => void;
}) {
  return (
    <div className="rounded-xl bg-[#FAFAFA] p-3">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-[#1F1F1F]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Od"
          value={valueMin ?? ""}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value) : undefined;
            onChangeMin(val);
          }}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs text-[#1F1F1F] focus:border-[#FF4D4F] focus:outline-none"
        />
        <span className="text-xs text-[#8C8C8C]">–</span>
        <input
          type="number"
          placeholder="Do"
          value={valueMax ?? ""}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value) : undefined;
            onChangeMax(val);
          }}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs text-[#1F1F1F] focus:border-[#FF4D4F] focus:outline-none"
        />
      </div>
    </div>
  );
}
