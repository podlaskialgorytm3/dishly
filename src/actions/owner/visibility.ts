"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Definicja wszystkich paneli UI które można kontrolować
export const UI_PANELS = [
  {
    key: "statistics",
    label: "Karta Statystyk",
    description: "Wykresy i wskaźniki sprzedaży",
  },
  {
    key: "revenue",
    label: "Strona Główna z Przychodem",
    description: "Przychody i podsumowanie finansowe",
  },
  {
    key: "reports",
    label: "Raporty",
    description: "Szczegółowe raporty okresowe",
  },
  {
    key: "menu",
    label: "Zarządzanie Menu",
    description: "Edycja dań, cen i kategorii",
  },
  {
    key: "orders",
    label: "Zamówienia",
    description: "Lista i obsługa zamówień",
  },
  {
    key: "opening_hours",
    label: "Godziny Otwarcia",
    description: "Edycja godzin pracy lokalizacji",
  },
] as const;

export type PanelKey = (typeof UI_PANELS)[number]["key"];
export type TargetRole = "MANAGER" | "WORKER";

async function getOwnerRestaurant() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized");
  }

  const restaurant = await db.restaurant.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!restaurant) throw new Error("Restaurant not found");
  return { restaurant, session };
}

export async function getVisibilitySettings() {
  const { restaurant } = await getOwnerRestaurant();

  const settings = await db.visibilitySettings.findMany({
    where: { restaurantId: restaurant.id },
  });

  // Zbuduj mapę widoczności: { [role]: { [panelKey]: boolean } }
  const visibilityMap: Record<string, Record<string, boolean>> = {
    MANAGER: {},
    WORKER: {},
  };

  // Domyślnie wszystkie panele są widoczne
  for (const role of ["MANAGER", "WORKER"] as TargetRole[]) {
    for (const panel of UI_PANELS) {
      const found = settings.find(
        (s) => s.role === role && s.panelKey === panel.key,
      );
      visibilityMap[role][panel.key] = found?.isVisible ?? true;
    }
  }

  return { visibilityMap, restaurant };
}

export async function updateVisibility(
  role: TargetRole,
  panelKey: string,
  isVisible: boolean,
) {
  const { restaurant } = await getOwnerRestaurant();

  await db.visibilitySettings.upsert({
    where: {
      restaurantId_role_panelKey: {
        restaurantId: restaurant.id,
        role,
        panelKey,
      },
    },
    create: {
      restaurantId: restaurant.id,
      role,
      panelKey,
      isVisible,
    },
    update: { isVisible },
  });

  revalidatePath("/dashboard/owner/visibility");
  return { success: true };
}

// Funkcja pomocnicza do sprawdzenia widoczności panelu dla danej roli
// Używana po stronie serwera przy renderowaniu paneli dla MANAGER/WORKER
export async function checkPanelVisibility(
  restaurantId: string,
  role: TargetRole,
  panelKey: string,
): Promise<boolean> {
  const setting = await db.visibilitySettings.findUnique({
    where: {
      restaurantId_role_panelKey: { restaurantId, role, panelKey },
    },
  });
  // Domyślnie widoczne jeśli brak rekordu
  return setting?.isVisible ?? true;
}
