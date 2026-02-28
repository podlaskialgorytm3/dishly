import OrderSuccessClient from "./OrderSuccessClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { id } = await params;
  return <OrderSuccessClient orderId={id} />;
}
