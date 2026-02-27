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
} from "lucide-react";
import { Input } from "@/components/ui/input";

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

      return true;
    });
  }, [
    restaurant.meals,
    selectedLocation,
    searchQuery,
    filterCategory,
    filterDietary,
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
      <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-r from-[#FF4D4F] to-[#FF8C00]">
        {restaurant.coverImageUrl && (
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Info restauracji */}
      <div className="container mx-auto -mt-16 px-4 md:px-8">
        <div className="rounded-[20px] bg-white p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo */}
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md">
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
              <h1 className="text-2xl md:text-3xl font-bold text-[#1F1F1F]">
                {restaurant.name}
              </h1>

              {/* Tagi */}
              <div className="mt-2 flex flex-wrap gap-2">
                {restaurant.cuisineTypes.map((cuisine) => (
                  <span
                    key={cuisine.id}
                    className="rounded-full bg-[#FFF1F1] px-3 py-1 text-xs font-medium text-[#FF4D4F]"
                  >
                    {cuisine.name}
                  </span>
                ))}
                {restaurant.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-medium text-[#8C8C8C]"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              {restaurant.bio && (
                <p className="mt-3 text-sm text-[#8C8C8C] line-clamp-2">
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
                    className="mb-2 rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm focus:border-[#FF4D4F] focus:outline-none"
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
                    <div className="flex items-center gap-2 text-[#8C8C8C]">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {currentLocation.address}, {currentLocation.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8C8C8C]">
                      <Phone className="h-4 w-4" />
                      <span>{currentLocation.phone}</span>
                    </div>
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
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-[16px] bg-white p-4 shadow-sm">
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
            className="rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm focus:border-[#FF4D4F] focus:outline-none"
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
            className="rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm focus:border-[#FF4D4F] focus:outline-none"
          >
            <option value="">Wszystkie</option>
            <option value="vegetarian">Wegetariańskie</option>
            <option value="vegan">Wegańskie</option>
            <option value="glutenFree">Bezglutenowe</option>
          </select>
        </div>

        {/* Lista dań pogrupowanych po kategoriach */}
        {filteredMeals.length === 0 ? (
          <div className="rounded-[20px] bg-white p-8 text-center shadow-sm">
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
                      <Link
                        key={meal.id}
                        href={`/${restaurant.slug}/${meal.slug}`}
                        className="group cursor-pointer rounded-[16px] bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md block"
                      >
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
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
