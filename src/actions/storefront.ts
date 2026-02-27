"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ============================================
// TYPES
// ============================================

export type RestaurantFilters = {
  query?: string;
  city?: string;
  minRating?: number;
  maxAvgPrice?: number;
  cuisineTypeIds?: string[];
  tagIds?: string[];
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
  maxSpiceLevel?: number;
};

// ============================================
// GET STOREFRONT DATA
// ============================================

export async function getStorefrontData(filters?: RestaurantFilters) {
  try {
    const session = await auth();

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
    if (filters?.maxSpiceLevel !== undefined) {
      mealWhere.spiceLevel = { lte: filters.maxSpiceLevel };
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
      filters?.maxSpiceLevel !== undefined;

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

    // If nutritional filters are active, only include restaurants that have matching meals
    if (hasNutritionalFilters) {
      restaurantWhere.meals = {
        some: mealWhere,
      };
    }

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
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating and apply rating filter
    let processedRestaurants = restaurants.map((restaurant) => {
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

    // Filter by rating
    if (filters?.minRating && filters.minRating > 0) {
      processedRestaurants = processedRestaurants.filter(
        (r) => r.avgRating >= filters.minRating!,
      );
    }

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
        restaurants: processedRestaurants,
        cuisineTypes,
        restaurantTags,
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
