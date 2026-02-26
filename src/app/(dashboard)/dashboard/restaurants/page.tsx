import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllRestaurants } from "@/actions/admin/restaurants";
import { RestaurantsClient } from "./RestaurantsClient";

export default async function RestaurantsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const restaurants = await getAllRestaurants();

  return (
    <main className="p-8">
      <RestaurantsClient restaurants={restaurants as any} />
    </main>
  );
}
