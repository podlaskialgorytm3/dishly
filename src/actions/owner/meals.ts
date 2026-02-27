"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getOwnerRestaurant() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized");
  }

  const restaurant = await db.restaurant.findFirst({
    where: { ownerId: session.user.id },
    include: {
      subscriptions: {
        where: { isActive: true },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      locations: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  return restaurant;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[ąa]/g, "a")
    .replace(/[ćc]/g, "c")
    .replace(/[ęe]/g, "e")
    .replace(/[łl]/g, "l")
    .replace(/[ńn]/g, "n")
    .replace(/[óo]/g, "o")
    .replace(/[śs]/g, "s")
    .replace(/[żź]/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================
// TYPY
// ============================================

export type MealVariantInput = {
  name: string;
  priceModifier: number;
  isAvailable?: boolean;
};

export type MealAddonInput = {
  name: string;
  price: number;
  isRequired?: boolean;
  maxQuantity?: number;
  isAvailable?: boolean;
};

export type MealInput = {
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId: string;
  basePrice: number;
  preparationTime: number;
  weight?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  spiceLevel?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isAvailable?: boolean;
  locationIds?: string[]; // Lokalizacje do których przypisać danie
  variants?: MealVariantInput[];
  addons?: MealAddonInput[];
};

// ============================================
// POBIERANIE DANYCH
// ============================================

export async function getMeals() {
  const restaurant = await getOwnerRestaurant();

  const meals = await db.meal.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      category: true,
      variants: {
        orderBy: { createdAt: "asc" },
      },
      addons: {
        orderBy: { createdAt: "asc" },
      },
      locations: {
        include: {
          location: {
            select: { id: true, name: true, city: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serializacja Decimal na number
  const serializedMeals = meals.map((meal) => ({
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
  }));

  // Oblicz statystyki limitów
  const activeSub = restaurant.subscriptions[0];
  const maxMeals = activeSub?.plan?.maxMeals ?? 50;
  const currentMealsCount = meals.length;

  return {
    meals: serializedMeals,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      locations: restaurant.locations.map((loc) => ({
        id: loc.id,
        name: loc.name,
        city: loc.city,
      })),
    },
    limits: {
      maxMeals,
      currentMealsCount,
      canAddMore: currentMealsCount < maxMeals,
      remainingSlots: maxMeals - currentMealsCount,
    },
  };
}

export async function getMeal(id: string) {
  const restaurant = await getOwnerRestaurant();

  const meal = await db.meal.findFirst({
    where: { id, restaurantId: restaurant.id },
    include: {
      category: true,
      variants: {
        orderBy: { createdAt: "asc" },
      },
      addons: {
        orderBy: { createdAt: "asc" },
      },
      locations: {
        include: {
          location: {
            select: { id: true, name: true, city: true },
          },
        },
      },
    },
  });

  if (!meal) {
    throw new Error("Meal not found");
  }

  return {
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
    locationIds: meal.locations.map((ml) => ml.locationId),
  };
}

export async function getCategories() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return categories;
}

// ============================================
// TWORZENIE DANIA
// ============================================

export async function createMeal(data: MealInput) {
  const restaurant = await getOwnerRestaurant();

  // Sprawdź limit subskrypcji
  const activeSub = restaurant.subscriptions[0];
  const maxMeals = activeSub?.plan?.maxMeals ?? 50;

  const existingCount = await db.meal.count({
    where: { restaurantId: restaurant.id },
  });

  if (existingCount >= maxMeals) {
    throw new Error(
      `Twój plan subskrypcji pozwala na maksymalnie ${maxMeals} ${maxMeals === 1 ? "danie" : "dań"}. Ulepsz plan, aby dodać więcej.`,
    );
  }

  // Walidacja kategorii
  const category = await db.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new Error("Wybrana kategoria nie istnieje");
  }

  // Generuj unikalny slug
  let slug = generateSlug(data.name);
  const existingSlug = await db.meal.findFirst({
    where: { restaurantId: restaurant.id, slug },
  });

  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  // Walidacja lokalizacji
  const validLocationIds =
    data.locationIds?.filter((locId) =>
      restaurant.locations.some((loc) => loc.id === locId),
    ) ?? [];

  // Stwórz danie wraz z wariantami, dodatkami i przypisaniami do lokalizacji
  const meal = await db.meal.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: data.categoryId,
      name: data.name,
      slug,
      description: data.description,
      imageUrl: data.imageUrl,
      basePrice: data.basePrice,
      preparationTime: data.preparationTime,
      weight: data.weight,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      spiceLevel: data.spiceLevel ?? 0,
      isVegetarian: data.isVegetarian ?? false,
      isVegan: data.isVegan ?? false,
      isGlutenFree: data.isGlutenFree ?? false,
      isAvailable: data.isAvailable ?? true,
      variants: {
        create:
          data.variants?.map((v) => ({
            name: v.name,
            priceModifier: v.priceModifier,
            isAvailable: v.isAvailable ?? true,
          })) ?? [],
      },
      addons: {
        create:
          data.addons?.map((a) => ({
            name: a.name,
            price: a.price,
            isRequired: a.isRequired ?? false,
            maxQuantity: a.maxQuantity ?? 1,
            isAvailable: a.isAvailable ?? true,
          })) ?? [],
      },
      locations: {
        create: validLocationIds.map((locationId) => ({
          locationId,
          isAvailable: true,
        })),
      },
    },
    include: {
      category: true,
      variants: true,
      addons: true,
      locations: {
        include: {
          location: {
            select: { id: true, name: true, city: true },
          },
        },
      },
    },
  });

  revalidatePath("/dashboard/owner/menu");
  return { success: true, meal };
}

// ============================================
// AKTUALIZACJA DANIA
// ============================================

export async function updateMeal(id: string, data: Partial<MealInput>) {
  const restaurant = await getOwnerRestaurant();

  // Sprawdź czy danie należy do restauracji
  const existingMeal = await db.meal.findFirst({
    where: { id, restaurantId: restaurant.id },
    include: { variants: true, addons: true, locations: true },
  });

  if (!existingMeal) {
    throw new Error("Meal not found");
  }

  // Walidacja kategorii jeśli zmieniana
  if (data.categoryId) {
    const category = await db.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new Error("Wybrana kategoria nie istnieje");
    }
  }

  // Generuj nowy slug jeśli nazwa się zmienia
  let slug = existingMeal.slug;
  if (data.name && data.name !== existingMeal.name) {
    slug = generateSlug(data.name);
    const existingSlug = await db.meal.findFirst({
      where: { restaurantId: restaurant.id, slug, id: { not: id } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  // Aktualizuj danie
  await db.meal.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.name ? slug : undefined,
      description: data.description,
      imageUrl: data.imageUrl,
      categoryId: data.categoryId,
      basePrice: data.basePrice,
      preparationTime: data.preparationTime,
      weight: data.weight,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      spiceLevel: data.spiceLevel,
      isVegetarian: data.isVegetarian,
      isVegan: data.isVegan,
      isGlutenFree: data.isGlutenFree,
      isAvailable: data.isAvailable,
    },
  });

  // Aktualizuj warianty (usuń stare, dodaj nowe)
  if (data.variants !== undefined) {
    await db.mealVariant.deleteMany({ where: { mealId: id } });
    if (data.variants.length > 0) {
      await db.mealVariant.createMany({
        data: data.variants.map((v) => ({
          mealId: id,
          name: v.name,
          priceModifier: v.priceModifier,
          isAvailable: v.isAvailable ?? true,
        })),
      });
    }
  }

  // Aktualizuj dodatki (usuń stare, dodaj nowe)
  if (data.addons !== undefined) {
    await db.mealAddon.deleteMany({ where: { mealId: id } });
    if (data.addons.length > 0) {
      await db.mealAddon.createMany({
        data: data.addons.map((a) => ({
          mealId: id,
          name: a.name,
          price: a.price,
          isRequired: a.isRequired ?? false,
          maxQuantity: a.maxQuantity ?? 1,
          isAvailable: a.isAvailable ?? true,
        })),
      });
    }
  }

  // Aktualizuj przypisania do lokalizacji
  if (data.locationIds !== undefined) {
    const validLocationIds = data.locationIds.filter((locId) =>
      restaurant.locations.some((loc) => loc.id === locId),
    );

    await db.mealLocation.deleteMany({ where: { mealId: id } });
    if (validLocationIds.length > 0) {
      await db.mealLocation.createMany({
        data: validLocationIds.map((locationId) => ({
          mealId: id,
          locationId,
          isAvailable: true,
        })),
      });
    }
  }

  revalidatePath("/dashboard/owner/menu");
  return { success: true };
}

// ============================================
// SZYBKIE PRZEŁĄCZANIE DOSTĘPNOŚCI
// ============================================

export async function toggleMealAvailability(id: string) {
  const restaurant = await getOwnerRestaurant();

  const meal = await db.meal.findFirst({
    where: { id, restaurantId: restaurant.id },
  });

  if (!meal) {
    throw new Error("Meal not found");
  }

  await db.meal.update({
    where: { id },
    data: { isAvailable: !meal.isAvailable },
  });

  revalidatePath("/dashboard/owner/menu");
  return { success: true, isAvailable: !meal.isAvailable };
}

export async function toggleMealLocationAvailability(
  mealId: string,
  locationId: string,
) {
  const restaurant = await getOwnerRestaurant();

  // Sprawdź czy danie należy do restauracji
  const meal = await db.meal.findFirst({
    where: { id: mealId, restaurantId: restaurant.id },
  });

  if (!meal) {
    throw new Error("Meal not found");
  }

  // Sprawdź czy lokalizacja należy do restauracji
  const validLocation = restaurant.locations.some(
    (loc) => loc.id === locationId,
  );
  if (!validLocation) {
    throw new Error("Location not found");
  }

  const mealLocation = await db.mealLocation.findUnique({
    where: { mealId_locationId: { mealId, locationId } },
  });

  if (!mealLocation) {
    // Utwórz przypisanie jeśli nie istnieje
    await db.mealLocation.create({
      data: { mealId, locationId, isAvailable: true },
    });
    revalidatePath("/dashboard/owner/menu");
    return { success: true, isAvailable: true };
  }

  // Przełącz dostępność
  await db.mealLocation.update({
    where: { mealId_locationId: { mealId, locationId } },
    data: { isAvailable: !mealLocation.isAvailable },
  });

  revalidatePath("/dashboard/owner/menu");
  return { success: true, isAvailable: !mealLocation.isAvailable };
}

// ============================================
// USUWANIE DANIA
// ============================================

export async function deleteMeal(id: string) {
  const restaurant = await getOwnerRestaurant();

  // Sprawdź czy danie należy do restauracji
  const meal = await db.meal.findFirst({
    where: { id, restaurantId: restaurant.id },
  });

  if (!meal) {
    throw new Error("Meal not found");
  }

  // Sprawdź czy danie nie ma powiązanych zamówień
  const ordersCount = await db.orderItem.count({
    where: { mealId: id },
  });

  if (ordersCount > 0) {
    throw new Error(
      "Nie można usunąć dania, które jest powiązane z zamówieniami. Zamiast tego dezaktywuj je.",
    );
  }

  await db.meal.delete({ where: { id } });

  revalidatePath("/dashboard/owner/menu");
  return { success: true };
}

// ============================================
// WARIANTY
// ============================================

export async function addMealVariant(mealId: string, data: MealVariantInput) {
  const restaurant = await getOwnerRestaurant();

  const meal = await db.meal.findFirst({
    where: { id: mealId, restaurantId: restaurant.id },
  });

  if (!meal) {
    throw new Error("Meal not found");
  }

  const variant = await db.mealVariant.create({
    data: {
      mealId,
      name: data.name,
      priceModifier: data.priceModifier,
      isAvailable: data.isAvailable ?? true,
    },
  });

  revalidatePath("/dashboard/owner/menu");
  return { success: true, variant };
}

export async function updateMealVariant(
  id: string,
  data: Partial<MealVariantInput>,
) {
  const restaurant = await getOwnerRestaurant();

  const variant = await db.mealVariant.findFirst({
    where: { id },
    include: { meal: true },
  });

  if (!variant || variant.meal.restaurantId !== restaurant.id) {
    throw new Error("Variant not found");
  }

  await db.mealVariant.update({
    where: { id },
    data: {
      name: data.name,
      priceModifier: data.priceModifier,
      isAvailable: data.isAvailable,
    },
  });

  revalidatePath("/dashboard/owner/menu");
  return { success: true };
}

export async function deleteMealVariant(id: string) {
  const restaurant = await getOwnerRestaurant();

  const variant = await db.mealVariant.findFirst({
    where: { id },
    include: { meal: true },
  });

  if (!variant || variant.meal.restaurantId !== restaurant.id) {
    throw new Error("Variant not found");
  }

  await db.mealVariant.delete({ where: { id } });

  revalidatePath("/dashboard/owner/menu");
  return { success: true };
}

// ============================================
// DODATKI
// ============================================

export async function addMealAddon(mealId: string, data: MealAddonInput) {
  const restaurant = await getOwnerRestaurant();

  const meal = await db.meal.findFirst({
    where: { id: mealId, restaurantId: restaurant.id },
  });

  if (!meal) {
    throw new Error("Meal not found");
  }

  const addon = await db.mealAddon.create({
    data: {
      mealId,
      name: data.name,
      price: data.price,
      isRequired: data.isRequired ?? false,
      maxQuantity: data.maxQuantity ?? 1,
      isAvailable: data.isAvailable ?? true,
    },
  });

  revalidatePath("/dashboard/owner/menu");
  return { success: true, addon };
}

export async function updateMealAddon(
  id: string,
  data: Partial<MealAddonInput>,
) {
  const restaurant = await getOwnerRestaurant();

  const addon = await db.mealAddon.findFirst({
    where: { id },
    include: { meal: true },
  });

  if (!addon || addon.meal.restaurantId !== restaurant.id) {
    throw new Error("Addon not found");
  }

  await db.mealAddon.update({
    where: { id },
    data: {
      name: data.name,
      price: data.price,
      isRequired: data.isRequired,
      maxQuantity: data.maxQuantity,
      isAvailable: data.isAvailable,
    },
  });

  revalidatePath("/dashboard/owner/menu");
  return { success: true };
}

export async function deleteMealAddon(id: string) {
  const restaurant = await getOwnerRestaurant();

  const addon = await db.mealAddon.findFirst({
    where: { id },
    include: { meal: true },
  });

  if (!addon || addon.meal.restaurantId !== restaurant.id) {
    throw new Error("Addon not found");
  }

  await db.mealAddon.delete({ where: { id } });

  revalidatePath("/dashboard/owner/menu");
  return { success: true };
}

// ============================================
// KATEGORIE (dla admina)
// ============================================

export async function createCategory(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized - only admins can create categories");
  }

  const slug = generateSlug(data.name);

  const existingSlug = await db.category.findUnique({ where: { slug } });
  if (existingSlug) {
    throw new Error("Kategoria o takiej nazwie już istnieje");
  }

  const category = await db.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      imageUrl: data.imageUrl,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  revalidatePath("/dashboard/dictionaries");
  return { success: true, category };
}
