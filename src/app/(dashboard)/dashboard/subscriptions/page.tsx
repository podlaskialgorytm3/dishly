import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSubscriptionPlans } from "@/actions/admin/subscriptions";
import { SubscriptionsClient } from "./SubscriptionsClient";

export default async function SubscriptionsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const plans = await getSubscriptionPlans();

  return (
    <main className="p-8">
      <SubscriptionsClient plans={plans as any} />
    </main>
  );
}
