import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/layout/Footer";
import { StorefrontClient } from "@/components/storefront/StorefrontClient";
import { getRestaurantMapData, getStorefrontData } from "@/actions/storefront";

export default async function Home() {
  const session = await auth();

  let navigationPages: { title: string; slug: string }[] = [];

  try {
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
  } catch (error) {
    console.error("Database connection error:", error);
  }

  // Fetch storefront data via server action
  const storefrontResult = await getStorefrontData();
  const mapResult = await getRestaurantMapData();

  const initialData =
    storefrontResult.success && storefrontResult.data
      ? {
          ...storefrontResult.data,
          mapLocations: mapResult.success ? (mapResult.data ?? []) : [],
        }
      : {
          restaurants: [],
          cuisineTypes: [],
          restaurantTags: [],
          mealCategories: [],
          recentOrders: [],
          userAddresses: [],
          trendingMeals: [],
          searchMeals: [],
          mapLocations: [] as {
            id: string;
            name: string;
            lat: number;
            lng: number;
            city: string;
            address: string;
            restaurantName: string;
            restaurantSlug: string;
          }[],
          mode: "restaurants" as const,
          restaurantPagination: {
            page: 1,
            perPage: 24,
            total: 0,
            totalPages: 1,
          },
          mealPagination: {
            page: 1,
            perPage: 24,
            total: 0,
            totalPages: 1,
          },
          favoriteRestaurantIds: [],
          isLoggedIn: false,
        };

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

      {/* Storefront Client (Dashboard + Filters + Results + Cart) */}
      <StorefrontClient initialData={initialData} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
