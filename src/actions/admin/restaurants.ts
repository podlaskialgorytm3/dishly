"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function requireAdmin(role: string) {
  if (role !== "ADMIN") throw new Error("Brak uprawnień");
}

export async function getPendingRestaurants() {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  return db.restaurant.findMany({
    where: { status: "PENDING" },
    include: {
      owner: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      },
      _count: { select: { locations: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllRestaurants() {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  return db.restaurant.findMany({
    include: {
      owner: { select: { email: true, firstName: true, lastName: true } },
      _count: { select: { locations: true, subscriptions: true } },
      subscriptions: {
        where: { isActive: true },
        include: { plan: { select: { id: true, name: true, price: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function approveRestaurant(restaurantId: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  const restaurant = await db.restaurant.update({
    where: { id: restaurantId },
    data: { status: "APPROVED", isActive: true },
    include: { owner: true },
  });

  // Approve the owner user as well
  await db.user.update({
    where: { id: restaurant.ownerId },
    data: { isApproved: true },
  });

  // Aktywuj subskrypcję restauracji (utworzoną przy rejestracji jako nieaktywna)
  await db.subscription.updateMany({
    where: { restaurantId, isActive: false },
    data: { isActive: true, startDate: new Date() },
  });

  revalidatePath("/dashboard/restaurants");
  return { success: true };
}

export async function rejectRestaurant(restaurantId: string, note?: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  await db.restaurant.update({
    where: { id: restaurantId },
    data: {
      status: "REJECTED",
      rejectionNote: note || null,
    },
  });

  revalidatePath("/dashboard/restaurants");
  return { success: true };
}

export async function assignSubscription(restaurantId: string, planId: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  try {
    // Deactivate existing active subscriptions for this restaurant
    await db.subscription.updateMany({
      where: { restaurantId, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    // Create new active subscription
    await db.subscription.create({
      data: {
        restaurantId,
        planId,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/restaurants");
    return { success: true as const };
  } catch (e) {
    console.error(e);
    return {
      success: false as const,
      error: "Błąd podczas przypisywania subskrypcji",
    };
  }
}
