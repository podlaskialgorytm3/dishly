import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSubscriptionPlans } from "@/actions/admin/subscriptions";
import { SubscriptionsClient } from "./SubscriptionsClient";

export default async function SubscriptionsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const rawPlans = await getSubscriptionPlans();

  // Decimal is not serializable — convert to plain number before passing to Client
  const plans = rawPlans.map((p) => ({
    ...p,
    price: Number(p.price),
  }));

  return (
    <main className="p-8">
      <SubscriptionsClient plans={plans} />
    </main>
  );
}
