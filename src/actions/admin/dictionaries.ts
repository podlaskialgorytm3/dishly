"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function requireAdmin(role: string) {
  if (role !== "ADMIN") throw new Error("Brak uprawnień");
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

  await db.cuisineType.create({ data: { name, slug: toSlug(name) } });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
}

export async function updateCuisineType(id: string, name: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  await db.cuisineType.update({
    where: { id },
    data: { name, slug: toSlug(name) },
  });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
}

export async function deleteCuisineType(id: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  await db.cuisineType.delete({ where: { id } });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
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

  await db.restaurantTag.create({ data: { name, slug: toSlug(name) } });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
}

export async function updateRestaurantTag(id: string, name: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  await db.restaurantTag.update({
    where: { id },
    data: { name, slug: toSlug(name) },
  });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
}

export async function deleteRestaurantTag(id: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  await db.restaurantTag.delete({ where: { id } });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
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

  await db.dishTag.create({ data: { name, slug: toSlug(name) } });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
}

export async function updateDishTag(id: string, name: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  await db.dishTag.update({
    where: { id },
    data: { name, slug: toSlug(name) },
  });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
}

export async function deleteDishTag(id: string) {
  const session = await auth();
  if (!session) throw new Error("Nie zalogowany");
  requireAdmin(session.user.role);

  await db.dishTag.delete({ where: { id } });
  revalidatePath("/dashboard/dictionaries");
  return { success: true };
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
