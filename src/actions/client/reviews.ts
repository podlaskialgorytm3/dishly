"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export type ClientReview = {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  order?: {
    id: string;
    orderNumber: string;
  } | null;
};

export type ReviewInput = {
  orderId: string;
  restaurantId: string;
  rating: number;
  content?: string;
};

// ============================================
// CHECK IF USER CAN REVIEW ORDER
// ============================================

export async function canReviewOrder(orderId: string): Promise<{
  canReview: boolean;
  reason?: string;
  order?: {
    id: string;
    restaurantId: string;
    restaurantName: string;
    restaurantSlug: string;
  };
  existingReview?: {
    id: string;
    rating: number;
    content: string | null;
  };
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { canReview: false, reason: "Musisz być zalogowany" };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      status: true,
      location: {
        select: {
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return { canReview: false, reason: "Zamówienie nie istnieje" };
  }

  if (order.userId !== session.user.id) {
    return { canReview: false, reason: "To nie jest Twoje zamówienie" };
  }

  if (order.status !== "DELIVERED") {
    return {
      canReview: false,
      reason: "Możesz wystawić opinię tylko po dostarczeniu zamówienia",
    };
  }

  // Check for existing review from this user for this restaurant/order
  const existingReview = await db.review.findFirst({
    where: {
      userId: session.user.id,
      restaurantId: order.location.restaurant.id,
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    canReview: true,
    order: {
      id: order.id,
      restaurantId: order.location.restaurant.id,
      restaurantName: order.location.restaurant.name,
      restaurantSlug: order.location.restaurant.slug,
    },
    existingReview: existingReview
      ? {
          id: existingReview.id,
          rating: existingReview.rating,
          content: existingReview.content,
        }
      : undefined,
  };
}

// ============================================
// CREATE OR UPDATE REVIEW
// ============================================

export async function submitReview(input: ReviewInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Musisz być zalogowany" };
  }

  // Validate rating
  if (input.rating < 0 || input.rating > 5) {
    return { success: false, error: "Ocena musi być od 0 do 5" };
  }

  // Verify order ownership and status
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    select: {
      id: true,
      userId: true,
      status: true,
      location: {
        select: {
          restaurantId: true,
        },
      },
    },
  });

  if (!order) {
    return { success: false, error: "Zamówienie nie istnieje" };
  }

  if (order.userId !== session.user.id) {
    return { success: false, error: "To nie jest Twoje zamówienie" };
  }

  if (order.status !== "DELIVERED") {
    return {
      success: false,
      error: "Możesz wystawić opinię tylko po dostarczeniu zamówienia",
    };
  }

  if (order.location.restaurantId !== input.restaurantId) {
    return { success: false, error: "Nieprawidłowa restauracja" };
  }

  try {
    // Check if user already has a review for this restaurant
    const existingReview = await db.review.findFirst({
      where: {
        userId: session.user.id,
        restaurantId: input.restaurantId,
      },
    });

    if (existingReview) {
      // Update existing review
      await db.review.update({
        where: { id: existingReview.id },
        data: {
          rating: input.rating,
          content: input.content?.trim() || null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new review
      await db.review.create({
        data: {
          userId: session.user.id,
          restaurantId: input.restaurantId,
          rating: input.rating,
          content: input.content?.trim() || null,
        },
      });
    }

    // Revalidate paths
    revalidatePath(`/order/${input.orderId}`);
    revalidatePath(`/restauracja/${order.location.restaurantId}`);
    revalidatePath("/client/orders");

    return { success: true };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: "Nie udało się dodać opinii" };
  }
}

// ============================================
// GET CLIENT'S REVIEWS
// ============================================

export async function getClientReviews(): Promise<ClientReview[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const reviews = await db.review.findMany({
    where: { userId: session.user.id },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    restaurant: {
      id: r.restaurant.id,
      name: r.restaurant.name,
      slug: r.restaurant.slug,
      logoUrl: r.restaurant.logoUrl,
    },
  }));
}

// ============================================
// UPDATE CLIENT'S REVIEW
// ============================================

export async function updateClientReview(
  reviewId: string,
  rating: number,
  content?: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Musisz być zalogowany" };
  }

  if (rating < 0 || rating > 5) {
    return { success: false, error: "Ocena musi być od 0 do 5" };
  }

  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, restaurantId: true },
  });

  if (!review) {
    return { success: false, error: "Opinia nie istnieje" };
  }

  if (review.userId !== session.user.id) {
    return { success: false, error: "To nie jest Twoja opinia" };
  }

  try {
    await db.review.update({
      where: { id: reviewId },
      data: {
        rating,
        content: content?.trim() || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/client/reviews");

    return { success: true };
  } catch (error) {
    console.error("Error updating review:", error);
    return { success: false, error: "Nie udało się zaktualizować opinii" };
  }
}

// ============================================
// DELETE CLIENT'S REVIEW
// ============================================

export async function deleteClientReview(reviewId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Musisz być zalogowany" };
  }

  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { userId: true },
  });

  if (!review) {
    return { success: false, error: "Opinia nie istnieje" };
  }

  if (review.userId !== session.user.id) {
    return { success: false, error: "To nie jest Twoja opinia" };
  }

  try {
    await db.review.delete({ where: { id: reviewId } });

    revalidatePath("/client/reviews");

    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: "Nie udało się usunąć opinii" };
  }
}

// ============================================
// GET RESTAURANT REVIEWS (for Owner/Manager)
// ============================================

export async function getRestaurantReviews(restaurantId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const { role } = session.user;
  if (!["OWNER", "MANAGER", "ADMIN"].includes(role)) {
    return [];
  }

  let whereClause: Record<string, unknown> = { isVisible: true };

  if (role === "ADMIN") {
    // Admin can see all reviews, optionally filtered by restaurant
    if (restaurantId) {
      whereClause.restaurantId = restaurantId;
    }
    whereClause = {}; // Admin sees all, including hidden
    if (restaurantId) {
      whereClause.restaurantId = restaurantId;
    }
  } else if (role === "OWNER") {
    // Owner sees reviews for their restaurants
    const restaurants = await db.restaurant.findMany({
      where: { ownerId: session.user.id },
      select: { id: true },
    });
    const restaurantIds = restaurants.map((r) => r.id);

    if (restaurantId && restaurantIds.includes(restaurantId)) {
      whereClause.restaurantId = restaurantId;
    } else {
      whereClause.restaurantId = { in: restaurantIds };
    }
  } else if (role === "MANAGER") {
    // Manager sees reviews for their location's restaurant
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        locationId: true,
        workingAt: {
          select: { restaurantId: true },
        },
      },
    });

    if (user?.workingAt?.restaurantId) {
      whereClause.restaurantId = user.workingAt.restaurantId;
    } else {
      return [];
    }
  }

  const reviews = await db.review.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    isVisible: r.isVisible,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    user: {
      id: r.user.id,
      name:
        `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() || "Anonim",
      email: r.user.email,
    },
    restaurant: {
      id: r.restaurant.id,
      name: r.restaurant.name,
      slug: r.restaurant.slug,
    },
  }));
}

// ============================================
// TOGGLE REVIEW VISIBILITY (Admin only)
// ============================================

export async function toggleReviewVisibility(reviewId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Brak autoryzacji" };
  }

  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Brak uprawnień" };
  }

  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { isVisible: true },
  });

  if (!review) {
    return { success: false, error: "Opinia nie istnieje" };
  }

  try {
    await db.review.update({
      where: { id: reviewId },
      data: { isVisible: !review.isVisible },
    });

    revalidatePath("/dashboard/moderation");

    return { success: true, newVisibility: !review.isVisible };
  } catch (error) {
    console.error("Error toggling review visibility:", error);
    return {
      success: false,
      error: "Nie udało się zmienić widoczności opinii",
    };
  }
}

// ============================================
// DELETE REVIEW (Admin only)
// ============================================

export async function adminDeleteReview(reviewId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Brak autoryzacji" };
  }

  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Brak uprawnień" };
  }

  try {
    await db.review.delete({ where: { id: reviewId } });

    revalidatePath("/dashboard/moderation");

    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: "Nie udało się usunąć opinii" };
  }
}

// ============================================
// GET AVERAGE RATING FOR RESTAURANT
// ============================================

export async function getRestaurantAverageRating(restaurantId: string) {
  const reviews = await db.review.findMany({
    where: {
      restaurantId,
      isVisible: true,
    },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return { avgRating: 0, reviewCount: 0 };
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    avgRating: sum / reviews.length,
    reviewCount: reviews.length,
  };
}

// ============================================
// GET PUBLIC RESTAURANT REVIEWS
// ============================================

export type PublicReview = {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

export async function getPublicRestaurantReviews(
  restaurantId: string,
  limit: number = 10,
): Promise<{
  reviews: PublicReview[];
  stats: {
    avgRating: number;
    reviewCount: number;
    distribution: { rating: number; count: number }[];
  };
}> {
  const reviews = await db.review.findMany({
    where: {
      restaurantId,
      isVisible: true,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Calculate statistics
  const allReviews = await db.review.findMany({
    where: {
      restaurantId,
      isVisible: true,
    },
    select: { rating: true },
  });

  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
      : 0;

  // Calculate rating distribution
  const distribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: allReviews.filter((r) => r.rating === rating).length,
  }));

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      user: {
        firstName: r.user.firstName || "Anonim",
        lastName: r.user.lastName || "",
      },
    })),
    stats: {
      avgRating,
      reviewCount: allReviews.length,
      distribution,
    },
  };
}
