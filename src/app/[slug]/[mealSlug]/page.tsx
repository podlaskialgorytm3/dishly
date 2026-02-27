import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MealDetailPage from "./MealDetailPage";

interface PageProps {
  params: Promise<{ slug: string; mealSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, mealSlug } = await params;

  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });

  if (!restaurant) {
    return { title: "Nie znaleziono" };
  }

  const meal = await db.meal.findFirst({
    where: {
      restaurantId: restaurant.id,
      slug: mealSlug,
    },
    select: {
      name: true,
      description: true,
      imageUrl: true,
    },
  });

  if (!meal) {
    return { title: "Nie znaleziono" };
  }

  return {
    title: `${meal.name} | ${restaurant.name}`,
    description:
      meal.description || `${meal.name} - zamów online w ${restaurant.name}`,
    openGraph: {
      title: meal.name,
      description: meal.description || undefined,
      images: meal.imageUrl ? [meal.imageUrl] : undefined,
    },
  };
}

export default async function MealPage({ params }: PageProps) {
  const { slug, mealSlug } = await params;

  // Pobierz restaurację
  const restaurant = await db.restaurant.findUnique({
    where: { slug, status: "APPROVED", isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!restaurant) {
    notFound();
  }

  // Pobierz posiłek z relacjami
  const meal = await db.meal.findFirst({
    where: {
      restaurantId: restaurant.id,
      slug: mealSlug,
      isAvailable: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        where: { isAvailable: true },
        orderBy: { priceModifier: "asc" },
      },
      addons: {
        where: { isAvailable: true },
        orderBy: { price: "asc" },
      },
    },
  });

  if (!meal) {
    notFound();
  }

  // Serializuj dane dla klienta
  const serializedMeal = {
    id: meal.id,
    name: meal.name,
    slug: meal.slug,
    description: meal.description,
    imageUrl: meal.imageUrl,
    basePrice: Number(meal.basePrice),
    preparationTime: meal.preparationTime,
    weight: meal.weight,
    calories: meal.calories,
    protein: meal.protein ? Number(meal.protein) : null,
    carbs: meal.carbs ? Number(meal.carbs) : null,
    fat: meal.fat ? Number(meal.fat) : null,
    spiceLevel: meal.spiceLevel,
    isVegetarian: meal.isVegetarian,
    isVegan: meal.isVegan,
    isGlutenFree: meal.isGlutenFree,
    category: meal.category,
    variants: meal.variants.map((v) => ({
      id: v.id,
      name: v.name,
      priceModifier: Number(v.priceModifier),
      isAvailable: v.isAvailable,
    })),
    addons: meal.addons.map((a) => ({
      id: a.id,
      name: a.name,
      price: Number(a.price),
      isRequired: a.isRequired,
      maxQuantity: a.maxQuantity,
      isAvailable: a.isAvailable,
    })),
    restaurant: {
      name: restaurant.name,
      slug: restaurant.slug,
    },
  };

  return <MealDetailPage meal={serializedMeal} />;
}

// Generuj statyczne ścieżki dla posiłków
export async function generateStaticParams() {
  const meals = await db.meal.findMany({
    where: {
      isAvailable: true,
    },
    select: {
      slug: true,
      restaurant: {
        select: { slug: true, status: true, isActive: true },
      },
    },
  });

  return meals
    .filter(
      (meal) =>
        meal.restaurant.status === "APPROVED" && meal.restaurant.isActive,
    )
    .map((meal) => ({
      slug: meal.restaurant.slug,
      mealSlug: meal.slug,
    }));
}
