import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MainHeader } from "@/components/layout/MainHeader";
import { HeroSection } from "@/components/layout/HeroSection";
import { StoriesSection } from "@/components/layout/StoriesSection";
import { TrendingSection } from "@/components/layout/TrendingSection";
import { RestaurantCard } from "@/components/shared/RestaurantCard";
import { Footer } from "@/components/layout/Footer";

export default async function Home() {
  const session = await auth();

  let restaurants = [];
  let navigationPages = [];
  let meals = [];

  try {
    // Fetch restaurants with their locations
    restaurants = await db.restaurant.findMany({
      where: {
        isActive: true,
      },
      include: {
        locations: {
          where: {
            isActive: true,
          },
          take: 1,
        },
      },
      take: 12,
    });

    // Pobierz strony do wyświetlenia w nagłówku
    navigationPages = await db.page.findMany({
      where: {
        isPublished: true,
        showInHeader: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      select: {
        title: true,
        slug: true,
      },
    });

    // Pobierz posiłki do sekcji "Trendujące"
    meals = await db.meal.findMany({
      where: {
        isAvailable: true,
        restaurant: {
          isActive: true,
          status: "APPROVED",
        },
      },
      include: {
        restaurant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    // Zwróć puste dane - strona załaduje się bez treści z bazy
  }

  // Transform restaurants to stories format
  const stories = restaurants.slice(0, 8).map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    imageUrl: restaurant.logoUrl || "",
    hasPromo: Math.random() > 0.5, // For demo purposes
  }));

  // Transform meals for TrendingSection
  const trendingItems = meals.map((meal, index) => ({
    id: meal.id,
    name: meal.name,
    slug: meal.slug,
    restaurantName: meal.restaurant.name,
    restaurantSlug: meal.restaurant.slug,
    imageUrl: meal.imageUrl || "",
    price: Number(meal.basePrice),
    badge: index < 2 ? ("Nowość" as const) : undefined,
  }));

  return (
    <div className="min-h-screen bg-[var(--dishly-background)]">
      {/* Sticky Header */}
      <MainHeader
        user={
          session?.user
            ? {
                firstName: session.user.firstName,
                lastName: session.user.lastName,
                role: session.user.role,
              }
            : null
        }
        navigationPages={navigationPages}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Stories Section */}
      <StoriesSection stories={stories} />

      {/* Main Feed */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-[var(--dishly-text)]">
          Restauracje w Twojej okolicy
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              id={restaurant.id}
              slug={restaurant.slug}
              name={restaurant.name}
              imageUrl={restaurant.logoUrl || ""}
              rating={4.5 + Math.random() * 0.5} // Mock rating
              reviewCount={Math.floor(Math.random() * 500) + 50} // Mock review count
              deliveryTime="30-45 min"
              minOrder={
                restaurant.locations[0]?.minOrderValue
                  ? Number(restaurant.locations[0].minOrderValue)
                  : 30
              }
              deliveryFee={
                restaurant.locations[0]?.deliveryFee
                  ? Number(restaurant.locations[0].deliveryFee)
                  : 5
              }
              categories={["Kuchnia włoska", "Pizza", "Pasta"]} // Mock categories
            />
          ))}
        </div>

        {/* Empty State */}
        {restaurants.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl">🍽️</div>
            <h3 className="mb-2 text-xl font-bold text-[var(--dishly-text)]">
              Brak dostępnych restauracji
            </h3>
            <p className="text-[var(--dishly-text-muted)]">
              Wkrótce dodamy restauracje w Twojej okolicy!
            </p>
          </div>
        )}
      </main>

      {/* Trending Section */}
      <TrendingSection items={trendingItems} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
