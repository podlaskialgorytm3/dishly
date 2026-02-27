"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export type PlaceOrderItem = {
  mealId: string;
  mealName: string;
  variantId: string | null;
  variantName: string | null;
  basePrice: number;
  variantPriceModifier: number;
  addons: {
    addonId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  quantity: number;
  note: string;
};

export type PlaceOrderInput = {
  locationId: string;
  restaurantName: string;
  restaurantSlug: string;
  items: PlaceOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountPercent: number;
  totalPrice: number;
  deliveryAddress: string;
  customerLat?: number;
  customerLng?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  notes?: string;
};

// ============================================
// HELPERS
// ============================================

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DSH-${date}-${random}`;
}

// Geocode an address using Nominatim (OpenStreetMap) - free, no API key
async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(address);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=pl`,
      {
        headers: { "User-Agent": "DISHLY/1.0 (food delivery app)" },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// Average preparation time based on items (simulation)
function estimateDeliveryMinutes(itemCount: number): number {
  const basePrep = 15; // 15 min base
  const perItem = 3; // +3 min per item
  const deliveryTime = 20; // 20 min delivery
  return basePrep + Math.min(itemCount * perItem, 30) + deliveryTime;
}

// ============================================
// PLACE ORDER
// ============================================

export async function placeOrder(input: PlaceOrderInput) {
  const session = await auth();

  // Get location with coordinates
  const location = await db.location.findUnique({
    where: { id: input.locationId },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      restaurant: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!location) {
    return { success: false, error: "Lokalizacja nie istnieje" };
  }

  const orderNumber = generateOrderNumber();
  const totalItems = input.items.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedMinutes = estimateDeliveryMinutes(totalItems);
  const estimatedDeliveryAt = new Date(
    Date.now() + estimatedMinutes * 60 * 1000,
  );

  // Geocode delivery address if coordinates are missing
  let finalCustomerLat = input.customerLat || null;
  let finalCustomerLng = input.customerLng || null;
  if ((!finalCustomerLat || !finalCustomerLng) && input.deliveryAddress) {
    const geocoded = await geocodeAddress(input.deliveryAddress);
    if (geocoded) {
      finalCustomerLat = geocoded.lat;
      finalCustomerLng = geocoded.lng;
    }
  }

  try {
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id ?? null,
        locationId: input.locationId,
        type: "DELIVERY",
        status: "PENDING",
        paymentStatus: "PAID", // Symulacja - od razu "zapłacone"
        subtotal: input.subtotal,
        deliveryFee: input.deliveryFee,
        discountPercent: input.discountPercent,
        totalPrice: input.totalPrice,
        notes: input.notes || null,
        estimatedTime: estimatedMinutes,
        estimatedDeliveryAt,
        guestName: input.guestName || null,
        guestEmail: input.guestEmail || null,
        guestPhone: input.guestPhone || null,
        deliveryAddress: input.deliveryAddress,
        customerLat: finalCustomerLat,
        customerLng: finalCustomerLng,
        restaurantName: input.restaurantName,
        restaurantSlug: input.restaurantSlug,
        items: {
          create: input.items.map((item) => {
            const addonTotal = item.addons.reduce(
              (sum, a) => sum + a.price * a.quantity,
              0,
            );
            const itemTotalPrice =
              (item.basePrice + item.variantPriceModifier + addonTotal) *
              item.quantity;

            return {
              mealId: item.mealId,
              variantId: item.variantId || null,
              quantity: item.quantity,
              basePrice: item.basePrice,
              totalPrice: itemTotalPrice,
              note: item.note || null,
              mealName: item.mealName,
              addons: {
                create: item.addons.map((addon) => ({
                  addonId: addon.addonId,
                  quantity: addon.quantity,
                  price: addon.price,
                })),
              },
            };
          }),
        },
      },
    });

    revalidatePath("/dashboard/orders");

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  } catch (error) {
    console.error("Error placing order:", error);
    return { success: false, error: "Nie udało się złożyć zamówienia" };
  }
}

// ============================================
// GET ORDER TRACKING
// ============================================

export async function getOrderTracking(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          meal: { select: { name: true, imageUrl: true } },
          variant: { select: { name: true } },
          addons: {
            include: {
              addon: { select: { name: true } },
            },
          },
        },
      },
      location: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          phone: true,
          latitude: true,
          longitude: true,
          restaurant: {
            select: { name: true, slug: true, logoUrl: true },
          },
        },
      },
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discountPercent: order.discountPercent,
    totalPrice: Number(order.totalPrice),
    notes: order.notes,
    estimatedTime: order.estimatedTime,
    estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() ?? null,
    deliveryAddress: order.deliveryAddress,
    customerLat: order.customerLat,
    customerLng: order.customerLng,
    restaurantName: order.restaurantName,
    restaurantSlug: order.restaurantSlug,
    guestName: order.guestName,
    guestEmail: order.guestEmail,
    guestPhone: order.guestPhone,
    createdAt: order.createdAt.toISOString(),
    acceptedAt: order.acceptedAt?.toISOString() ?? null,
    preparingAt: order.preparingAt?.toISOString() ?? null,
    readyAt: order.readyAt?.toISOString() ?? null,
    inDeliveryAt: order.inDeliveryAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    location: {
      name: order.location.name,
      address: order.location.address,
      city: order.location.city,
      phone: order.location.phone,
      latitude: order.location.latitude,
      longitude: order.location.longitude,
      restaurantName: order.location.restaurant.name,
      restaurantSlug: order.location.restaurant.slug,
      restaurantLogoUrl: order.location.restaurant.logoUrl,
    },
    items: order.items.map((item) => ({
      id: item.id,
      mealName: item.mealName ?? item.meal.name,
      mealImageUrl: item.meal.imageUrl,
      variantName: item.variant?.name ?? null,
      quantity: item.quantity,
      basePrice: Number(item.basePrice),
      totalPrice: Number(item.totalPrice),
      note: item.note,
      addons: item.addons.map((a) => ({
        name: a.addon.name,
        quantity: a.quantity,
        price: Number(a.price),
      })),
    })),
    user: order.user
      ? {
          firstName: order.user.firstName,
          lastName: order.user.lastName,
          email: order.user.email,
        }
      : null,
  };
}

// ============================================
// GET LOCATION ORDERS (for restaurant staff)
// ============================================

export async function getLocationOrders(locationId?: string) {
  const session = await auth();
  if (!session) return [];

  const { role } = session.user;
  if (!["OWNER", "MANAGER", "WORKER", "ADMIN"].includes(role)) return [];

  let whereClause: any = {};

  if (role === "ADMIN") {
    // Admin sees all orders
    if (locationId) {
      whereClause = { locationId };
    }
  } else if (role === "OWNER") {
    // Owner sees orders for all their restaurant locations
    const restaurants = await db.restaurant.findMany({
      where: { ownerId: session.user.id },
      select: { locations: { select: { id: true } } },
    });
    const locationIds = restaurants.flatMap((r) =>
      r.locations.map((l) => l.id),
    );
    whereClause = { locationId: { in: locationIds } };
  } else {
    // Manager/Worker sees orders for their assigned location
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { locationId: true },
    });
    if (!user?.locationId) return [];
    whereClause = { locationId: user.locationId };
  }

  const orders = await db.order.findMany({
    where: whereClause,
    include: {
      items: {
        include: {
          meal: { select: { name: true, imageUrl: true } },
          variant: { select: { name: true } },
          addons: {
            include: { addon: { select: { name: true } } },
          },
        },
      },
      location: {
        select: { name: true, city: true },
      },
      user: {
        select: { firstName: true, lastName: true, email: true, phone: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    type: order.type,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    totalPrice: Number(order.totalPrice),
    estimatedTime: order.estimatedTime,
    estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() ?? null,
    deliveryAddress: order.deliveryAddress,
    guestName: order.guestName,
    guestPhone: order.guestPhone,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    acceptedAt: order.acceptedAt?.toISOString() ?? null,
    preparingAt: order.preparingAt?.toISOString() ?? null,
    readyAt: order.readyAt?.toISOString() ?? null,
    inDeliveryAt: order.inDeliveryAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    locationName: order.location.name,
    locationCity: order.location.city,
    customer: order.user
      ? {
          name: `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim(),
          email: order.user.email,
          phone: order.user.phone,
        }
      : {
          name: order.guestName ?? "Gość",
          email: null,
          phone: order.guestPhone,
        },
    items: order.items.map((item) => ({
      id: item.id,
      mealName: item.mealName ?? item.meal.name,
      variantName: item.variant?.name ?? null,
      quantity: item.quantity,
      totalPrice: Number(item.totalPrice),
      note: item.note,
      addons: item.addons.map((a) => ({
        name: a.addon.name,
        quantity: a.quantity,
      })),
    })),
  }));
}

// ============================================
// UPDATE ORDER STATUS (restaurant staff)
// ============================================

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["IN_DELIVERY", "CANCELLED"],
  IN_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_TIMESTAMP_FIELD: Record<string, string> = {
  ACCEPTED: "acceptedAt",
  PREPARING: "preparingAt",
  READY: "readyAt",
  IN_DELIVERY: "inDeliveryAt",
  DELIVERED: "deliveredAt",
  CANCELLED: "cancelledAt",
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
) {
  const session = await auth();
  if (!session) return { success: false, error: "Brak autoryzacji" };

  const { role } = session.user;
  if (!["OWNER", "MANAGER", "WORKER", "ADMIN"].includes(role)) {
    return { success: false, error: "Brak uprawnień" };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      locationId: true,
      location: {
        select: {
          restaurant: { select: { ownerId: true } },
        },
      },
    },
  });

  if (!order) return { success: false, error: "Zamówienie nie istnieje" };

  // Verify ownership (skip for ADMIN)
  if (role !== "ADMIN") {
    if (role === "OWNER") {
      if (order.location.restaurant.ownerId !== session.user.id) {
        return { success: false, error: "Brak uprawnień do tego zamówienia" };
      }
    } else {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { locationId: true },
      });
      if (user?.locationId !== order.locationId) {
        return { success: false, error: "Brak uprawnień do tego zamówienia" };
      }
    }
  }

  // Validate status transition
  const allowedTransitions = STATUS_TRANSITIONS[order.status];
  if (!allowedTransitions.includes(newStatus)) {
    return {
      success: false,
      error: `Nie można zmienić statusu z ${order.status} na ${newStatus}`,
    };
  }

  const timestampField = STATUS_TIMESTAMP_FIELD[newStatus];
  const updateData: any = { status: newStatus };
  if (timestampField) {
    updateData[timestampField] = new Date();
  }

  await db.order.update({
    where: { id: orderId },
    data: updateData,
  });

  revalidatePath("/dashboard/orders");
  revalidatePath(`/order/${orderId}`);

  return { success: true };
}

// ============================================
// GET CLIENT ORDERS (for logged-in users)
// ============================================

export async function getClientOrders() {
  const session = await auth();
  if (!session) return [];

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          meal: { select: { name: true, imageUrl: true } },
        },
      },
      location: {
        select: {
          name: true,
          city: true,
          restaurant: { select: { name: true, slug: true, logoUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalPrice: Number(order.totalPrice),
    estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() ?? null,
    restaurantName: order.restaurantName ?? order.location.restaurant.name,
    restaurantSlug: order.restaurantSlug ?? order.location.restaurant.slug,
    restaurantLogoUrl: order.location.restaurant.logoUrl,
    locationName: order.location.name,
    createdAt: order.createdAt.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
    items: order.items.map((item) => ({
      mealName: item.mealName ?? item.meal.name,
      quantity: item.quantity,
    })),
  }));
}
