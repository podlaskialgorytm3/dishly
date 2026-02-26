import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllRestaurants } from "@/actions/admin/restaurants";
import { getSubscriptionPlans } from "@/actions/admin/subscriptions";
import { RestaurantsClient } from "./RestaurantsClient";

export default async function RestaurantsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [rawRestaurants, rawPlans] = await Promise.all([
    getAllRestaurants(),
    getSubscriptionPlans(),
  ]);

  // Convert Decimal to number for serialization
  const restaurants = rawRestaurants.map((r) => ({
    ...r,
    subscriptions: r.subscriptions.map((s) => ({
      ...s,
      plan: { ...s.plan, price: Number(s.plan.price) },
    })),
  }));

  const plans = rawPlans.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    interval: p.interval,
    isActive: p.isActive,
  }));

  return (
    <main className="p-8">
      <RestaurantsClient restaurants={restaurants as any} plans={plans} />
    </main>
  );
}
