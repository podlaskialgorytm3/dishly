import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientOrders } from "@/actions/orders";
import ClientOrdersClient from "./ClientOrdersClient";

export default async function OrdersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const orders = await getClientOrders();

  return <ClientOrdersClient orders={orders} />;
}
