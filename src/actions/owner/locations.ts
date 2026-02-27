"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type OpeningHourDay = {
  open: string;
  close: string;
  closed: boolean;
};

type OpeningHours = {
  monday: OpeningHourDay;
  tuesday: OpeningHourDay;
  wednesday: OpeningHourDay;
  thursday: OpeningHourDay;
  friday: OpeningHourDay;
  saturday: OpeningHourDay;
  sunday: OpeningHourDay;
};

const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { open: "10:00", close: "22:00", closed: false },
  tuesday: { open: "10:00", close: "22:00", closed: false },
  wednesday: { open: "10:00", close: "22:00", closed: false },
  thursday: { open: "10:00", close: "22:00", closed: false },
  friday: { open: "10:00", close: "23:00", closed: false },
  saturday: { open: "10:00", close: "23:00", closed: false },
  sunday: { open: "11:00", close: "21:00", closed: false },
};

async function getOwnerRestaurant() {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "OWNER" && session.user.role !== "MANAGER")
  ) {
    throw new Error("Unauthorized");
  }

  // OWNER - znajdź restaurację po ownerId
  if (session.user.role === "OWNER") {
    const restaurant = await db.restaurant.findFirst({
      where: { ownerId: session.user.id },
      include: {
        subscriptions: {
          where: { isActive: true },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    return restaurant;
  }

  // MANAGER - znajdź restaurację przez locationId
  if (session.user.role === "MANAGER" && session.user.locationId) {
    const location = await db.location.findUnique({
      where: { id: session.user.locationId },
      include: {
        restaurant: {
          include: {
            subscriptions: {
              where: { isActive: true },
              include: { plan: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!location || !location.restaurant) {
      throw new Error("Restaurant not found");
    }

    return location.restaurant;
  }

  throw new Error("Unauthorized - no restaurant assignment");
}

export async function getLocations() {
  const session = await auth();
  const restaurant = await getOwnerRestaurant();

  // Manager widzi tylko swoją lokalizację
  const whereClause =
    session?.user.role === "MANAGER" && session.user.locationId
      ? { restaurantId: restaurant.id, id: session.user.locationId }
      : { restaurantId: restaurant.id };

  const locations = await db.location.findMany({
    where: whereClause,
    include: {
      workers: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Konwertuj Decimal na number dla kompatybilności z Client Components
  const serializedLocations = locations.map((loc) => ({
    ...loc,
    deliveryFee: Number(loc.deliveryFee),
    minOrderValue: Number(loc.minOrderValue),
  }));

  return { locations: serializedLocations, restaurant };
}

export async function getLocation(id: string) {
  const restaurant = await getOwnerRestaurant();

  const location = await db.location.findFirst({
    where: { id, restaurantId: restaurant.id },
  });

  if (!location) {
    throw new Error("Location not found");
  }

  // Konwertuj Decimal na number dla kompatybilności z Client Components
  return {
    ...location,
    deliveryFee: Number(location.deliveryFee),
    minOrderValue: Number(location.minOrderValue),
  };
}

export async function createLocation(data: {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  deliveryRadius: number;
  deliveryFee: number;
  minOrderValue: number;
  isAllDay: boolean;
  openingHours?: OpeningHours;
}) {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Only owners can create locations");
  }

  const restaurant = await getOwnerRestaurant();

  // Sprawdź limit subskrypcji
  const activeSub = restaurant.subscriptions[0];
  const maxLocations = activeSub?.plan?.maxLocations ?? 1;

  const existingCount = await db.location.count({
    where: { restaurantId: restaurant.id, isActive: true },
  });

  if (existingCount >= maxLocations) {
    throw new Error(
      `Twój plan subskrypcji pozwala na maksymalnie ${maxLocations} ${maxLocations === 1 ? "lokalizację" : "lokalizacje"}. Ulepsz plan, aby dodać więcej.`,
    );
  }

  const location = await db.location.create({
    data: {
      restaurantId: restaurant.id,
      name: data.name,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      phone: data.phone,
      deliveryRadius: data.deliveryRadius,
      deliveryFee: data.deliveryFee,
      minOrderValue: data.minOrderValue,
      isAllDay: data.isAllDay,
      openingHours: data.isAllDay
        ? DEFAULT_OPENING_HOURS
        : (data.openingHours ?? DEFAULT_OPENING_HOURS),
    },
  });

  revalidatePath("/dashboard/owner/locations");
  return { success: true, location };
}

export async function updateLocation(
  id: string,
  data: {
    name?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    phone?: string;
    deliveryRadius?: number;
    deliveryFee?: number;
    minOrderValue?: number;
    isAllDay?: boolean;
    openingHours?: OpeningHours;
    isActive?: boolean;
  },
) {
  const session = await auth();
  const restaurant = await getOwnerRestaurant();

  // Manager może edytować tylko swoją lokalizację
  if (session?.user.role === "MANAGER" && session.user.locationId !== id) {
    throw new Error("Managers can only edit their assigned location");
  }

  await db.location.updateMany({
    where: { id, restaurantId: restaurant.id },
    data: {
      ...data,
      openingHours: data.isAllDay
        ? DEFAULT_OPENING_HOURS
        : (data.openingHours as any),
    },
  });

  revalidatePath("/dashboard/owner/locations");
  return { success: true };
}

export async function deleteLocation(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Only owners can delete locations");
  }

  const restaurant = await getOwnerRestaurant();

  // Sprawdź czy lokalizacja nie ma pracowników
  const workersCount = await db.user.count({
    where: { locationId: id },
  });

  if (workersCount > 0) {
    throw new Error(
      "Nie można usunąć lokalizacji z przypisanymi pracownikami. Najpierw przenieś lub usuń pracowników.",
    );
  }

  await db.location.deleteMany({
    where: { id, restaurantId: restaurant.id },
  });

  revalidatePath("/dashboard/owner/locations");
  return { success: true };
}
