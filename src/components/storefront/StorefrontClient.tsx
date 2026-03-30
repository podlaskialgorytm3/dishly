"use client";

import {
  useState,
  useCallback,
  useEffect,
  useTransition,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  Truck,
  Clock,
  RefreshCw,
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
  type RestaurantMapLocation,
} from "@/actions/storefront";
import { useLocationStore } from "@/stores/location-store";
import { HeroMapBackground } from "./HeroMapBackground";
import { useCartStore } from "@/stores/cart-store";

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

type MealCategory = {
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
  latitude: number | null;
  longitude: number | null;
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

type SearchMeal = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  isVegetarian: boolean;
  isVegan: boolean;
  spiceLevel: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantLogoUrl: string | null;
  locations: {
    id: string;
    name: string;
    city: string;
    address: string;
    deliveryRadius: number;
    deliveryFee: number;
    minOrderValue: number;
    latitude: number | null;
    longitude: number | null;
  }[];
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
    mealCategories: MealCategory[];
    recentOrders: RecentOrder[];
    userAddresses: SavedAddress[];
    trendingMeals: TrendingMeal[];
    searchMeals: SearchMeal[];
    mapLocations: RestaurantMapLocation[];
    mode: "restaurants" | "meals";
    restaurantPagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
    mealPagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
    isLoggedIn: boolean;
  };
};

// ============================================
// QUICK CATEGORIES
// ============================================

const heroCategories = [
  { slug: "pizza", label: "Pizza", emoji: "🍕" },
  { slug: "burgery", label: "Burgery", emoji: "🍔" },
  { slug: "sushi", label: "Sushi", emoji: "🍱" },
  { slug: "salatki", label: "Sałatki", emoji: "🥗" },
  { slug: "desery", label: "Desery", emoji: "🍰" },
  { slug: "azjatyckie", label: "Azjatyckie", emoji: "🥢" },
  { slug: "weganskie", label: "Wegańskie", emoji: "🌱" },
  { slug: "zdrowe", label: "Zdrowe", emoji: "🥦" },
  { slug: "kebab", label: "Kebab", emoji: "🌯" },
  { slug: "sniadania", label: "Śniadania", emoji: "🍳" },
  { slug: "zupy", label: "Zupy", emoji: "🍜" },
  { slug: "makarony", label: "Makarony", emoji: "🍝" },
  { slug: "bbq", label: "BBQ", emoji: "🔥" },
];

// ============================================
// COMPONENT
// ============================================

export function StorefrontClient({ initialData }: StorefrontClientProps) {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState(initialData.restaurants);
  const [searchMeals, setSearchMeals] = useState(initialData.searchMeals);
  const [restaurantPagination, setRestaurantPagination] = useState(
    initialData.restaurantPagination,
  );
  const [mealPagination, setMealPagination] = useState(
    initialData.mealPagination,
  );
  const [filters, setFilters] = useState<FilterValues>({
    ...defaultFilters,
    mode: initialData.mode,
    page:
      initialData.mode === "restaurants"
        ? initialData.restaurantPagination.page
        : initialData.mealPagination.page,
    perPage:
      initialData.mode === "restaurants"
        ? initialData.restaurantPagination.perPage
        : initialData.mealPagination.perPage,
  });
  const [isPending, startTransition] = useTransition();
  const [activeHeroCategories, setActiveHeroCategories] = useState<string[]>(
    [],
  );
  const [heroParallax, setHeroParallax] = useState({ x: 0, y: 0 });
  const userLocation = useLocationStore((s) => s.userLocation);
  const addItem = useCartStore((s) => s.addItem);
  const confirmClearAndAdd = useCartStore((s) => s.confirmClearAndAdd);
  const openDrawer = useCartStore((s) => s.openDrawer);

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
  const applyFilters = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);

    startTransition(async () => {
      const apiFilters: RestaurantFilters = {
        mode: newFilters.mode,
        page: newFilters.page,
        perPage: newFilters.perPage,
        categorySlugs:
          newFilters.categorySlugs.length > 0
            ? newFilters.categorySlugs
            : undefined,
        query: newFilters.query || undefined,
        city: newFilters.city || undefined,
        minRating: newFilters.minRating || undefined,
        maxDeliveryFee: newFilters.maxDeliveryFee,
        maxMinOrderValue: newFilters.maxMinOrderValue,
        freeDeliveryOnly: newFilters.freeDeliveryOnly || undefined,
        multiLocationOnly: newFilters.multiLocationOnly || undefined,
        cuisineTypeIds:
          newFilters.cuisineTypeIds.length > 0
            ? newFilters.cuisineTypeIds
            : undefined,
        tagIds: newFilters.tagIds.length > 0 ? newFilters.tagIds : undefined,
        categoryIds:
          newFilters.categoryIds.length > 0
            ? newFilters.categoryIds
            : undefined,
        minPrice: newFilters.minPrice,
        maxPrice: newFilters.maxPrice,
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
        isGlutenFree: newFilters.isGlutenFree || undefined,
        maxSpiceLevel: newFilters.maxSpiceLevel,
        sortBy: newFilters.sortBy,
      };

      const result = await getStorefrontData(apiFilters);
      if (result.success && result.data) {
        setRestaurants(result.data.restaurants);
        setSearchMeals(result.data.searchMeals);
        setRestaurantPagination(result.data.restaurantPagination);
        setMealPagination(result.data.mealPagination);
      }
    });
  }, []);

  useEffect(() => {
    const activeSlugs = initialData.mealCategories
      .filter((category) => filters.categoryIds.includes(category.id))
      .map((category) => category.slug)
      .filter((slug) => heroCategories.some((cat) => cat.slug === slug));

    setActiveHeroCategories(activeSlugs);
  }, [filters.categoryIds, initialData.mealCategories]);

  const pagination =
    filters.mode === "restaurants" ? restaurantPagination : mealPagination;

  const goToPage = (nextPage: number) => {
    const clamped = Math.min(
      Math.max(1, nextPage),
      Math.max(1, pagination.totalPages),
    );
    if (clamped === filters.page) {
      return;
    }
    applyFilters({ ...filters, page: clamped });
  };

  const handleHeroCategoryToggle = (slug: string) => {
    const next = activeHeroCategories.includes(slug)
      ? activeHeroCategories.filter((item) => item !== slug)
      : [...activeHeroCategories, slug];

    setActiveHeroCategories(next);

    const selectedCategoryIds = initialData.mealCategories
      .filter((category) => next.includes(category.slug))
      .map((category) => category.id);

    applyFilters({
      ...defaultFilters,
      mode: "restaurants",
      sortBy: "rating_desc",
      categoryIds: selectedCategoryIds,
      categorySlugs: next,
      perPage: filters.perPage,
    });
  };

  const handleHeroMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (window.innerWidth < 1024) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setHeroParallax({
      x: (x - 0.5) * 12,
      y: (y - 0.5) * 10,
    });
  };

  const handleHeroMouseLeave = () => {
    setHeroParallax({ x: 0, y: 0 });
  };

  const handleHeroCta = () => {
    router.push("/mapa");
  };

  const locationEyebrow = userLocation?.city
    ? `${userLocation.city} i okolice`
    : "Warszawa i okolice";

  const uniqueRestaurantCount = new Set(
    initialData.mapLocations.map((location) => location.restaurant.id),
  ).size;
  const restaurantCountRounded =
    uniqueRestaurantCount >= 100
      ? Math.floor(uniqueRestaurantCount / 100) * 100
      : uniqueRestaurantCount;

  const handleAddMealToCart = (meal: SearchMeal) => {
    const targetLocation = pickNearestMealLocation(
      meal.locations,
      userLocation,
    );

    if (!targetLocation) {
      window.alert("To danie nie ma aktywnej lokalizacji dostawy.");
      return;
    }

    const restaurant = {
      id: meal.restaurantId,
      name: meal.restaurantName,
      slug: meal.restaurantSlug,
      logoUrl: meal.restaurantLogoUrl,
    };

    const location = {
      id: targetLocation.id,
      name: targetLocation.name,
      city: targetLocation.city,
      address: targetLocation.address,
      deliveryFee: targetLocation.deliveryFee,
      minOrderValue: targetLocation.minOrderValue,
      deliveryRadius: targetLocation.deliveryRadius,
    };

    const nextItem = {
      mealId: meal.id,
      mealName: meal.name,
      mealSlug: meal.slug,
      mealImageUrl: meal.imageUrl,
      variantId: null,
      variantName: null,
      basePrice: meal.basePrice,
      variantPriceModifier: 0,
      addons: [],
      quantity: 1,
      note: "",
      isAvailable: true,
    };

    const result = addItem(restaurant, location, nextItem);
    if (result === "confirm-clear") {
      const shouldReplace = window.confirm(
        "W koszyku są produkty z innej restauracji. Wyczyścić koszyk i dodać nowe danie?",
      );
      if (!shouldReplace) {
        return;
      }
      confirmClearAndAdd(restaurant, location, nextItem);
    }

    openDrawer();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <section
        className="hero-section relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <HeroMapBackground
          locations={initialData.mapLocations}
          parallaxOffset={heroParallax}
        />
        <div
          className="hero-overlay absolute inset-0 z-10"
          aria-hidden="true"
        />

        <div className="hero-content relative z-20 mx-auto flex w-full max-w-5xl flex-col items-center px-3 text-center md:px-8">
          <span className="hero-eyebrow">{locationEyebrow}</span>

          <h1
            className="hero-h1 mb-4 text-[#1a1612]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Zamów coś
            <br />
            <span className="text-[#E8503A]">pysznego</span>
          </h1>

          <p className="hero-sub mb-8 max-w-2xl text-[#6b6058]">
            Najlepsze restauracje w Twojej okolicy - uczciwe ceny, szeroki wybór
          </p>

          <div className="hero-stat mb-8" role="status" aria-live="polite">
            <span className="hero-stat-dot" aria-hidden="true" />
            <span className="hero-stat-text">
              {restaurantCountRounded.toLocaleString("pl-PL")}+ restauracji
              dostępnych teraz
            </span>
          </div>

          <button
            type="button"
            onClick={handleHeroCta}
            className="hero-cta mb-10"
          >
            Przeglądaj restauracje
            <span className="hero-cta-arrow" aria-hidden="true">
              <ArrowRight className="h-3 w-3" />
            </span>
          </button>

          <div className="mb-5 flex justify-center">
            <LocationPicker
              savedAddresses={initialData.userAddresses}
              isLoggedIn={initialData.isLoggedIn}
            />
          </div>

          <span id="hero-cats-label" className="cats-label mb-4">
            Czego szukasz?
          </span>
          <div
            className="cats-wrap flex max-w-[720px] flex-wrap justify-center gap-2"
            role="group"
            aria-labelledby="hero-cats-label"
          >
            {heroCategories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleHeroCategoryToggle(cat.slug)}
                className={`cat-pill inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] transition-all ${
                  activeHeroCategories.includes(cat.slug)
                    ? "active border-[#1a1612] bg-[#1a1612] text-white"
                    : "border-[#c8beb2b3] bg-[#ffffffe0] text-[#3d3530] hover:bg-[#fffffff8]"
                }`}
                data-slug={cat.slug}
              >
                <span className="cat-icon" aria-hidden="true">
                  {cat.emoji}
                </span>
                <span>{cat.label}</span>
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
            mealCategories={initialData.mealCategories}
            onFiltersChange={applyFilters}
            currentFilters={filters}
          />
        </section>

        {/* Results */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1F1F1F]">
              {filters.mode === "restaurants"
                ? "Wyniki restauracji"
                : "Wyniki dań"}
              {isPending && (
                <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#FF4D4F] border-t-transparent" />
              )}
            </h2>
            <span className="text-sm text-[#8C8C8C]">
              {filters.mode === "restaurants"
                ? restaurantPagination.total
                : mealPagination.total}{" "}
              wyników
            </span>
          </div>

          <AnimatePresence mode="wait">
            {filters.mode === "restaurants" ? (
              restaurants.length > 0 ? (
                <motion.div
                  key="restaurant-results"
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
                      <RestaurantCardEnhanced
                        restaurant={restaurant}
                        userLocation={userLocation}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyResults
                  message="Nie znaleziono restauracji spełniających kryteria wyszukiwania"
                  onReset={() => applyFilters(defaultFilters)}
                />
              )
            ) : searchMeals.length > 0 ? (
              <motion.div
                key="meal-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {searchMeals.map((meal, index) => (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                      <Link href={`/${meal.restaurantSlug}/${meal.slug}`}>
                        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#FF4D4F]/10 to-[#FF8C42]/10">
                          {meal.imageUrl ? (
                            <img
                              src={meal.imageUrl}
                              alt={meal.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-6xl">
                              🍽️
                            </div>
                          )}
                          <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#1F1F1F]">
                            {formatPrice(meal.basePrice)}
                          </div>
                        </div>
                      </Link>

                      <div className="p-4">
                        <Link href={`/${meal.restaurantSlug}/${meal.slug}`}>
                          <h3 className="mb-1 text-base font-bold text-[#1F1F1F] line-clamp-1">
                            {meal.name}
                          </h3>
                        </Link>
                        <p className="mb-2 text-sm text-[#8C8C8C] line-clamp-2">
                          {meal.description || meal.category.name}
                        </p>
                        <p className="mb-2 text-xs text-[#8C8C8C]">
                          {meal.restaurantName}
                        </p>
                        <div className="flex flex-wrap gap-2 text-[11px] text-[#8C8C8C]">
                          {meal.calories !== null && (
                            <span className="rounded-full bg-[#F5F5F5] px-2 py-0.5">
                              {meal.calories} kcal
                            </span>
                          )}
                          {meal.protein !== null && (
                            <span className="rounded-full bg-[#F5F5F5] px-2 py-0.5">
                              B {meal.protein}g
                            </span>
                          )}
                          {meal.carbs !== null && (
                            <span className="rounded-full bg-[#F5F5F5] px-2 py-0.5">
                              W {meal.carbs}g
                            </span>
                          )}
                          {meal.fat !== null && (
                            <span className="rounded-full bg-[#F5F5F5] px-2 py-0.5">
                              T {meal.fat}g
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleAddMealToCart(meal)}
                            className="inline-flex items-center justify-center rounded-full bg-[#FF4D4F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#FF3B30]"
                            type="button"
                          >
                            Dodaj do koszyka
                          </button>
                          <Link
                            href={`/${meal.restaurantSlug}/${meal.slug}`}
                            className="inline-flex items-center justify-center rounded-full border border-[#EEEEEE] px-4 py-2 text-xs font-semibold text-[#1F1F1F] hover:bg-[#FAFAFA]"
                          >
                            Zobacz danie
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyResults
                message="Nie znaleziono dań spełniających kryteria wyszukiwania"
                onReset={() =>
                  applyFilters({ ...defaultFilters, mode: "meals" })
                }
              />
            )}
          </AnimatePresence>

          {pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => goToPage(filters.page - 1)}
                disabled={filters.page <= 1 || isPending}
                className="rounded-full border border-[#EEEEEE] px-4 py-2 text-sm text-[#1F1F1F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Poprzednia
              </button>

              <span className="px-2 text-sm text-[#8C8C8C]">
                Strona {pagination.page} z {pagination.totalPages}
              </span>

              <button
                onClick={() => goToPage(filters.page + 1)}
                disabled={filters.page >= pagination.totalPages || isPending}
                className="rounded-full border border-[#EEEEEE] px-4 py-2 text-sm text-[#1F1F1F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Następna
              </button>
            </div>
          )}
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

function EmptyResults({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-4 text-6xl">🔍</div>
      <h3 className="mb-2 text-xl font-bold text-[#1F1F1F]">Brak wyników</h3>
      <p className="mb-4 text-[#8C8C8C]">{message}</p>
      <button
        onClick={onReset}
        className="rounded-full bg-[#FF4D4F] px-6 py-2 text-sm font-medium text-white hover:bg-[#FF3B30]"
      >
        Wyczyść filtry
      </button>
    </motion.div>
  );
}

function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getReferencePoint(
  userLocation: {
    latitude: number;
    longitude: number;
  } | null,
) {
  if (
    userLocation &&
    Math.abs(userLocation.latitude) > 0.001 &&
    Math.abs(userLocation.longitude) > 0.001
  ) {
    return { lat: userLocation.latitude, lng: userLocation.longitude };
  }

  // PKiN fallback when geolocation is unavailable.
  return { lat: 52.23196, lng: 21.00672 };
}

function pickNearestLocation(
  locations: LocationData[],
  userLocation: { latitude: number; longitude: number } | null,
) {
  if (locations.length === 0) {
    return null;
  }

  const withCoords = locations.filter(
    (loc) => loc.latitude !== null && loc.longitude !== null,
  );
  if (withCoords.length === 0) {
    return locations[0];
  }

  const ref = getReferencePoint(userLocation);
  return withCoords.reduce((best, loc) => {
    if (!best) {
      return loc;
    }
    const bestDistance = getDistanceKm(
      ref.lat,
      ref.lng,
      best.latitude as number,
      best.longitude as number,
    );
    const currentDistance = getDistanceKm(
      ref.lat,
      ref.lng,
      loc.latitude as number,
      loc.longitude as number,
    );
    return currentDistance < bestDistance ? loc : best;
  }, withCoords[0]);
}

function pickNearestMealLocation(
  locations: SearchMeal["locations"],
  userLocation: { latitude: number; longitude: number } | null,
) {
  if (locations.length === 0) {
    return null;
  }

  const withCoords = locations.filter(
    (loc) => loc.latitude !== null && loc.longitude !== null,
  );
  if (withCoords.length === 0) {
    return locations[0];
  }

  const ref = getReferencePoint(userLocation);
  return withCoords.reduce((best, loc) => {
    if (!best) {
      return loc;
    }
    const bestDistance = getDistanceKm(
      ref.lat,
      ref.lng,
      best.latitude as number,
      best.longitude as number,
    );
    const currentDistance = getDistanceKm(
      ref.lat,
      ref.lng,
      loc.latitude as number,
      loc.longitude as number,
    );
    return currentDistance < bestDistance ? loc : best;
  }, withCoords[0]);
}

function RestaurantCardEnhanced({
  restaurant,
  userLocation,
}: {
  restaurant: Restaurant;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
}) {
  const primaryLocation = pickNearestLocation(
    restaurant.locations,
    userLocation,
  );

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
            {restaurant.locations.length > 1 && (
              <span className="rounded-full bg-[#FFF1F1] px-2 py-0.5 text-[11px] text-[#FF4D4F]">
                {restaurant.locations.length} lokalizacji
              </span>
            )}
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
