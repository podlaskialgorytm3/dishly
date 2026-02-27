"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// ============================================
// TYPES
// ============================================

interface AddressInput {
  label?: string;
  street: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

// ============================================
// GET ALL ADDRESSES
// ============================================

export async function getClientAddresses() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return addresses.map((a) => ({
    id: a.id,
    label: a.label,
    street: a.street,
    city: a.city,
    postalCode: a.postalCode,
    country: a.country,
    latitude: a.latitude,
    longitude: a.longitude,
    isDefault: a.isDefault,
    createdAt: a.createdAt.toISOString(),
  }));
}

// ============================================
// CREATE ADDRESS
// ============================================

export async function createAddress(input: AddressInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  try {
    // If this is the first address or marked as default, unset other defaults
    if (input.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Check if user has no addresses yet - first one should be default
    const count = await db.address.count({
      where: { userId: session.user.id },
    });
    const shouldBeDefault = count === 0 || input.isDefault;

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        label: input.label?.trim() || null,
        street: input.street.trim(),
        city: input.city.trim(),
        postalCode: input.postalCode.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        isDefault: shouldBeDefault,
      },
    });

    return { success: true, addressId: address.id };
  } catch (error) {
    console.error("Error creating address:", error);
    return { success: false, error: "Nie udało się dodać adresu" };
  }
}

// ============================================
// UPDATE ADDRESS
// ============================================

export async function updateAddress(addressId: string, input: AddressInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  try {
    // Verify ownership
    const existing = await db.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });
    if (!existing) {
      return { success: false, error: "Adres nie został znaleziony" };
    }

    if (input.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    await db.address.update({
      where: { id: addressId },
      data: {
        label: input.label?.trim() || null,
        street: input.street.trim(),
        city: input.city.trim(),
        postalCode: input.postalCode.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        isDefault: input.isDefault ?? existing.isDefault,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating address:", error);
    return { success: false, error: "Nie udało się zaktualizować adresu" };
  }
}

// ============================================
// DELETE ADDRESS
// ============================================

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  try {
    const existing = await db.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });
    if (!existing) {
      return { success: false, error: "Adres nie został znaleziony" };
    }

    await db.address.delete({ where: { id: addressId } });

    // If deleted address was default, set first remaining address as default
    if (existing.isDefault) {
      const firstAddress = await db.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
      });
      if (firstAddress) {
        await db.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: "Nie udało się usunąć adresu" };
  }
}

// ============================================
// SET DEFAULT ADDRESS
// ============================================

export async function setDefaultAddress(addressId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  try {
    const existing = await db.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });
    if (!existing) {
      return { success: false, error: "Adres nie został znaleziony" };
    }

    // Unset all defaults
    await db.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set this one as default
    await db.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error setting default address:", error);
    return { success: false, error: "Nie udało się ustawić domyślnego adresu" };
  }
}

// ============================================
// GET DEFAULT ADDRESS (for checkout)
// ============================================

export async function getDefaultAddress() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const address = await db.address.findFirst({
    where: { userId: session.user.id, isDefault: true },
  });

  if (!address) return null;

  return {
    id: address.id,
    label: address.label,
    street: address.street,
    city: address.city,
    postalCode: address.postalCode,
    latitude: address.latitude,
    longitude: address.longitude,
    fullAddress: `${address.street}, ${address.postalCode} ${address.city}`,
  };
}

// ============================================
// REVERSE GEOCODE (address from coordinates)
// ============================================

export async function reverseGeocode(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pl`,
      {
        headers: {
          "User-Agent": "Dishly/1.0",
        },
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    const addr = data.address;

    if (!addr) return null;

    const street =
      addr.road || addr.pedestrian || addr.footway || addr.street || "";
    const houseNumber = addr.house_number || "";
    const city =
      addr.city || addr.town || addr.village || addr.municipality || "";
    const postalCode = addr.postcode || "";

    return {
      street: houseNumber ? `${street} ${houseNumber}` : street,
      city,
      postalCode,
      displayName: data.display_name as string,
    };
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return null;
  }
}
