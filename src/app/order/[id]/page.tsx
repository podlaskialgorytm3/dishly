import { getOrderTracking } from "@/actions/orders";
import { canReviewOrder } from "@/actions/client/reviews";
import { notFound } from "next/navigation";
import OrderTrackingClient from "./OrderTrackingClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderTracking(id);

  if (!order) {
    notFound();
  }

  // Check if user can review this order
  const reviewStatus = await canReviewOrder(id);

  return (
    <OrderTrackingClient
      order={order}
      canReview={reviewStatus.canReview}
      existingReview={reviewStatus.existingReview}
    />
  );
}
