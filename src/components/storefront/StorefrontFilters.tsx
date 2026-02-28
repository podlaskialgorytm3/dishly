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

export type FilterValues = {
  query: string;
  minRating: number;
  cuisineTypeIds: string[];
  tagIds: string[];
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
  maxSpiceLevel: number | undefined;
};

const defaultFilters: FilterValues = {
  query: "",
  minRating: 0,
  cuisineTypeIds: [],
  tagIds: [],
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
  maxSpiceLevel: undefined,
};

type StorefrontFiltersProps = {
  cuisineTypes: CuisineType[];
  restaurantTags: RestaurantTag[];
  onFiltersChange: (filters: FilterValues) => void;
  currentFilters: FilterValues;
};

export function StorefrontFilters({
  cuisineTypes,
  restaurantTags,
  onFiltersChange,
  currentFilters,
}: StorefrontFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = [
    currentFilters.minRating > 0,
    currentFilters.cuisineTypeIds.length > 0,
    currentFilters.tagIds.length > 0,
    currentFilters.minCalories !== undefined ||
      currentFilters.maxCalories !== undefined,
    currentFilters.minProtein !== undefined ||
      currentFilters.maxProtein !== undefined,
    currentFilters.minCarbs !== undefined ||
      currentFilters.maxCarbs !== undefined,
    currentFilters.minFat !== undefined || currentFilters.maxFat !== undefined,
    currentFilters.isVegetarian,
    currentFilters.isVegan,
    currentFilters.maxSpiceLevel !== undefined,
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K],
  ) => {
    onFiltersChange({ ...currentFilters, [key]: value });
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
            placeholder="Szukaj restauracji lub dań..."
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

      {/* Quick rating filter */}
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

      {/* Cuisine types */}
      {cuisineTypes.length > 0 && (
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
              {/* Amenity Tags */}
              {restaurantTags.length > 0 && (
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

              {/* Dietary Preferences */}
              <div>
                <p className="mb-2 text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                  Preferencje dietetyczne
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      updateFilter("isVegetarian", !currentFilters.isVegetarian)
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
                </div>
              </div>

              {/* Macronutrient Sliders */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

export { defaultFilters };
