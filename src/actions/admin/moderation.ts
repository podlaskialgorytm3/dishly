"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function requireAdmin(role: string) {
  if (role !== "ADMIN") throw new Error("Brak uprawnień");
}

// ==================== REVIEWS ====================

export async function getAllReviews(ratingFilter?: number, keyword?: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  return db.review.findMany({
    where: {
      ...(ratingFilter ? { rating: { lte: ratingFilter } } : {}),
      ...(keyword
        ? { content: { contains: keyword, mode: "insensitive" } }
        : {}),
    },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      restaurant: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteReview(id: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  await db.review.delete({ where: { id } });
  revalidatePath("/dashboard/moderation");
  return { success: true };
}

// ==================== USERS ====================

export async function getAllUsers() {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  return db.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isApproved: true,
      createdAt: true,
      _count: { select: { orders: true, ownedRestaurants: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  // Prevent admin from deactivating themselves
  if (userId === session.user.id) {
    return { success: false, error: "Nie możesz dezaktywować własnego konta" };
  }

  await db.user.update({ where: { id: userId }, data: { isActive } });
  revalidatePath("/dashboard/moderation");
  return { success: true };
}

export async function updateUser(
  userId: string,
  data: { firstName?: string; lastName?: string; email?: string },
) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  await db.user.update({ where: { id: userId }, data });
  revalidatePath("/dashboard/moderation");
  return { success: true };
}
