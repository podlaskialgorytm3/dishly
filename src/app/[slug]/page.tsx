import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RestaurantPage from "./RestaurantPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Najpierw sprawdź czy to restauracja
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { name: true, bio: true },
  });

  if (restaurant) {
    return {
      title: restaurant.name,
      description: restaurant.bio || `Menu restauracji ${restaurant.name}`,
    };
  }

  // Jeśli nie restauracja, sprawdź strony CMS
  const page = await db.page.findUnique({
    where: { slug },
  });

  if (!page) {
    return {
      title: "Strona nie znaleziona",
    };
  }

  return {
    title: page.title,
    description: page.metaDescription || undefined,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;

  // Najpierw sprawdź czy to restauracja
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    include: {
      locations: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          city: true,
          address: true,
          phone: true,
          openingHours: true,
          deliveryRadius: true,
          deliveryFee: true,
          minOrderValue: true,
        },
      },
      meals: {
        where: { isAvailable: true },
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
      },
      cuisineTypes: true,
      tags: true,
    },
  });

  if (restaurant && restaurant.status === "APPROVED" && restaurant.isActive) {
    // Serializuj dane dla klienta
    const serializedRestaurant = {
      ...restaurant,
      locations: restaurant.locations.map((loc) => ({
        ...loc,
        deliveryFee: Number(loc.deliveryFee),
        minOrderValue: Number(loc.minOrderValue),
      })),
      meals: restaurant.meals.map((meal) => ({
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

    return <RestaurantPage restaurant={serializedRestaurant} />;
  }

  // Jeśli nie restauracja, sprawdź strony CMS
  const page = await db.page.findUnique({
    where: { slug },
  });

  // Jeśli strona nie istnieje lub nie jest opublikowana, pokaż 404
  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6 text-[#1F1F1F]">{page.title}</h1>

        <div
          className="dynamic-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  );
}

// Generuj statyczne ścieżki dla opublikowanych stron i zatwierdzonych restauracji
export async function generateStaticParams() {
  try {
    const [pages, restaurants] = await Promise.all([
      db.page.findMany({
        where: { isPublished: true },
        select: { slug: true },
      }),
      db.restaurant.findMany({
        where: { status: "APPROVED", isActive: true },
        select: { slug: true },
      }),
    ]);

    return [
      ...pages.map((page) => ({ slug: page.slug })),
      ...restaurants.map((restaurant) => ({ slug: restaurant.slug })),
    ];
  } catch (error) {
    // W przypadku błędu połączenia z bazą, zwróć pustą tablicę
    // Strony będą generowane dynamicznie
    console.warn("Could not generate static params:", error);
    return [];
  }
}
