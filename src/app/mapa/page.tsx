import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/layout/Footer";
import { RestaurantsMapClient } from "@/components/storefront/RestaurantsMapClient";
import { getRestaurantMapData } from "@/actions/storefront";

export default async function RestaurantsMapPage() {
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

  const mapResult = await getRestaurantMapData();
  const locations = mapResult.success ? (mapResult.data ?? []) : [];

  return (
    <div className="min-h-screen bg-[var(--dishly-background)]">
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

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-[#1F1F1F] md:text-4xl">
            Interaktywna mapa restauracji
          </h1>
          <p className="mt-2 text-sm text-[#6B7280] md:text-base">
            Sprawdź restauracje w Twojej okolicy, zobacz czy są otwarte i
            przejdź do ich strony. Możesz przybliżać, przejść w pełny ekran i
            wrócić do swojej lokalizacji.
          </p>
        </div>

        <RestaurantsMapClient locations={locations} />
      </main>

      <Footer />
    </div>
  );
}
