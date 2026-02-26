"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

function requireAdmin(role: string) {
  if (role !== "ADMIN") throw new Error("Brak uprawnień");
}

function handleDeleteError(e: unknown): { success: false; error: string } {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2025") {
      return {
        success: false,
        error: "Rekord nie istnieje lub został już usunięty",
      };
    }
    if (e.code === "P2003" || e.code === "P2014") {
      return {
        success: false,
        error:
          "Nie można usunąć — etykieta jest przypisana do restauracji lub dań",
      };
    }
  }
  throw e;
}

function handleUniqueError(e: unknown): { success: false; error: string } {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return { success: false, error: "Taka etykieta już istnieje w słowniku" };
  }
  throw e;
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ==================== CUISINE TYPES ====================

export async function getCuisineTypes() {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);
  return db.cuisineType.findMany({ orderBy: { name: "asc" } });
}

export async function createCuisineType(name: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  try {
    await db.cuisineType.create({ data: { name, slug: toSlug(name) } });
  } catch (e) {
    return handleUniqueError(e);
  }
  revalidatePath("/dashboard/dictionaries");
  return { success: true as const };
}

export async function updateCuisineType(id: string, name: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  try {
    await db.cuisineType.update({
      where: { id },
      data: { name, slug: toSlug(name) },
    });
  } catch (e) {
    return handleUniqueError(e);
  }
  revalidatePath("/dashboard/dictionaries");
  return { success: true as const };
}

export async function deleteCuisineType(id: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  try {
    await db.cuisineType.delete({ where: { id } });
  } catch (e) {
    return handleDeleteError(e);
  }
  revalidatePath("/dashboard/dictionaries");
  return { success: true as const };
}

export async function toggleCuisineType(id: string, isActive: boolean) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  await db.cuisineType.update({ where: { id }, data: { isActive } });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
}

// ==================== RESTAURANT TAGS (AMENITIES) ====================

export async function getRestaurantTags() {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);
  return db.restaurantTag.findMany({ orderBy: { name: "asc" } });
}

export async function createRestaurantTag(name: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  try {
    await db.restaurantTag.create({ data: { name, slug: toSlug(name) } });
  } catch (e) {
    return handleUniqueError(e);
  }
  revalidatePath("/dashboard/dictionaries");
  return { success: true as const };
}

export async function updateRestaurantTag(id: string, name: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  try {
    await db.restaurantTag.update({
      where: { id },
      data: { name, slug: toSlug(name) },
    });
  } catch (e) {
    return handleUniqueError(e);
  }
  revalidatePath("/dashboard/dictionaries");
  return { success: true as const };
}

export async function deleteRestaurantTag(id: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  try {
    await db.restaurantTag.delete({ where: { id } });
  } catch (e) {
    return handleDeleteError(e);
  }
  revalidatePath("/dashboard/dictionaries");
  return { success: true as const };
}

// ==================== DISH TAGS ====================

export async function getDishTags() {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);
  return db.dishTag.findMany({ orderBy: { name: "asc" } });
}

export async function createDishTag(name: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  try {
    await db.dishTag.create({ data: { name, slug: toSlug(name) } });
  } catch (e) {
    return handleUniqueError(e);
  }
  revalidatePath("/dashboard/dictionaries");
  return { success: true as const };
}

export async function updateDishTag(id: string, name: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  try {
    await db.dishTag.update({
      where: { id },
      data: { name, slug: toSlug(name) },
    });
  } catch (e) {
    return handleUniqueError(e);
  }
  revalidatePath("/dashboard/dictionaries");
  return { success: true as const };
}

export async function deleteDishTag(id: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  try {
    await db.dishTag.delete({ where: { id } });
  } catch (e) {
    return handleDeleteError(e);
  }
  revalidatePath("/dashboard/dictionaries");
  return { success: true as const };
}

// ==================== TAG REQUESTS ====================

export async function getTagRequests() {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  return db.tagRequest.findMany({
    where: { status: "PENDING" },
    include: {
      requester: { select: { email: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function approveTagRequest(id: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  const req = await db.tagRequest.findUnique({ where: { id } });
  if (!req) return { success: false, error: "Nie znaleziono prośby" };

  try {
    if (req.type === "CUISINE") {
      await db.cuisineType.create({
        data: { name: req.name, slug: toSlug(req.name) },
      });
    } else if (req.type === "AMENITY") {
      await db.restaurantTag.create({
        data: { name: req.name, slug: toSlug(req.name) },
      });
    } else if (req.type === "DISH") {
      await db.dishTag.create({
        data: { name: req.name, slug: toSlug(req.name) },
      });
    }
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { success: false, error: "Taka etykieta już istnieje w słowniku" };
    }
    throw e;
  }

  await db.tagRequest.update({ where: { id }, data: { status: "APPROVED" } });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
}

export async function rejectTagRequest(id: string, note?: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  await db.tagRequest.update({
    where: { id },
    data: { status: "REJECTED", adminNote: note },
  });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
}
