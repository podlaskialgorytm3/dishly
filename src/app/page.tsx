import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/layout/Footer";
import { StorefrontClient } from "@/components/storefront/StorefrontClient";
import { getStorefrontData } from "@/actions/storefront";

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

  const initialData =
    storefrontResult.success && storefrontResult.data
      ? storefrontResult.data
      : {
          restaurants: [],
          cuisineTypes: [],
          restaurantTags: [],
          recentOrders: [],
          userAddresses: [],
          trendingMeals: [],
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
