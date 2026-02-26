import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getCuisineTypes,
  getRestaurantTags,
  getDishTags,
  getTagRequests,
} from "@/actions/admin/dictionaries";
import { DictionariesClient } from "./DictionariesClient";

export default async function DictionariesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [cuisineTypes, restaurantTags, dishTags, tagRequests] =
    await Promise.all([
      getCuisineTypes(),
      getRestaurantTags(),
      getDishTags(),
      getTagRequests(),
    ]);

  return (
    <main className="p-8">
      <DictionariesClient
        cuisineTypes={cuisineTypes}
        restaurantTags={restaurantTags}
        dishTags={dishTags}
        tagRequests={tagRequests as any}
      />
    </main>
  );
}
