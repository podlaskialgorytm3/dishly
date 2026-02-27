"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  Truck,
  Clock,
  RefreshCw,
  Pizza,
  Utensils,
  Soup,
  Salad,
  Cake,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  StorefrontFilters,
  type FilterValues,
  defaultFilters,
} from "@/components/storefront/StorefrontFilters";
import { LocationPicker } from "@/components/storefront/LocationPicker";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import {
  getStorefrontData,
  type RestaurantFilters,
} from "@/actions/storefront";
import { useLocationStore } from "@/stores/location-store";

// ============================================
// TYPES
// ============================================

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

type LocationData = {
  id: string;
  name: string;
  city: string;
  address: string;
  deliveryRadius: number;
  deliveryFee: number;
  minOrderValue: number;
};

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  bio: string | null;
  avgRating: number;
  reviewCount: number;
  locations: LocationData[];
  cuisineTypes: CuisineType[];
  tags: RestaurantTag[];
};

type RecentOrder = {
  id: string;
  orderNumber: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantLogoUrl: string | null;
  items: { name: string; imageUrl: string | null; quantity: number }[];
};

type TrendingMeal = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  basePrice: number;
  calories: number | null;
  protein: number | null;
  isVegetarian: boolean;
  isVegan: boolean;
  restaurantName: string;
  restaurantSlug: string;
};

type SavedAddress = {
  id: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
};

type StorefrontClientProps = {
  initialData: {
    restaurants: Restaurant[];
    cuisineTypes: CuisineType[];
    restaurantTags: RestaurantTag[];
    recentOrders: RecentOrder[];
    userAddresses: SavedAddress[];
    trendingMeals: TrendingMeal[];
    isLoggedIn: boolean;
  };
};

// ============================================
// QUICK CATEGORIES
// ============================================

const quickCategories = [
  { label: "Pizza", icon: Pizza, emoji: "🍕" },
  { label: "Burgery", icon: Utensils, emoji: "🍔" },
  { label: "Sushi", icon: Soup, emoji: "🍣" },
  { label: "Zdrowe", icon: Salad, emoji: "🥗" },
  { label: "Desery", icon: Cake, emoji: "🍰" },
];

// ============================================
// COMPONENT
// ============================================

export function StorefrontClient({ initialData }: StorefrontClientProps) {
  const [restaurants, setRestaurants] = useState(initialData.restaurants);
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const [isPending, startTransition] = useTransition();
  const userLocation = useLocationStore((s) => s.userLocation);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  // Effect to automatically set address from profile
  useEffect(() => {
    if (
      initialData.isLoggedIn &&
      initialData.userAddresses.length > 0 &&
      !userLocation
    ) {
      const defaultAddr =
        initialData.userAddresses.find((a) => a.isDefault) ||
        initialData.userAddresses[0];
      useLocationStore.getState().setUserLocation({
        latitude: 0,
        longitude: 0,
        address: defaultAddr.street,
        city: defaultAddr.city,
        source: "profile",
      });
    }
  }, [initialData.isLoggedIn, initialData.userAddresses, userLocation]);

  // Fetch filtered restaurants
  const applyFilters = useCallback(
    (newFilters: FilterValues) => {
      setFilters(newFilters);

      startTransition(async () => {
        const apiFilters: RestaurantFilters = {
          query: newFilters.query || undefined,
          minRating: newFilters.minRating || undefined,
          cuisineTypeIds:
            newFilters.cuisineTypeIds.length > 0
              ? newFilters.cuisineTypeIds
              : undefined,
          tagIds: newFilters.tagIds.length > 0 ? newFilters.tagIds : undefined,
          minCalories: newFilters.minCalories,
          maxCalories: newFilters.maxCalories,
          minProtein: newFilters.minProtein,
          maxProtein: newFilters.maxProtein,
          minCarbs: newFilters.minCarbs,
          maxCarbs: newFilters.maxCarbs,
          minFat: newFilters.minFat,
          maxFat: newFilters.maxFat,
          isVegetarian: newFilters.isVegetarian || undefined,
          isVegan: newFilters.isVegan || undefined,
          maxSpiceLevel: newFilters.maxSpiceLevel,
          city: userLocation?.city || undefined,
        };

        const result = await getStorefrontData(apiFilters);
        if (result.success && result.data) {
          setRestaurants(result.data.restaurants);
        }
      });
    },
    [userLocation],
  );

  // Quick category search
  const handleQuickCategory = (label: string) => {
    const newFilters = { ...defaultFilters, query: label };
    applyFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section with Location Picker */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FF4D4F] to-[#FF8C42] px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-white md:text-5xl lg:text-6xl">
            Zamów coś pysznego 🍕
          </h1>
          <p className="mb-6 text-base text-white/90 md:text-xl">
            Najlepsze restauracje w Twojej okolicy
          </p>

          {/* Location picker */}
          <div className="flex justify-center mb-6">
            <LocationPicker
              savedAddresses={initialData.userAddresses}
              isLoggedIn={initialData.isLoggedIn}
            />
          </div>

          {/* Quick Category Tiles */}
          <div className="flex flex-wrap justify-center gap-3">
            {quickCategories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleQuickCategory(cat.label)}
                className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-105"
              >
                <span className="text-lg">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Recent Orders (Logged-in only) */}
        {initialData.isLoggedIn && initialData.recentOrders.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1F1F1F]">
                Ostatnie zamówienia
              </h2>
              <Link
                href="/orders"
                className="flex items-center gap-1 text-sm font-medium text-[#FF4D4F] hover:underline"
              >
                Wszystkie
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {initialData.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/${order.restaurantSlug}`}
                  className="flex-shrink-0 w-[280px] rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-[#F5F5F5]">
                      {order.restaurantLogoUrl ? (
                        <img
                          src={order.restaurantLogoUrl}
                          alt={order.restaurantName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg">
                          🍽️
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1F1F1F] truncate">
                        {order.restaurantName}
                      </p>
                      <p className="text-xs text-[#8C8C8C]">
                        {new Date(order.createdAt).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#FF4D4F]">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 text-[#8C8C8C]" />
                    <span className="text-xs text-[#8C8C8C] truncate">
                      {order.items.map((i) => i.name).join(", ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="mb-6">
          <StorefrontFilters
            cuisineTypes={initialData.cuisineTypes}
            restaurantTags={initialData.restaurantTags}
            onFiltersChange={applyFilters}
            currentFilters={filters}
          />
        </section>

        {/* Restaurants Grid */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1F1F1F]">
              Restauracje w Twojej okolicy
              {isPending && (
                <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#FF4D4F] border-t-transparent" />
              )}
            </h2>
            <span className="text-sm text-[#8C8C8C]">
              {restaurants.length} wyników
            </span>
          </div>

          <AnimatePresence mode="wait">
            {restaurants.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {restaurants.map((restaurant, index) => (
                  <motion.div
                    key={restaurant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RestaurantCardEnhanced restaurant={restaurant} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="mb-2 text-xl font-bold text-[#1F1F1F]">
                  Brak wyników
                </h3>
                <p className="mb-4 text-[#8C8C8C]">
                  Nie znaleziono restauracji spełniających kryteria wyszukiwania
                </p>
                <button
                  onClick={() => applyFilters(defaultFilters)}
                  className="rounded-full bg-[#FF4D4F] px-6 py-2 text-sm font-medium text-white hover:bg-[#FF3B30]"
                >
                  Wyczyść filtry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Trending meals */}
        {initialData.trendingMeals.length > 0 && (
          <section className="mt-12 mb-8">
            <h2 className="mb-4 text-xl font-bold text-[#1F1F1F]">
              🔥 Popularne dania
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {initialData.trendingMeals.map((meal) => (
                <Link
                  key={meal.id}
                  href={`/${meal.restaurantSlug}/${meal.slug}`}
                  className="flex-shrink-0 w-[200px] rounded-2xl bg-white p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="mb-2 h-32 overflow-hidden rounded-xl bg-[#F5F5F5]">
                    {meal.imageUrl ? (
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        🍽️
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-[#1F1F1F] truncate">
                    {meal.name}
                  </h3>
                  <p className="text-xs text-[#8C8C8C] truncate">
                    {meal.restaurantName}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#FF4D4F]">
                      {formatPrice(meal.basePrice)}
                    </span>
                    {meal.calories && (
                      <span className="text-xs text-[#8C8C8C]">
                        {meal.calories} kcal
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}

// ============================================
// ENHANCED RESTAURANT CARD
// ============================================

function RestaurantCardEnhanced({ restaurant }: { restaurant: Restaurant }) {
  const primaryLocation = restaurant.locations[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  return (
    <Link
      href={`/${restaurant.slug}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#FF4D4F]/10 to-[#FF8C42]/10">
        {restaurant.coverImageUrl ? (
          <img
            src={restaurant.coverImageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : restaurant.logoUrl ? (
          <div className="flex h-full items-center justify-center">
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            🍽️
          </div>
        )}

        {/* Rating badge */}
        {restaurant.avgRating > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {restaurant.avgRating.toFixed(1)}
            <span className="text-[#8C8C8C]">({restaurant.reviewCount})</span>
          </div>
        )}

        {/* Free delivery badge */}
        {primaryLocation && primaryLocation.deliveryFee === 0 && (
          <div className="absolute right-3 top-3 rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white">
            Darmowa dostawa
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 text-lg font-bold text-[#1F1F1F]">
          {restaurant.name}
        </h3>

        {/* Cuisine types */}
        {restaurant.cuisineTypes.length > 0 && (
          <p className="mb-2 text-sm text-[#8C8C8C]">
            {restaurant.cuisineTypes.map((c) => c.name).join(" • ")}
          </p>
        )}

        {/* Location & delivery info */}
        {primaryLocation && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#8C8C8C]">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {primaryLocation.city}
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              {primaryLocation.deliveryFee > 0
                ? `od ${formatPrice(primaryLocation.deliveryFee)}`
                : "Darmowa"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Min. {formatPrice(primaryLocation.minOrderValue)}
            </span>
          </div>
        )}

        {/* Tags */}
        {restaurant.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {restaurant.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-[#F5F5F5] px-2 py-0.5 text-[11px] text-[#8C8C8C]"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
