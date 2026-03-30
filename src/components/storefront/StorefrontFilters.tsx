"use client";

import { useEffect, useState } from "react";
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
  Grid2x2,
  Clock3,
  ChartColumn,
  ListFilter,
  Settings2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
  categorySlugs: string[];
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
  categorySlugs: [],
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterValues>(currentFilters);

  useEffect(() => {
    setDraftFilters(currentFilters);
  }, [currentFilters]);

  const activeFilterCount = [
    draftFilters.minRating > 0,
    draftFilters.city.trim().length > 0,
    draftFilters.maxDeliveryFee !== undefined,
    draftFilters.maxMinOrderValue !== undefined,
    draftFilters.freeDeliveryOnly,
    draftFilters.multiLocationOnly,
    draftFilters.cuisineTypeIds.length > 0,
    draftFilters.tagIds.length > 0,
    draftFilters.categoryIds.length > 0,
    draftFilters.maxPrice !== undefined,
    draftFilters.minCalories !== undefined || draftFilters.maxCalories !== undefined,
    draftFilters.minProtein !== undefined || draftFilters.maxProtein !== undefined,
    draftFilters.minCarbs !== undefined || draftFilters.maxCarbs !== undefined,
    draftFilters.minFat !== undefined || draftFilters.maxFat !== undefined,
    draftFilters.isVegetarian,
    draftFilters.isVegan,
    draftFilters.isGlutenFree,
  ].filter(Boolean).length;

  const updateDraft = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K],
  ) => {
    const shouldResetPage = key !== "page" && key !== "perPage";
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(shouldResetPage ? { page: 1 } : {}),
    }));
  };

  const setMode = (mode: "restaurants" | "meals") => {
    setDraftFilters((prev) => ({
      ...defaultFilters,
      mode,
      perPage: prev.perPage,
      sortBy: mode === "restaurants" ? "rating_desc" : "newest",
    }));
    setPanelOpen(true);
    setAdvancedOpen(false);
  };

  const toggleCuisine = (id: string) => {
    const updated = draftFilters.cuisineTypeIds.includes(id)
      ? draftFilters.cuisineTypeIds.filter((c) => c !== id)
      : [...draftFilters.cuisineTypeIds, id];
    updateDraft("cuisineTypeIds", updated);
  };

  const toggleTag = (id: string) => {
    const updated = draftFilters.tagIds.includes(id)
      ? draftFilters.tagIds.filter((t) => t !== id)
      : [...draftFilters.tagIds, id];
    updateDraft("tagIds", updated);
  };

  const toggleCategory = (id: string) => {
    const updated = draftFilters.categoryIds.includes(id)
      ? draftFilters.categoryIds.filter((c) => c !== id)
      : [...draftFilters.categoryIds, id];

    const updatedSlugs = mealCategories
      .filter((category) => updated.includes(category.id))
      .map((category) => category.slug);

    setDraftFilters((prev) => ({
      ...prev,
      categoryIds: updated,
      categorySlugs: updatedSlugs,
      page: 1,
    }));
  };

  const resetDraftFilters = () => {
    setDraftFilters((prev) => ({
      ...defaultFilters,
      mode: prev.mode,
      perPage: prev.perPage,
    }));
  };

  const applyDraftFilters = () => {
    onFiltersChange(draftFilters);
    setPanelOpen(false);
  };

  const cuisineEmojiBySlug: Record<string, string> = {
    italian: "🍕",
    american: "🍔",
    japanese: "🍱",
    polish: "🥘",
    mexican: "🌮",
    asian: "🍜",
    indian: "🫕",
    vegan: "🥗",
    turkish: "🥙",
    european: "🍝",
    thai: "🫔",
    seafood: "🍤",
  };

  const mealEmojiBySlug: Record<string, string> = {
    pizza: "🍕",
    burgery: "🍔",
    sushi: "🍱",
    salatki: "🥗",
    desery: "🍰",
    zupy: "🍜",
    makarony: "🍝",
    bbq: "🔥",
    sniadania: "🍳",
    kebab: "🌯",
    azjatyckie: "🥢",
    zdrowe: "🥦",
  };

  const getCuisineEmoji = (slug: string) => {
    const key = slug.toLowerCase();
    const found = Object.keys(cuisineEmojiBySlug).find((item) => key.includes(item));
    return found ? cuisineEmojiBySlug[found] : "🍽️";
  };

  const restaurantSortOptions = [
    { value: "rating_desc", label: "Najlepiej oceniane" },
    { value: "min_order_asc", label: "Najszybsza dostawa" },
    { value: "delivery_fee_asc", label: "Najtańsza dostawa" },
    { value: "locations_desc", label: "Najbliższe" },
    { value: "name_asc", label: "Najnowsze" },
  ];

  const mealSortOptions = [
    { value: "protein_desc", label: "Najpopularniejsze" },
    { value: "newest", label: "Najnowsze" },
    { value: "price_asc", label: "Cena: od najtańszego" },
    { value: "price_desc", label: "Cena: od najdroższego" },
    { value: "calories_asc", label: "Najniżej kaloryczne" },
  ];

  return (
    <div
      className="rounded-[20px] bg-white p-4 md:p-6"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8C8C]" />
          <Input
            placeholder={
              draftFilters.mode === "restaurants"
                ? "Szukaj restauracji..."
                : "Szukaj dań i składników..."
            }
            value={draftFilters.query}
            onChange={(e) => updateDraft("query", e.target.value)}
            className="rounded-xl border-[#EEEEEE] pl-10 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={() => setPanelOpen((prev) => !prev)}
          className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-[13px] transition-colors ${
            panelOpen
              ? "border-[#E8503A] text-[#E8503A]"
              : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F8F8]"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtry
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-[#E8503A] px-1.5 py-0.5 text-[10px] font-medium text-white">
              {activeFilterCount}
            </span>
          )}
          {panelOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="mt-4 inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F7F7F7] p-1">
        <button
          type="button"
          onClick={() => setMode("restaurants")}
          className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${
            draftFilters.mode === "restaurants"
              ? "bg-[#E8503A] font-medium text-white"
              : "text-[#6B7280]"
          }`}
        >
          Restauracje
        </button>
        <button
          type="button"
          onClick={() => setMode("meals")}
          className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${
            draftFilters.mode === "meals"
              ? "bg-[#E8503A] font-medium text-white"
              : "text-[#6B7280]"
          }`}
        >
          Jedzenie
        </button>
      </div>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 border-t border-[#ECECEC] pt-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8C8C8C]">
                    <ListFilter className="h-3.5 w-3.5" />
                    Sortowanie
                  </p>
                  <select
                    value={draftFilters.sortBy}
                    onChange={(e) => updateDraft("sortBy", e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F1F1F]"
                  >
                    {(draftFilters.mode === "restaurants"
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
                  <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8C8C8C]">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Wyników na stronę
                  </p>
                  <select
                    value={draftFilters.perPage}
                    onChange={(e) => updateDraft("perPage", parseInt(e.target.value, 10))}
                    className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F1F1F]"
                  >
                    <option value={12}>12 na stronie</option>
                    <option value={24}>24 na stronie</option>
                    <option value={48}>48 na stronie</option>
                  </select>
                </div>
              </div>

              {draftFilters.mode === "restaurants" && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8C8C8C]">
                    <Star className="h-3.5 w-3.5" />
                    Ocena minimalna
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => updateDraft("minRating", rating)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs ${
                          draftFilters.minRating === rating
                            ? "border-[#E8503A] bg-[#FFF0EE] text-[#C03020]"
                            : "border-[#E5E7EB] text-[#6B7280] hover:border-[#E8503A] hover:text-[#E8503A]"
                        }`}
                      >
                        {rating === 0 ? "Wszystkie" : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {draftFilters.mode === "restaurants" && cuisineTypes.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8C8C8C]">
                    <Grid2x2 className="h-3.5 w-3.5" />
                    Kategorie kuchni
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                    {cuisineTypes.map((cuisine) => {
                      const active = draftFilters.cuisineTypeIds.includes(cuisine.id);
                      return (
                        <button
                          key={cuisine.id}
                          type="button"
                          onClick={() => toggleCuisine(cuisine.id)}
                          className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center ${
                            active
                              ? "border-[#E8503A] bg-[#FFF0EE]"
                              : "border-[#E5E7EB] bg-[#F8F8F8] hover:bg-white"
                          }`}
                        >
                          <span className="text-lg">{getCuisineEmoji(cuisine.slug)}</span>
                          <span className={`text-[11px] ${active ? "text-[#C03020]" : "text-[#6B7280]"}`}>
                            {cuisine.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {draftFilters.mode === "meals" && mealCategories.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8C8C8C]">
                    <Grid2x2 className="h-3.5 w-3.5" />
                    Kategorie dań
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                    {mealCategories.map((category) => {
                      const active = draftFilters.categoryIds.includes(category.id);
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center ${
                            active
                              ? "border-[#E8503A] bg-[#FFF0EE]"
                              : "border-[#E5E7EB] bg-[#F8F8F8] hover:bg-white"
                          }`}
                        >
                          <span className="text-lg">{mealEmojiBySlug[category.slug] ?? "🍽️"}</span>
                          <span className={`text-[11px] ${active ? "text-[#C03020]" : "text-[#6B7280]"}`}>
                            {category.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {draftFilters.mode === "restaurants" && restaurantTags.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8C8C8C]">
                    <Clock3 className="h-3.5 w-3.5" />
                    Udogodnienia
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {restaurantTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs ${
                          draftFilters.tagIds.includes(tag.id)
                            ? "border-[#E8503A] bg-[#FFF0EE] text-[#C03020]"
                            : "border-[#E5E7EB] text-[#6B7280] hover:text-[#1F1F1F]"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateDraft("freeDeliveryOnly", !draftFilters.freeDeliveryOnly)}
                      className={`rounded-full border px-3 py-1.5 text-xs ${
                        draftFilters.freeDeliveryOnly
                          ? "border-[#E8503A] bg-[#FFF0EE] text-[#C03020]"
                          : "border-[#E5E7EB] text-[#6B7280]"
                      }`}
                    >
                      Darmowa dostawa
                    </button>
                    <button
                      type="button"
                      onClick={() => updateDraft("multiLocationOnly", !draftFilters.multiLocationOnly)}
                      className={`rounded-full border px-3 py-1.5 text-xs ${
                        draftFilters.multiLocationOnly
                          ? "border-[#E8503A] bg-[#FFF0EE] text-[#C03020]"
                          : "border-[#E5E7EB] text-[#6B7280]"
                      }`}
                    >
                      Tylko sieci (2+ lokalizacje)
                    </button>
                  </div>
                </div>
              )}

              {draftFilters.mode === "restaurants" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8C8C8C]">
                      <Settings2 className="h-3.5 w-3.5" />
                      Miasto
                    </p>
                    <Input
                      placeholder="Miasto (np. Warszawa)"
                      value={draftFilters.city}
                      onChange={(e) => updateDraft("city", e.target.value)}
                      className="rounded-xl border-[#EEEEEE] text-sm"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-[#8C8C8C]">Max opłata dostawy (PLN)</p>
                    <Input
                      type="number"
                      placeholder="PLN"
                      value={draftFilters.maxDeliveryFee ?? ""}
                      onChange={(e) =>
                        updateDraft(
                          "maxDeliveryFee",
                          e.target.value ? parseFloat(e.target.value) : undefined,
                        )
                      }
                      className="rounded-xl border-[#EEEEEE] text-sm"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-[#8C8C8C]">Min. zamówienie (PLN)</p>
                    <Input
                      type="number"
                      placeholder="PLN"
                      value={draftFilters.maxMinOrderValue ?? ""}
                      onChange={(e) =>
                        updateDraft(
                          "maxMinOrderValue",
                          e.target.value ? parseFloat(e.target.value) : undefined,
                        )
                      }
                      className="rounded-xl border-[#EEEEEE] text-sm"
                    />
                  </div>
                </div>
              )}

              {draftFilters.mode === "meals" && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8C8C8C]">
                    <Flame className="h-3.5 w-3.5" />
                    Cena dania
                  </p>
                  <MaxPriceControl
                    max={200}
                    value={draftFilters.maxPrice}
                    onChange={(value) => updateDraft("maxPrice", value)}
                  />
                </div>
              )}

              {draftFilters.mode === "meals" && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8C8C8C]">
                    <Leaf className="h-3.5 w-3.5" />
                    Preferencje
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateDraft("isVegetarian", !draftFilters.isVegetarian)}
                      className={`rounded-full border px-3 py-1.5 text-xs ${
                        draftFilters.isVegetarian
                          ? "border-[#E8503A] bg-[#FFF0EE] text-[#C03020]"
                          : "border-[#E5E7EB] text-[#6B7280]"
                      }`}
                    >
                      Wegetariańskie
                    </button>
                    <button
                      type="button"
                      onClick={() => updateDraft("isVegan", !draftFilters.isVegan)}
                      className={`rounded-full border px-3 py-1.5 text-xs ${
                        draftFilters.isVegan
                          ? "border-[#E8503A] bg-[#FFF0EE] text-[#C03020]"
                          : "border-[#E5E7EB] text-[#6B7280]"
                      }`}
                    >
                      Wegańskie
                    </button>
                    <button
                      type="button"
                      onClick={() => updateDraft("isGlutenFree", !draftFilters.isGlutenFree)}
                      className={`rounded-full border px-3 py-1.5 text-xs ${
                        draftFilters.isGlutenFree
                          ? "border-[#E8503A] bg-[#FFF0EE] text-[#C03020]"
                          : "border-[#E5E7EB] text-[#6B7280]"
                      }`}
                    >
                      Bezglutenowe
                    </button>
                  </div>
                </div>
              )}

              {draftFilters.mode === "meals" && (
                <div>
                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 text-sm text-[#8C8C8C]"
                  >
                    <ChartColumn className="h-4 w-4" />
                    Zaawansowane
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {advancedOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <NutrientSlider
                            icon={<Zap className="h-4 w-4 text-[#E8503A]" />}
                            label="Kalorie [kcal]"
                            min={0}
                            max={1000}
                            step={50}
                            valueMin={draftFilters.minCalories}
                            valueMax={draftFilters.maxCalories}
                            onChangeMin={(v) => updateDraft("minCalories", v)}
                            onChangeMax={(v) => updateDraft("maxCalories", v)}
                          />
                          <NutrientSlider
                            icon={<Dumbbell className="h-4 w-4 text-[#3B6D11]" />}
                            label="Białko [g]"
                            min={0}
                            max={60}
                            step={5}
                            valueMin={draftFilters.minProtein}
                            valueMax={draftFilters.maxProtein}
                            onChangeMin={(v) => updateDraft("minProtein", v)}
                            onChangeMax={(v) => updateDraft("maxProtein", v)}
                          />
                          <NutrientSlider
                            icon={<Wheat className="h-4 w-4 text-[#BA7517]" />}
                            label="Węglowodany [g]"
                            min={0}
                            max={100}
                            step={5}
                            valueMin={draftFilters.minCarbs}
                            valueMax={draftFilters.maxCarbs}
                            onChangeMin={(v) => updateDraft("minCarbs", v)}
                            onChangeMax={(v) => updateDraft("maxCarbs", v)}
                          />
                          <NutrientSlider
                            icon={<Droplets className="h-4 w-4 text-[#185FA5]" />}
                            label="Tłuszcze [g]"
                            min={0}
                            max={60}
                            step={5}
                            valueMin={draftFilters.minFat}
                            valueMax={draftFilters.maxFat}
                            onChangeMin={(v) => updateDraft("minFat", v)}
                            onChangeMax={(v) => updateDraft("maxFat", v)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#ECECEC] pt-4">
                <button
                  type="button"
                  onClick={resetDraftFilters}
                  className="inline-flex items-center gap-1 text-sm text-[#8C8C8C] hover:text-[#6B7280]"
                >
                  <X className="h-4 w-4" />
                  Wyczyść filtry
                </button>
                <button
                  type="button"
                  onClick={applyDraftFilters}
                  className="rounded-full bg-[#1A1612] px-6 py-2 text-sm font-medium text-white hover:opacity-85"
                >
                  Pokaż wyniki
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MaxPriceControl({
  max,
  value,
  onChange,
}: {
  max: number;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  const current = value ?? max;

  const normalize = (next: number) => {
    const safe = Math.max(0, Math.min(max, Math.round(next)));
    onChange(safe >= max ? undefined : safe);
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={current}
        onChange={(e) => normalize(Number(e.target.value))}
        className="h-1 flex-1 accent-[#E8503A]"
      />
      <input
        type="number"
        min={0}
        max={max}
        value={current}
        onChange={(e) => normalize(Number(e.target.value || max))}
        className="h-9 w-20 rounded-lg border border-[#E5E7EB] px-2 text-center text-sm"
      />
      <span className="text-xs text-[#8C8C8C]">zł</span>
    </div>
  );
}

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
            const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
            onChangeMin(val);
          }}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs text-[#1F1F1F] focus:border-[#FF4D4F] focus:outline-none"
        />
        <span className="text-xs text-[#8C8C8C]">-</span>
        <input
          type="number"
          placeholder="Do"
          value={valueMax ?? ""}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
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
