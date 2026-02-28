"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Truck,
  Flame,
  Search,
  Zap,
  Scale,
  Leaf,
  Wheat,
  SlidersHorizontal,
  Dumbbell,
  Droplets,
  ChevronDown,
  ChevronUp,
  X,
  ShoppingCart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MealConfiguratorModal } from "@/components/storefront/MealConfiguratorModal";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { motion, AnimatePresence } from "framer-motion";

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
  sortOrder: number;
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
  category: Category;
  variants: MealVariant[];
  addons: MealAddon[];
  locations: { locationId: string }[];
};

type Location = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  openingHours: any;
  deliveryRadius: number;
  deliveryFee: number;
  minOrderValue: number;
};

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

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  bio: string | null;
  locations: Location[];
  meals: Meal[];
  cuisineTypes: CuisineType[];
  tags: RestaurantTag[];
};

type RestaurantPageProps = {
  restaurant: Restaurant;
};

export default function RestaurantPage({ restaurant }: RestaurantPageProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    restaurant.locations[0]?.id || null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterDietary, setFilterDietary] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showNutritionalFilters, setShowNutritionalFilters] = useState(false);
  // Nutritional filters
  const [minProtein, setMinProtein] = useState<number | undefined>(undefined);
  const [maxProtein, setMaxProtein] = useState<number | undefined>(undefined);
  const [minCalories, setMinCalories] = useState<number | undefined>(undefined);
  const [maxCalories, setMaxCalories] = useState<number | undefined>(undefined);
  const [minCarbs, setMinCarbs] = useState<number | undefined>(undefined);
  const [maxCarbs, setMaxCarbs] = useState<number | undefined>(undefined);
  const [minFat, setMinFat] = useState<number | undefined>(undefined);
  const [maxFat, setMaxFat] = useState<number | undefined>(undefined);

  // Pobierz unikalne kategorie z dań
  const categories = useMemo(() => {
    const categoryMap = new Map<string, Category>();
    restaurant.meals.forEach((meal) => {
      if (!categoryMap.has(meal.category.id)) {
        categoryMap.set(meal.category.id, meal.category);
      }
    });
    return Array.from(categoryMap.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  }, [restaurant.meals]);

  // Filtruj dania
  const filteredMeals = useMemo(() => {
    return restaurant.meals.filter((meal) => {
      // Filtruj po lokalizacji
      if (
        selectedLocation &&
        !meal.locations.some((ml) => ml.locationId === selectedLocation)
      ) {
        return false;
      }

      // Wyszukiwanie
      if (
        searchQuery &&
        !meal.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !meal.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filtr kategorii
      if (filterCategory && meal.category.id !== filterCategory) {
        return false;
      }

      // Filtr dietetyczny
      if (filterDietary === "vegetarian" && !meal.isVegetarian) return false;
      if (filterDietary === "vegan" && !meal.isVegan) return false;
      if (filterDietary === "glutenFree" && !meal.isGlutenFree) return false;

      // Nutritional filters
      if (
        minProtein !== undefined &&
        (meal.protein === null || meal.protein < minProtein)
      )
        return false;
      if (
        maxProtein !== undefined &&
        (meal.protein === null || meal.protein > maxProtein)
      )
        return false;
      if (
        minCalories !== undefined &&
        (meal.calories === null || meal.calories < minCalories)
      )
        return false;
      if (
        maxCalories !== undefined &&
        (meal.calories === null || meal.calories > maxCalories)
      )
        return false;
      if (
        minCarbs !== undefined &&
        (meal.carbs === null || meal.carbs < minCarbs)
      )
        return false;
      if (
        maxCarbs !== undefined &&
        (meal.carbs === null || meal.carbs > maxCarbs)
      )
        return false;
      if (minFat !== undefined && (meal.fat === null || meal.fat < minFat))
        return false;
      if (maxFat !== undefined && (meal.fat === null || meal.fat > maxFat))
        return false;

      return true;
    });
  }, [
    restaurant.meals,
    selectedLocation,
    searchQuery,
    filterCategory,
    filterDietary,
    minProtein,
    maxProtein,
    minCalories,
    maxCalories,
    minCarbs,
    maxCarbs,
    minFat,
    maxFat,
  ]);

  // Grupuj dania po kategoriach
  const mealsByCategory = useMemo(() => {
    const grouped = new Map<string, Meal[]>();
    filteredMeals.forEach((meal) => {
      const existing = grouped.get(meal.category.id) || [];
      grouped.set(meal.category.id, [...existing, meal]);
    });
    return grouped;
  }, [filteredMeals]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const currentLocation = restaurant.locations.find(
    (loc) => loc.id === selectedLocation,
  );

  const getTodayHours = (openingHours: any) => {
    if (!openingHours) return null;
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = days[new Date().getDay()];
    return openingHours[today];
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header z cover image */}
      <div
        className="relative h-[400px] md:h-[450px] bg-gradient-to-r from-[#FF4D4F] to-[#FF8C00] overflow-hidden"
        style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}
      >
        {restaurant.coverImageUrl ? (
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-9xl opacity-20">🍽️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      </div>

      {/* Info restauracji */}
      <div className="container mx-auto -mt-16 px-4 md:px-8 relative z-10">
        <div
          className="rounded-[20px] bg-white p-6"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo */}
            <div
              className="flex h-[120px] w-[120px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white border-4 border-white relative z-20"
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
            >
              {restaurant.logoUrl ? (
                <img
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl">🍽️</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-[30px] md:text-[34px] font-bold text-[#1F1F1F] mt-6">
                {restaurant.name}
              </h1>

              {/* Rodzaj Kuchni - Chipy */}
              {restaurant.cuisineTypes.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {restaurant.cuisineTypes.map((cuisine) => (
                    <span
                      key={cuisine.id}
                      className="rounded-[20px] bg-[#FFF1F1] border border-[#FF4D4F] px-4 py-2 text-sm font-medium text-[#FF4D4F] transition-all duration-200 hover:bg-[#FF4D4F] hover:text-white cursor-pointer"
                    >
                      {cuisine.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Etykiety - Udogodnienia */}
              {restaurant.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {restaurant.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-[16px] bg-[#F5F5F5] px-[14px] py-[6px] text-[13px] font-medium text-[#1F1F1F]"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {restaurant.bio && (
                <p
                  className="mt-4 text-sm text-[#8C8C8C] leading-relaxed max-w-[700px]"
                  style={{ lineHeight: "1.6" }}
                >
                  {restaurant.bio}
                </p>
              )}
            </div>

            {/* Lokalizacja wybrana */}
            {restaurant.locations.length > 0 && (
              <div className="md:text-right">
                {restaurant.locations.length > 1 && (
                  <select
                    value={selectedLocation || ""}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="mb-2 rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm focus:border-[#FF4D4F] focus:outline-none transition-all duration-200"
                  >
                    {restaurant.locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.city})
                      </option>
                    ))}
                  </select>
                )}

                {currentLocation && (
                  <div className="space-y-1 text-sm">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${currentLocation.address}, ${currentLocation.city}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#8C8C8C] hover:text-[#FF4D4F] transition-colors cursor-pointer"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="underline decoration-dotted underline-offset-2">
                        {currentLocation.address}, {currentLocation.city}
                      </span>
                    </a>
                    <a
                      href={`tel:${currentLocation.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-[#8C8C8C] hover:text-[#FF4D4F] transition-colors cursor-pointer"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="underline decoration-dotted underline-offset-2">
                        {currentLocation.phone}
                      </span>
                    </a>
                    <div className="flex items-center gap-2 text-[#8C8C8C]">
                      <Truck className="h-4 w-4" />
                      <span>
                        Dostawa od {formatPrice(currentLocation.minOrderValue)},
                        opłata {formatPrice(currentLocation.deliveryFee)}
                      </span>
                    </div>
                    {getTodayHours(currentLocation.openingHours) && (
                      <div className="flex items-center gap-2 text-[#8C8C8C]">
                        <Clock className="h-4 w-4" />
                        <span>
                          Dziś:{" "}
                          {getTodayHours(currentLocation.openingHours).closed
                            ? "Zamknięte"
                            : `${getTodayHours(currentLocation.openingHours).open} - ${getTodayHours(currentLocation.openingHours).close}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="container mx-auto px-4 py-8 md:px-8">
        {/* Filtry */}
        <div
          className="mb-6 flex flex-wrap items-center gap-4 rounded-[20px] bg-white p-6"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8C8C]" />
            <Input
              placeholder="Szukaj dania..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-[#EEEEEE]"
            />
          </div>

          <select
            value={filterCategory || ""}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm focus:border-[#FF4D4F] focus:outline-none transition-all duration-200"
          >
            <option value="">Wszystkie kategorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filterDietary || ""}
            onChange={(e) => setFilterDietary(e.target.value || null)}
            className="rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm focus:border-[#FF4D4F] focus:outline-none transition-all duration-200"
          >
            <option value="">Wszystkie</option>
            <option value="vegetarian">Wegetariańskie</option>
            <option value="vegan">Wegańskie</option>
            <option value="glutenFree">Bezglutenowe</option>
          </select>

          <Button
            variant="outline"
            onClick={() => setShowNutritionalFilters(!showNutritionalFilters)}
            className={`gap-2 rounded-xl border-[#EEEEEE] text-sm ${
              showNutritionalFilters ? "border-[#FF4D4F] text-[#FF4D4F]" : ""
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Odżywcze
            {showNutritionalFilters ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Nutritional Filters Panel */}
        <AnimatePresence>
          {showNutritionalFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className="mb-6 rounded-[20px] bg-white p-6"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1F1F1F]">
                    Filtry odżywcze (na 100g)
                  </h3>
                  <button
                    onClick={() => {
                      setMinProtein(undefined);
                      setMaxProtein(undefined);
                      setMinCalories(undefined);
                      setMaxCalories(undefined);
                      setMinCarbs(undefined);
                      setMaxCarbs(undefined);
                      setMinFat(undefined);
                      setMaxFat(undefined);
                      setMaxSpice(undefined);
                    }}
                    className="text-xs text-[#8C8C8C] hover:text-[#FF4D4F]"
                  >
                    Wyczyść
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-[#FAFAFA] p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="text-xs font-medium">
                        Kalorie [kcal]
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Od"
                        value={minCalories ?? ""}
                        onChange={(e) =>
                          setMinCalories(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs focus:border-[#FF4D4F] focus:outline-none"
                      />
                      <span className="text-xs text-[#8C8C8C]">–</span>
                      <input
                        type="number"
                        placeholder="Do"
                        value={maxCalories ?? ""}
                        onChange={(e) =>
                          setMaxCalories(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs focus:border-[#FF4D4F] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#FAFAFA] p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-red-500" />
                      <span className="text-xs font-medium">Białko [g]</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Od"
                        value={minProtein ?? ""}
                        onChange={(e) =>
                          setMinProtein(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs focus:border-[#FF4D4F] focus:outline-none"
                      />
                      <span className="text-xs text-[#8C8C8C]">–</span>
                      <input
                        type="number"
                        placeholder="Do"
                        value={maxProtein ?? ""}
                        onChange={(e) =>
                          setMaxProtein(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs focus:border-[#FF4D4F] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#FAFAFA] p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Wheat className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-medium">
                        Węglowodany [g]
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Od"
                        value={minCarbs ?? ""}
                        onChange={(e) =>
                          setMinCarbs(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs focus:border-[#FF4D4F] focus:outline-none"
                      />
                      <span className="text-xs text-[#8C8C8C]">–</span>
                      <input
                        type="number"
                        placeholder="Do"
                        value={maxCarbs ?? ""}
                        onChange={(e) =>
                          setMaxCarbs(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs focus:border-[#FF4D4F] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#FAFAFA] p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium">Tłuszcze [g]</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Od"
                        value={minFat ?? ""}
                        onChange={(e) =>
                          setMinFat(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs focus:border-[#FF4D4F] focus:outline-none"
                      />
                      <span className="text-xs text-[#8C8C8C]">–</span>
                      <input
                        type="number"
                        placeholder="Do"
                        value={maxFat ?? ""}
                        onChange={(e) =>
                          setMaxFat(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-full rounded-lg border border-[#EEEEEE] bg-white px-2 py-1.5 text-xs focus:border-[#FF4D4F] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista dań pogrupowanych po kategoriach */}
        {filteredMeals.length === 0 ? (
          <div
            className="rounded-[20px] bg-white p-8 text-center"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}
          >
            <p className="text-[#8C8C8C]">Brak dań spełniających kryteria</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories
              .filter((cat) => mealsByCategory.has(cat.id))
              .map((category) => (
                <div key={category.id}>
                  <h2 className="mb-4 text-xl font-bold text-[#1F1F1F]">
                    {category.name}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mealsByCategory.get(category.id)?.map((meal) => (
                      <div
                        key={meal.id}
                        onClick={() =>
                          meal.isAvailable && setSelectedMeal(meal)
                        }
                        className={`group cursor-pointer rounded-[20px] bg-white p-4 transition-all duration-200 block relative ${
                          meal.isAvailable
                            ? "hover:-translate-y-1"
                            : "opacity-70"
                        }`}
                        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}
                      >
                        {/* Unavailable overlay */}
                        {!meal.isAvailable && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[20px] bg-white/60">
                            <span className="rounded-full bg-[#1F1F1F] px-4 py-1.5 text-sm font-semibold text-white">
                              Niedostępne
                            </span>
                          </div>
                        )}

                        {/* Obrazek */}
                        <div className="mb-3 h-40 overflow-hidden rounded-xl bg-[#F5F5F5]">
                          {meal.imageUrl ? (
                            <img
                              src={meal.imageUrl}
                              alt={meal.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-5xl">
                              🍽️
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#1F1F1F] line-clamp-1">
                              {meal.name}
                            </h3>
                            {meal.description && (
                              <p className="mt-1 text-xs text-[#8C8C8C] line-clamp-2">
                                {meal.description}
                              </p>
                            )}
                          </div>
                          <span className="ml-2 text-lg font-bold text-[#FF4D4F]">
                            {formatPrice(meal.basePrice)}
                          </span>
                        </div>

                        {/* Tagi i info */}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {meal.isVegan && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              Vegan
                            </span>
                          )}
                          {meal.isVegetarian && !meal.isVegan && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              Vege
                            </span>
                          )}
                          {meal.isGlutenFree && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              B/G
                            </span>
                          )}
                          {meal.spiceLevel > 0 && (
                            <div className="flex items-center gap-0.5">
                              {Array.from({
                                length: Math.min(meal.spiceLevel, 3),
                              }).map((_, i) => (
                                <Flame
                                  key={i}
                                  className="h-3 w-3 text-[#FF4D4F]"
                                />
                              ))}
                            </div>
                          )}
                          {meal.variants.length > 0 && (
                            <span className="text-xs text-[#8C8C8C]">
                              +{meal.variants.length} rozmiarów
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-3 text-xs text-[#8C8C8C]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {meal.preparationTime} min
                          </span>
                          {meal.weight && (
                            <span className="flex items-center gap-1">
                              <Scale className="h-3 w-3" />
                              {meal.weight}g
                            </span>
                          )}
                          {meal.calories && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {meal.calories} kcal
                            </span>
                          )}
                        </div>

                        {/* Add to cart button */}
                        {meal.isAvailable && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMeal(meal);
                            }}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF4D4F] py-2 text-sm font-medium text-white transition-all hover:bg-[#FF3B30]"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Dodaj do koszyka
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Meal Configurator Modal */}
      {selectedMeal && currentLocation && (
        <MealConfiguratorModal
          meal={selectedMeal}
          restaurant={{
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            logoUrl: restaurant.logoUrl,
          }}
          location={{
            id: currentLocation.id,
            name: currentLocation.name,
            city: currentLocation.city,
            address: currentLocation.address,
            deliveryFee: currentLocation.deliveryFee,
            minOrderValue: currentLocation.minOrderValue,
            deliveryRadius: currentLocation.deliveryRadius,
          }}
          isOpen={!!selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
