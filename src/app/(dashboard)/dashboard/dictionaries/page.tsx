import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getCuisineTypes,
  getRestaurantTags,
  getDishTags,
  getCategories,
  getTagRequests,
} from "@/actions/admin/dictionaries";
import { DictionariesClient } from "./DictionariesClient";

export default async function DictionariesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [cuisineTypes, restaurantTags, dishTags, categories, tagRequests] =
    await Promise.all([
      getCuisineTypes(),
      getRestaurantTags(),
      getDishTags(),
      getCategories(),
      getTagRequests(),
    ]);

  return (
    <main className="p-8">
      <DictionariesClient
        cuisineTypes={cuisineTypes}
        restaurantTags={restaurantTags}
        dishTags={dishTags}
        categories={categories}
        tagRequests={tagRequests as any}
      />
    </main>
  );
}
