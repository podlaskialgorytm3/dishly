import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientAddresses } from "@/actions/client/addresses";
import DeliverySettingsClient from "./DeliverySettingsClient";

export default async function DeliverySettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const addresses = await getClientAddresses();

  return <DeliverySettingsClient addresses={addresses} />;
}
