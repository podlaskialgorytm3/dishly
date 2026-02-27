"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

// Funkcja generująca bezpieczne hasło
function generatePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";
  // Zagwarantuj co najmniej jeden znak z każdej kategorii
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Wypełnij resztę losowymi znakami
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Przemieszaj znaki
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

async function getOwnerRestaurant() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") {
    throw new Error("Unauthorized");
  }

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

  return { restaurant, session };
}

export async function getStaff() {
  const { restaurant } = await getOwnerRestaurant();

  // Pobierz wszystkich pracowników przypisanych do lokalizacji tej restauracji
  const locations = await db.location.findMany({
    where: { restaurantId: restaurant.id },
    select: { id: true, name: true },
  });

  const locationIds = locations.map((l) => l.id);

  const staff = await db.user.findMany({
    where: {
      role: { in: ["MANAGER", "WORKER"] },
      locationId: { in: locationIds },
    },
    include: {
      workingAt: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return { staff, locations, restaurant };
}

export async function createStaff(data: {
  firstName: string;
  lastName: string;
  email: string;
  role: "MANAGER" | "WORKER";
  locationId: string;
  password?: string; // Opcjonalne - jeśli nie podane, wygeneruje się automatycznie
}) {
  const { restaurant } = await getOwnerRestaurant();

  // Sprawdź czy lokalizacja należy do tego właściciela
  const location = await db.location.findFirst({
    where: { id: data.locationId, restaurantId: restaurant.id },
  });

  if (!location) {
    throw new Error("Location not found or not belonging to your restaurant");
  }

  // Sprawdź limit kont pracowniczych
  const activeSub = restaurant.subscriptions[0];
  const maxStaff = activeSub?.plan?.maxStaffAccounts ?? 5;

  const locationIds = (
    await db.location.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true },
    })
  ).map((l) => l.id);

  const staffCount = await db.user.count({
    where: {
      role: { in: ["MANAGER", "WORKER"] },
      locationId: { in: locationIds },
    },
  });

  if (staffCount >= maxStaff) {
    throw new Error(
      `Twój plan subskrypcji pozwala na maksymalnie ${maxStaff} kont pracowniczych. Ulepsz plan, aby dodać więcej.`,
    );
  }

  // Sprawdź czy email jest wolny
  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("Użytkownik z tym adresem email już istnieje");
  }

  // Generuj hasło jeśli nie zostało podane
  const password = data.password || generatePassword(12);
  const passwordHash = await hash(password, 12);

  const user = await db.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      isApproved: true, // Pracownicy są od razu aktywni
      locationId: data.locationId,
    },
  });

  revalidatePath("/dashboard/owner/staff");
  return { success: true, user, generatedPassword: password };
}

export async function updateStaff(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    role?: "MANAGER" | "WORKER";
    locationId?: string;
    isActive?: boolean;
  },
) {
  const { restaurant } = await getOwnerRestaurant();

  // Weryfikacja że pracownik należy do tej restauracji
  const locationIds = (
    await db.location.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true },
    })
  ).map((l) => l.id);

  const staffMember = await db.user.findFirst({
    where: {
      id,
      role: { in: ["MANAGER", "WORKER"] },
      locationId: { in: locationIds },
    },
  });

  if (!staffMember) {
    throw new Error("Staff member not found");
  }

  // Jeśli zmiana lokalizacji - sprawdź że nowa lokalizacja należy do tej restauracji
  if (data.locationId && !locationIds.includes(data.locationId)) {
    throw new Error("Location not found");
  }

  await db.user.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      locationId: data.locationId,
      isActive: data.isActive,
    },
  });

  revalidatePath("/dashboard/owner/staff");
  return { success: true };
}

export async function deleteStaff(id: string) {
  const { restaurant } = await getOwnerRestaurant();

  const locationIds = (
    await db.location.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true },
    })
  ).map((l) => l.id);

  const staffMember = await db.user.findFirst({
    where: {
      id,
      role: { in: ["MANAGER", "WORKER"] },
      locationId: { in: locationIds },
    },
  });

  if (!staffMember) {
    throw new Error("Staff member not found");
  }

  await db.user.delete({ where: { id } });

  revalidatePath("/dashboard/owner/staff");
  return { success: true };
}

export async function resetStaffPassword(
  id: string,
  newPassword?: string,
): Promise<{ success: true; generatedPassword: string }> {
  const { restaurant } = await getOwnerRestaurant();

  const locationIds = (
    await db.location.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true },
    })
  ).map((l) => l.id);

  const staffMember = await db.user.findFirst({
    where: {
      id,
      role: { in: ["MANAGER", "WORKER"] },
      locationId: { in: locationIds },
    },
  });

  if (!staffMember) {
    throw new Error("Staff member not found");
  }

  // Generuj hasło jeśli nie zostało podane
  const password = newPassword || generatePassword(12);
  const passwordHash = await hash(password, 12);
  await db.user.update({ where: { id }, data: { passwordHash } });

  return { success: true, generatedPassword: password };
}
