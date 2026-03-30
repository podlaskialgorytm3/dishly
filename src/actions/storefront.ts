"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ============================================
// TYPES
// ============================================

export type RestaurantFilters = {
  mode?: "restaurants" | "meals";
  page?: number;
  perPage?: number;
  sortBy?: string;
  query?: string;
  city?: string;
  minRating?: number;
  maxAvgPrice?: number;
  maxDeliveryFee?: number;
  maxMinOrderValue?: number;
  freeDeliveryOnly?: boolean;
  multiLocationOnly?: boolean;
  cuisineTypeIds?: string[];
  tagIds?: string[];
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  // Nutritional filters
  minProtein?: number;
  maxProtein?: number;
  minCalories?: number;
  maxCalories?: number;
  minCarbs?: number;
  maxCarbs?: number;
  minFat?: number;
  maxFat?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  maxSpiceLevel?: number;
};

export type RestaurantMapLocation = {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  isOpenNow: boolean;
  statusLabel: string;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
};

// ============================================
// GET STOREFRONT DATA
// ============================================

export async function getStorefrontData(filters?: RestaurantFilters) {
  try {
    const session = await auth();
    const mode = filters?.mode ?? "restaurants";
    const page = Math.max(1, Number(filters?.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(filters?.perPage ?? 24)));

    // Build meal filter conditions for nutritional search
    const mealWhere: any = {
      isAvailable: true,
      approvalStatus: "APPROVED",
    };

    if (filters?.minProtein !== undefined) {
      mealWhere.protein = { ...mealWhere.protein, gte: filters.minProtein };
    }
    if (filters?.maxProtein !== undefined) {
      mealWhere.protein = { ...mealWhere.protein, lte: filters.maxProtein };
    }
    if (filters?.minCalories !== undefined) {
      mealWhere.calories = { ...mealWhere.calories, gte: filters.minCalories };
    }
    if (filters?.maxCalories !== undefined) {
      mealWhere.calories = { ...mealWhere.calories, lte: filters.maxCalories };
    }
    if (filters?.minCarbs !== undefined) {
      mealWhere.carbs = { ...mealWhere.carbs, gte: filters.minCarbs };
    }
    if (filters?.maxCarbs !== undefined) {
      mealWhere.carbs = { ...mealWhere.carbs, lte: filters.maxCarbs };
    }
    if (filters?.minFat !== undefined) {
      mealWhere.fat = { ...mealWhere.fat, gte: filters.minFat };
    }
    if (filters?.maxFat !== undefined) {
      mealWhere.fat = { ...mealWhere.fat, lte: filters.maxFat };
    }
    if (filters?.isVegetarian) {
      mealWhere.isVegetarian = true;
    }
    if (filters?.isVegan) {
      mealWhere.isVegan = true;
    }
    if (filters?.isGlutenFree) {
      mealWhere.isGlutenFree = true;
    }
    if (filters?.maxSpiceLevel !== undefined) {
      mealWhere.spiceLevel = { lte: filters.maxSpiceLevel };
    }
    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      mealWhere.categoryId = { in: filters.categoryIds };
    }

    const hasNutritionalFilters =
      filters?.minProtein !== undefined ||
      filters?.maxProtein !== undefined ||
      filters?.minCalories !== undefined ||
      filters?.maxCalories !== undefined ||
      filters?.minCarbs !== undefined ||
      filters?.maxCarbs !== undefined ||
      filters?.minFat !== undefined ||
      filters?.maxFat !== undefined ||
      filters?.isVegetarian ||
      filters?.isVegan ||
      filters?.isGlutenFree ||
      filters?.maxSpiceLevel !== undefined;

    if (filters?.minPrice !== undefined) {
      mealWhere.basePrice = { ...mealWhere.basePrice, gte: filters.minPrice };
    }
    if (filters?.maxPrice !== undefined) {
      mealWhere.basePrice = { ...mealWhere.basePrice, lte: filters.maxPrice };
    }

    // Build restaurant where clause
    const restaurantWhere: any = {
      isActive: true,
      status: "APPROVED",
    };

    if (filters?.query) {
      restaurantWhere.OR = [
        { name: { contains: filters.query, mode: "insensitive" } },
        {
          meals: {
            some: {
              name: { contains: filters.query, mode: "insensitive" },
              isAvailable: true,
            },
          },
        },
      ];
    }

    if (filters?.cuisineTypeIds && filters.cuisineTypeIds.length > 0) {
      restaurantWhere.cuisineTypes = {
        some: { id: { in: filters.cuisineTypeIds } },
      };
    }

    if (filters?.tagIds && filters.tagIds.length > 0) {
      restaurantWhere.tags = {
        some: { id: { in: filters.tagIds } },
      };
    }

    if (filters?.city) {
      restaurantWhere.locations = {
        some: {
          city: { contains: filters.city, mode: "insensitive" },
          isActive: true,
        },
      };
    }

    if (filters?.maxDeliveryFee !== undefined) {
      restaurantWhere.locations = {
        some: {
          ...(restaurantWhere.locations?.some ?? {}),
          deliveryFee: { lte: filters.maxDeliveryFee },
          isActive: true,
        },
      };
    }

    if (filters?.maxMinOrderValue !== undefined) {
      restaurantWhere.locations = {
        some: {
          ...(restaurantWhere.locations?.some ?? {}),
          minOrderValue: { lte: filters.maxMinOrderValue },
          isActive: true,
        },
      };
    }

    if (filters?.freeDeliveryOnly) {
      restaurantWhere.locations = {
        some: {
          ...(restaurantWhere.locations?.some ?? {}),
          deliveryFee: { lte: 0 },
          isActive: true,
        },
      };
    }

    // Restaurant mode should be driven by restaurant/location attributes only.

    // Fetch restaurants
    const restaurants = await db.restaurant.findMany({
      where: restaurantWhere,
      include: {
        locations: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            deliveryRadius: true,
            deliveryFee: true,
            minOrderValue: true,
            latitude: true,
            longitude: true,
          },
        },
        cuisineTypes: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
        reviews: {
          where: { isVisible: true },
          select: { rating: true },
        },
        _count: {
          select: {
            reviews: { where: { isVisible: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(
      `[Storefront] Found ${restaurants.length} restaurants with filters:`,
      JSON.stringify(filters || "none"),
    );

    // Calculate average rating per restaurant row
    const restaurantRows = restaurants.map((restaurant) => {
      const avgRating =
        restaurant.reviews.length > 0
          ? restaurant.reviews.reduce((sum, r) => sum + r.rating, 0) /
            restaurant.reviews.length
          : 0;

      return {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logoUrl,
        coverImageUrl: restaurant.coverImageUrl,
        bio: restaurant.bio,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: restaurant._count.reviews,
        locations: restaurant.locations.map((l) => ({
          ...l,
          deliveryFee: Number(l.deliveryFee),
          minOrderValue: Number(l.minOrderValue),
        })),
        cuisineTypes: restaurant.cuisineTypes,
        tags: restaurant.tags,
      };
    });

    const normalizeRestaurantName = (name: string) =>
      name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    // Merge chain duplicates by normalized name (e.g. many "McDonald's" -> one row).
    const groupedRestaurantsMap = new Map<
      string,
      (typeof restaurantRows)[number]
    >();
    for (const row of restaurantRows) {
      const key = normalizeRestaurantName(row.name);
      const existing = groupedRestaurantsMap.get(key);

      if (!existing) {
        groupedRestaurantsMap.set(key, row);
        continue;
      }

      const mergedLocations = [
        ...existing.locations,
        ...row.locations.filter(
          (loc) => !existing.locations.some((eLoc) => eLoc.id === loc.id),
        ),
      ];

      const mergedCuisineTypes = [
        ...existing.cuisineTypes,
        ...row.cuisineTypes.filter(
          (c) => !existing.cuisineTypes.some((e) => e.id === c.id),
        ),
      ];

      const mergedTags = [
        ...existing.tags,
        ...row.tags.filter((t) => !existing.tags.some((e) => e.id === t.id)),
      ];

      const totalReviews = existing.reviewCount + row.reviewCount;
      const avgRating =
        totalReviews > 0
          ? (existing.avgRating * existing.reviewCount +
              row.avgRating * row.reviewCount) /
            totalReviews
          : 0;

      groupedRestaurantsMap.set(key, {
        ...existing,
        logoUrl: existing.logoUrl ?? row.logoUrl,
        coverImageUrl: existing.coverImageUrl ?? row.coverImageUrl,
        locations: mergedLocations,
        cuisineTypes: mergedCuisineTypes,
        tags: mergedTags,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: totalReviews,
      });
    }

    let processedRestaurants = [...groupedRestaurantsMap.values()];

    // Filter by rating
    if (filters?.minRating && filters.minRating > 0) {
      processedRestaurants = processedRestaurants.filter(
        (r) => r.avgRating >= filters.minRating!,
      );
    }

    if (filters?.multiLocationOnly) {
      processedRestaurants = processedRestaurants.filter(
        (r) => r.locations.length > 1,
      );
    }

    const minDeliveryFee = (
      restaurant: (typeof processedRestaurants)[number],
    ) =>
      restaurant.locations.length > 0
        ? Math.min(...restaurant.locations.map((l) => l.deliveryFee))
        : Number.POSITIVE_INFINITY;

    const minOrderValue = (
      restaurant: (typeof processedRestaurants)[number],
    ) =>
      restaurant.locations.length > 0
        ? Math.min(...restaurant.locations.map((l) => l.minOrderValue))
        : Number.POSITIVE_INFINITY;

    switch (filters?.sortBy) {
      case "rating_desc":
        processedRestaurants.sort((a, b) => b.avgRating - a.avgRating);
        break;
      case "rating_asc":
        processedRestaurants.sort((a, b) => a.avgRating - b.avgRating);
        break;
      case "name_asc":
        processedRestaurants.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "delivery_fee_asc":
        processedRestaurants.sort(
          (a, b) => minDeliveryFee(a) - minDeliveryFee(b),
        );
        break;
      case "min_order_asc":
        processedRestaurants.sort(
          (a, b) => minOrderValue(a) - minOrderValue(b),
        );
        break;
      case "locations_desc":
        processedRestaurants.sort(
          (a, b) => b.locations.length - a.locations.length,
        );
        break;
      default:
        processedRestaurants.sort((a, b) => b.avgRating - a.avgRating);
        break;
    }

    const restaurantsTotal = processedRestaurants.length;
    const restaurantsTotalPages = Math.max(
      1,
      Math.ceil(restaurantsTotal / perPage),
    );
    const restaurantsPage = Math.min(page, restaurantsTotalPages);
    const restaurantsStart = (restaurantsPage - 1) * perPage;
    const paginatedRestaurants = processedRestaurants.slice(
      restaurantsStart,
      restaurantsStart + perPage,
    );

    // Global meals search (independent of restaurant listing mode).
    const mealSearchWhere: any = {
      ...mealWhere,
      restaurant: {
        isActive: true,
        status: "APPROVED",
      },
    };

    if (filters?.query) {
      mealSearchWhere.OR = [
        { name: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } },
        {
          restaurant: {
            name: { contains: filters.query, mode: "insensitive" },
          },
        },
      ];
    }

    const searchMeals = await db.meal.findMany({
      where: mealSearchWhere,
      include: {
        restaurant: {
          include: {
            locations: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                city: true,
                address: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const sortedSearchMeals = [...searchMeals];
    switch (filters?.sortBy) {
      case "price_asc":
        sortedSearchMeals.sort(
          (a, b) => Number(a.basePrice) - Number(b.basePrice),
        );
        break;
      case "price_desc":
        sortedSearchMeals.sort(
          (a, b) => Number(b.basePrice) - Number(a.basePrice),
        );
        break;
      case "calories_asc":
        sortedSearchMeals.sort(
          (a, b) =>
            (a.calories ?? Number.POSITIVE_INFINITY) -
            (b.calories ?? Number.POSITIVE_INFINITY),
        );
        break;
      case "calories_desc":
        sortedSearchMeals.sort(
          (a, b) =>
            (b.calories ?? Number.NEGATIVE_INFINITY) -
            (a.calories ?? Number.NEGATIVE_INFINITY),
        );
        break;
      case "protein_desc":
        sortedSearchMeals.sort(
          (a, b) => Number(b.protein ?? 0) - Number(a.protein ?? 0),
        );
        break;
      case "name_asc":
        sortedSearchMeals.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep newest by createdAt from DB query.
        break;
    }

    const mealsTotal = sortedSearchMeals.length;
    const mealsTotalPages = Math.max(1, Math.ceil(mealsTotal / perPage));
    const mealsPage = Math.min(page, mealsTotalPages);
    const mealsStart = (mealsPage - 1) * perPage;
    const paginatedSearchMeals = sortedSearchMeals.slice(
      mealsStart,
      mealsStart + perPage,
    );

    // Fetch cuisine types for filter options
    const cuisineTypes = await db.cuisineType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    // Fetch restaurant tags for filter options
    const restaurantTags = await db.restaurantTag.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    const mealCategories = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    });

    // Fetch recent orders for logged-in users
    let recentOrders: any[] = [];
    if (session?.user?.id) {
      recentOrders = await db.order.findMany({
        where: { userId: session.user.id },
        include: {
          location: {
            select: {
              restaurant: {
                select: {
                  name: true,
                  slug: true,
                  logoUrl: true,
                },
              },
            },
          },
          items: {
            include: {
              meal: { select: { name: true, imageUrl: true } },
            },
            take: 3,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
    }

    // Get user's saved addresses for logged-in users
    let userAddresses: any[] = [];
    if (session?.user?.id) {
      userAddresses = await db.address.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });
    }

    // Trending meals
    const trendingMeals = await db.meal.findMany({
      where: {
        isAvailable: true,
        approvalStatus: "APPROVED",
        restaurant: {
          isActive: true,
          status: "APPROVED",
        },
        ...(hasNutritionalFilters ? mealWhere : {}),
      },
      include: {
        restaurant: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      success: true,
      data: {
        restaurants: paginatedRestaurants,
        cuisineTypes,
        restaurantTags,
        mealCategories,
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          totalPrice: Number(order.totalPrice),
          status: order.status,
          createdAt: order.createdAt.toISOString(),
          restaurantName: order.location.restaurant.name,
          restaurantSlug: order.location.restaurant.slug,
          restaurantLogoUrl: order.location.restaurant.logoUrl,
          items: order.items.map((item: any) => ({
            name: item.meal.name,
            imageUrl: item.meal.imageUrl,
            quantity: item.quantity,
          })),
        })),
        userAddresses: userAddresses.map((addr) => ({
          id: addr.id,
          street: addr.street,
          city: addr.city,
          postalCode: addr.postalCode,
          isDefault: addr.isDefault,
        })),
        trendingMeals: trendingMeals.map((meal) => ({
          id: meal.id,
          name: meal.name,
          slug: meal.slug,
          imageUrl: meal.imageUrl,
          basePrice: Number(meal.basePrice),
          calories: meal.calories,
          protein: meal.protein ? Number(meal.protein) : null,
          isVegetarian: meal.isVegetarian,
          isVegan: meal.isVegan,
          restaurantName: meal.restaurant.name,
          restaurantSlug: meal.restaurant.slug,
        })),
        searchMeals: paginatedSearchMeals.map((meal) => ({
          id: meal.id,
          name: meal.name,
          slug: meal.slug,
          description: meal.description,
          imageUrl: meal.imageUrl,
          basePrice: Number(meal.basePrice),
          calories: meal.calories,
          protein: meal.protein ? Number(meal.protein) : null,
          carbs: meal.carbs ? Number(meal.carbs) : null,
          fat: meal.fat ? Number(meal.fat) : null,
          isVegetarian: meal.isVegetarian,
          isVegan: meal.isVegan,
          spiceLevel: meal.spiceLevel,
          category: meal.category,
          restaurantName: meal.restaurant.name,
          restaurantSlug: meal.restaurant.slug,
          locations: meal.restaurant.locations,
        })),
        restaurantPagination: {
          page: restaurantsPage,
          perPage,
          total: restaurantsTotal,
          totalPages: restaurantsTotalPages,
        },
        mealPagination: {
          page: mealsPage,
          perPage,
          total: mealsTotal,
          totalPages: mealsTotalPages,
        },
        mode,
        isLoggedIn: !!session?.user,
      },
    };
  } catch (error) {
    console.error("Error fetching storefront data:", error);
    return { success: false, error: "Nie udało się pobrać danych" };
  }
}

// ============================================
// GET RESTAURANT DETAIL WITH NUTRITIONAL FILTERING
// ============================================

export async function getFilteredMeals(
  restaurantId: string,
  filters?: {
    minProtein?: number;
    maxProtein?: number;
    minCalories?: number;
    maxCalories?: number;
    minCarbs?: number;
    maxCarbs?: number;
    minFat?: number;
    maxFat?: number;
    isVegetarian?: boolean;
    isVegan?: boolean;
    maxSpiceLevel?: number;
    categoryId?: string;
    query?: string;
  },
) {
  try {
    const where: any = {
      restaurantId,
      isAvailable: true,
      approvalStatus: "APPROVED",
    };

    if (filters?.minProtein !== undefined) {
      where.protein = { ...where.protein, gte: filters.minProtein };
    }
    if (filters?.maxProtein !== undefined) {
      where.protein = { ...where.protein, lte: filters.maxProtein };
    }
    if (filters?.minCalories !== undefined) {
      where.calories = { ...where.calories, gte: filters.minCalories };
    }
    if (filters?.maxCalories !== undefined) {
      where.calories = { ...where.calories, lte: filters.maxCalories };
    }
    if (filters?.minCarbs !== undefined) {
      where.carbs = { ...where.carbs, gte: filters.minCarbs };
    }
    if (filters?.maxCarbs !== undefined) {
      where.carbs = { ...where.carbs, lte: filters.maxCarbs };
    }
    if (filters?.minFat !== undefined) {
      where.fat = { ...where.fat, gte: filters.minFat };
    }
    if (filters?.maxFat !== undefined) {
      where.fat = { ...where.fat, lte: filters.maxFat };
    }
    if (filters?.isVegetarian) {
      where.isVegetarian = true;
    }
    if (filters?.isVegan) {
      where.isVegan = true;
    }
    if (filters?.maxSpiceLevel !== undefined) {
      where.spiceLevel = { lte: filters.maxSpiceLevel };
    }
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.query) {
      where.OR = [
        { name: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } },
      ];
    }

    const meals = await db.meal.findMany({
      where,
      include: {
        category: true,
        variants: {
          where: { isAvailable: true },
          orderBy: { priceModifier: "asc" },
        },
        addons: {
          where: { isAvailable: true },
          orderBy: { price: "asc" },
        },
        locations: {
          where: { isAvailable: true },
          select: { locationId: true },
        },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    });

    return {
      success: true,
      data: meals.map((meal) => ({
        ...meal,
        basePrice: Number(meal.basePrice),
        protein: meal.protein ? Number(meal.protein) : null,
        carbs: meal.carbs ? Number(meal.carbs) : null,
        fat: meal.fat ? Number(meal.fat) : null,
        variants: meal.variants.map((v) => ({
          ...v,
          priceModifier: Number(v.priceModifier),
        })),
        addons: meal.addons.map((a) => ({
          ...a,
          price: Number(a.price),
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching filtered meals:", error);
    return { success: false, error: "Nie udało się pobrać dań" };
  }
}

type DayHours = {
  open?: string;
  close?: string;
  closed?: boolean;
};

function getOpenStatus(
  isAllDay: boolean,
  openingHours: unknown,
): { isOpenNow: boolean; statusLabel: string } {
  if (isAllDay) {
    return { isOpenNow: true, statusLabel: "Otwarte 24h" };
  }

  if (!openingHours || typeof openingHours !== "object") {
    return { isOpenNow: false, statusLabel: "Brak danych o godzinach" };
  }

  const now = new Date();
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const;
  const dayKey = days[now.getDay()];
  const todaysHours = (openingHours as Record<string, DayHours | undefined>)[
    dayKey
  ];

  if (!todaysHours) {
    return { isOpenNow: false, statusLabel: "Brak danych o godzinach" };
  }

  if (todaysHours.closed) {
    return { isOpenNow: false, statusLabel: "Dziś zamknięte" };
  }

  if (!todaysHours.open || !todaysHours.close) {
    return { isOpenNow: false, statusLabel: "Brak danych o godzinach" };
  }

  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  const isOpenNow =
    currentTime >= todaysHours.open && currentTime <= todaysHours.close;

  return {
    isOpenNow,
    statusLabel: isOpenNow
      ? `Otwarte do ${todaysHours.close}`
      : `Dziś: ${todaysHours.open}-${todaysHours.close}`,
  };
}

export async function getRestaurantMapData(): Promise<{
  success: boolean;
  data?: RestaurantMapLocation[];
  error?: string;
}> {
  try {
    const locations = await db.location.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
        restaurant: {
          isActive: true,
          status: "APPROVED",
        },
      },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        latitude: true,
        longitude: true,
        isAllDay: true,
        openingHours: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
      orderBy: [{ city: "asc" }, { name: "asc" }],
    });

    const data: RestaurantMapLocation[] = locations.map((location) => {
      const status = getOpenStatus(location.isAllDay, location.openingHours);
      return {
        id: location.id,
        name: location.name,
        city: location.city,
        address: location.address,
        latitude: location.latitude as number,
        longitude: location.longitude as number,
        isOpenNow: status.isOpenNow,
        statusLabel: status.statusLabel,
        restaurant: location.restaurant,
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching restaurant map data:", error);
    return {
      success: false,
      error: "Nie udało się pobrać danych mapy restauracji",
    };
  }
}
