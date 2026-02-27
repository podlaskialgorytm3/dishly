import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocationOrders } from "@/actions/orders";
import OrdersDashboardClient from "./OrdersDashboardClient";

export default async function OrdersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Sprawdź czy użytkownik ma uprawnienia (MANAGER, WORKER, OWNER, ADMIN)
  const hasAccess =
    session.user.role === "MANAGER" ||
    session.user.role === "WORKER" ||
    session.user.role === "OWNER" ||
    session.user.role === "ADMIN";

  if (!hasAccess) {
    redirect("/dashboard");
  }

  const orders = await getLocationOrders();

  return <OrdersDashboardClient initialOrders={orders} />;
}
