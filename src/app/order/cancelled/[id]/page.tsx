import OrderCancelledClient from "./OrderCancelledClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderCancelledPage({ params }: PageProps) {
  const { id } = await params;
  return <OrderCancelledClient orderId={id} />;
}
