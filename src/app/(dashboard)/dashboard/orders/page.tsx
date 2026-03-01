import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getKitchenOrders,
  getLocationETASettings,
  getUserLocationId,
} from "@/actions/kitchen";
import LiveKitchenPanel from "./LiveKitchenPanel";

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

  const locationId = await getUserLocationId();
  const orders = await getKitchenOrders(locationId ?? undefined);
  const etaSettings = locationId
    ? await getLocationETASettings(locationId)
    : null;

  return (
    <LiveKitchenPanel
      initialOrders={orders}
      locationId={locationId}
      etaOffset={etaSettings?.etaOffsetMinutes ?? 0}
    />
  );
}
