"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { updateEstimatedTime as _updateEstimatedTime } from "@/actions/orders";

// Wrap re-export as async server action
export async function updateEstimatedTime(
  orderId: string,
  newEstimatedMinutes: number,
) {
  return _updateEstimatedTime(orderId, newEstimatedMinutes);
}

// ============================================
// TYPES
// ============================================

export type KitchenOrderItem = {
  id: string;
  mealName: string;
  variantName: string | null;
  quantity: number;
  totalPrice: number;
  note: string | null;
  preparationTime: number;
  addons: { name: string; quantity: number }[];
};

export type KitchenOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  type: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  estimatedTime: number | null;
  estimatedDeliveryAt: string | null;
  deliveryAddress: string | null;
  guestName: string | null;
  guestPhone: string | null;
  notes: string | null;
  createdAt: string;
  acceptedAt: string | null;
  preparingAt: string | null;
  readyAt: string | null;
  inDeliveryAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  locationName: string;
  locationCity: string;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  items: KitchenOrderItem[];
};

// ============================================
// ETA ENGINE - Automatic ETA calculation
// ============================================

export async function calculateOrderETA(
  locationId: string,
  items: { mealId: string; quantity: number }[],
): Promise<number> {
  // 1. Get preparation times for all meals in this order
  const mealIds = items.map((i) => i.mealId);
  const meals = await db.meal.findMany({
    where: { id: { in: mealIds } },
    select: { id: true, preparationTime: true },
  });

  const mealPrepMap = new Map(meals.map((m) => [m.id, m.preparationTime]));

  // Take the max preparation time as the base
  let maxPrepTime = 0;
  for (const item of items) {
    const prepTime = mealPrepMap.get(item.mealId) ?? 15;
    if (prepTime > maxPrepTime) {
      maxPrepTime = prepTime;
    }
  }

  // 2. Count orders that are currently "in preparation" at this location
  const activeOrders = await db.order.count({
    where: {
      locationId,
      status: { in: ["ACCEPTED", "PREPARING"] },
    },
  });

  // Every 2 active orders add 5 minutes
  const queueOverhead = Math.floor(activeOrders / 2) * 5;

  // 3. Get manual ETA offset from location settings
  const settings = await db.locationSettings.findUnique({
    where: { locationId },
    select: { etaOffsetMinutes: true },
  });
  const manualOffset = settings?.etaOffsetMinutes ?? 0;

  // 4. Final ETA = max prep time + queue overhead + manual offset
  const totalETA = Math.max(5, maxPrepTime + queueOverhead + manualOffset);

  return totalETA;
}

// ============================================
// GET KITCHEN ORDERS (optimized for kitchen panel)
// ============================================

export async function getKitchenOrders(
  locationId?: string,
): Promise<KitchenOrder[]> {
  const session = await auth();
  if (!session) return [];

  const { role } = session.user;
  if (!["OWNER", "MANAGER", "WORKER", "ADMIN"].includes(role)) return [];

  let whereClause: Record<string, unknown> = {};

  if (role === "ADMIN") {
    if (locationId) {
      whereClause = { locationId };
    }
  } else if (role === "OWNER") {
    const restaurants = await db.restaurant.findMany({
      where: { ownerId: session.user.id },
      select: { locations: { select: { id: true } } },
    });
    const locationIds = restaurants.flatMap((r) =>
      r.locations.map((l) => l.id),
    );
    if (locationId && locationIds.includes(locationId)) {
      whereClause = { locationId };
    } else {
      whereClause = { locationId: { in: locationIds } };
    }
  } else {
    // Manager/Worker - their assigned location
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { locationId: true },
    });
    if (!user?.locationId) return [];
    whereClause = { locationId: user.locationId };
  }

  // Only get today's orders for kitchen view
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await db.order.findMany({
    where: {
      ...whereClause,
      createdAt: { gte: today },
      paymentStatus: "PAID",
    },
    include: {
      items: {
        include: {
          meal: {
            select: { name: true, imageUrl: true, preparationTime: true },
          },
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
    orderBy: { createdAt: "asc" }, // Oldest first for kitchen queue
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    type: order.type,
    paymentStatus: order.paymentStatus,
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
      preparationTime: item.meal.preparationTime,
      addons: item.addons.map((a) => ({
        name: a.addon.name,
        quantity: a.quantity,
      })),
    })),
  }));
}

// ============================================
// UPDATE ORDER STATUS WITH LOGGING
// ============================================

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["IN_DELIVERY", "DELIVERED", "CANCELLED"],
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

export async function updateKitchenOrderStatus(
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
  const updateData: Record<string, unknown> = { status: newStatus };
  if (timestampField) {
    updateData[timestampField] = new Date();
  }

  // Use transaction to update order and create log
  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: updateData,
    }),
    db.orderStatusLog.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: newStatus,
        changedBy: session.user.id,
      },
    }),
  ]);

  revalidatePath("/dashboard/orders");
  revalidatePath(`/order/${orderId}`);

  return { success: true };
}

// ============================================
// GET / UPDATE LOCATION ETA SETTINGS
// ============================================

export async function getLocationETASettings(locationId: string) {
  const session = await auth();
  if (!session) return null;

  const settings = await db.locationSettings.findUnique({
    where: { locationId },
    select: { etaOffsetMinutes: true, updatedAt: true },
  });

  return (
    settings ?? { etaOffsetMinutes: 0, updatedAt: new Date().toISOString() }
  );
}

export async function updateLocationETAOffset(
  locationId: string,
  offsetMinutes: number,
) {
  const session = await auth();
  if (!session) return { success: false, error: "Brak autoryzacji" };

  const { role } = session.user;
  if (!["OWNER", "MANAGER", "ADMIN"].includes(role)) {
    return { success: false, error: "Brak uprawnień" };
  }

  if (offsetMinutes < -30 || offsetMinutes > 120) {
    return { success: false, error: "Narzut musi wynosić od -30 do 120 minut" };
  }

  await db.locationSettings.upsert({
    where: { locationId },
    create: {
      locationId,
      etaOffsetMinutes: offsetMinutes,
      updatedBy: session.user.id,
    },
    update: {
      etaOffsetMinutes: offsetMinutes,
      updatedBy: session.user.id,
    },
  });

  revalidatePath("/dashboard/orders");

  return { success: true };
}

// ============================================
// GET STATUS BOARD ORDERS (Public view)
// ============================================

export async function getStatusBoardOrders(locationId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const location = await db.location.findUnique({
    where: { id: locationId, isActive: true },
    select: {
      id: true,
      name: true,
      city: true,
      restaurant: {
        select: { name: true, slug: true, logoUrl: true },
      },
    },
  });

  if (!location) return null;

  const orders = await db.order.findMany({
    where: {
      locationId,
      createdAt: { gte: today },
      paymentStatus: "PAID",
      status: { in: ["PREPARING", "READY"] },
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      type: true,
      createdAt: true,
      estimatedDeliveryAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    location: {
      name: location.name,
      city: location.city,
      restaurantName: location.restaurant.name,
      restaurantSlug: location.restaurant.slug,
      logoUrl: location.restaurant.logoUrl,
    },
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status as string,
      type: o.type,
      createdAt: o.createdAt.toISOString(),
      estimatedDeliveryAt: o.estimatedDeliveryAt?.toISOString() ?? null,
    })),
  };
}

// ============================================
// STATISTICS (for Owner/Manager dashboard)
// ============================================

export async function getDailyStatistics(
  locationId?: string,
  dateFrom?: string,
  dateTo?: string,
) {
  const session = await auth();
  if (!session) return null;

  const { role } = session.user;
  if (!["OWNER", "MANAGER", "ADMIN"].includes(role)) return null;

  // Determine location filter
  let locationIds: string[] = [];

  if (role === "ADMIN") {
    if (locationId) locationIds = [locationId];
    // else: all locations
  } else if (role === "OWNER") {
    const restaurants = await db.restaurant.findMany({
      where: { ownerId: session.user.id },
      select: { locations: { select: { id: true } } },
    });
    locationIds = restaurants.flatMap((r) => r.locations.map((l) => l.id));
    if (locationId && locationIds.includes(locationId)) {
      locationIds = [locationId];
    }
  } else {
    // Manager
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { locationId: true },
    });
    if (user?.locationId) locationIds = [user.locationId];
  }

  // Date range
  const from = dateFrom
    ? new Date(dateFrom)
    : new Date(new Date().setHours(0, 0, 0, 0));
  const to = dateTo ? new Date(dateTo) : new Date();
  to.setHours(23, 59, 59, 999);

  const whereClause: Record<string, unknown> = {
    createdAt: { gte: from, lte: to },
    paymentStatus: "PAID",
    status: { not: "CANCELLED" },
  };
  if (locationIds.length > 0) {
    whereClause.locationId = { in: locationIds };
  }

  // Get orders for the period
  const orders = await db.order.findMany({
    where: whereClause,
    select: {
      id: true,
      totalPrice: true,
      deliveryFee: true,
      subtotal: true,
      createdAt: true,
      status: true,
      items: {
        select: { quantity: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Total revenue
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
  const totalOrders = orders.length;
  const totalMeals = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );

  // Average order value
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Hourly breakdown for chart
  const hourlyData: { hour: number; orders: number; revenue: number }[] = [];
  for (let h = 0; h < 24; h++) {
    const hourOrders = orders.filter((o) => o.createdAt.getHours() === h);
    hourlyData.push({
      hour: h,
      orders: hourOrders.length,
      revenue: hourOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
    });
  }

  // Staff on shift (workers assigned to these locations)
  const staffCount =
    locationIds.length > 0
      ? await db.user.count({
          where: {
            locationId: { in: locationIds },
            role: { in: ["MANAGER", "WORKER"] },
            isActive: true,
          },
        })
      : 0;

  return {
    totalRevenue,
    totalOrders,
    totalMeals,
    avgOrderValue,
    staffCount,
    hourlyData,
    periodFrom: from.toISOString(),
    periodTo: to.toISOString(),
  };
}

// ============================================
// GET USER'S LOCATION ID HELPER
// ============================================

export async function getUserLocationId(): Promise<string | null> {
  const session = await auth();
  if (!session) return null;

  if (session.user.role === "OWNER") {
    const restaurant = await db.restaurant.findFirst({
      where: { ownerId: session.user.id },
      select: { locations: { select: { id: true }, take: 1 } },
    });
    return restaurant?.locations[0]?.id ?? null;
  }

  if (session.user.role === "MANAGER" || session.user.role === "WORKER") {
    return session.user.locationId ?? null;
  }

  return null;
}
