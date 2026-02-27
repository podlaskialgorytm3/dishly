import { getOrderTracking } from "@/actions/orders";
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

  return <OrderTrackingClient order={order} />;
}
