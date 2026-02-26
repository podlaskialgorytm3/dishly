"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function getOwnerRestaurant() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized");
  }

  const restaurant = await db.restaurant.findFirst({
    where: { ownerId: session.user.id },
    include: {
      cuisineTypes: true,
      tags: true,
    },
  });

  if (!restaurant) throw new Error("Restaurant not found");

  return { restaurant, session };
}

export async function getBranding() {
  const { restaurant } = await getOwnerRestaurant();
  const cuisineTypes = await db.cuisineType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  const tags = await db.restaurantTag.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return { restaurant, allCuisineTypes: cuisineTypes, allTags: tags };
}

export async function updateBranding(data: {
  logoUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  cuisineTypeIds?: string[];
  tagIds?: string[];
}) {
  const { restaurant } = await getOwnerRestaurant();

  await db.restaurant.update({
    where: { id: restaurant.id },
    data: {
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.coverImageUrl !== undefined && {
        coverImageUrl: data.coverImageUrl,
      }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.cuisineTypeIds !== undefined && {
        cuisineTypes: {
          set: data.cuisineTypeIds.map((id) => ({ id })),
        },
      }),
      ...(data.tagIds !== undefined && {
        tags: {
          set: data.tagIds.map((id) => ({ id })),
        },
      }),
    },
  });

  revalidatePath("/dashboard/owner/branding");
  return { success: true };
}

export async function submitTagRequest(data: {
  name: string;
  type: "CUISINE" | "AMENITY" | "DISH";
}) {
  const { session } = await getOwnerRestaurant();

  if (!data.name?.trim()) {
    throw new Error("Nazwa jest wymagana");
  }

  await db.tagRequest.create({
    data: {
      name: data.name.trim(),
      type: data.type,
      requestedBy: session.user.id,
    },
  });

  revalidatePath("/dashboard/owner/branding");
  return { success: true };
}
