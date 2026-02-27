import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getMeal, getMeals, getCategories } from "@/actions/owner/meals";
import MealForm from "../MealForm";

export default async function EditMealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "OWNER" && session.user.role !== "MANAGER")
  )
    redirect("/dashboard");

  const { id } = await params;

  try {
    const [meal, { restaurant, limits }, categories] = await Promise.all([
      getMeal(id),
      getMeals(),
      getCategories(),
    ]);

    return (
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-bold text-[#1F1F1F]">Edytuj danie</h1>
            <p className="mt-1 text-sm text-[#8C8C8C]">
              {meal.name} • {meal.category.name}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <div className="mx-auto max-w-4xl">
            <MealForm
              meal={meal}
              categories={categories}
              locations={restaurant.locations}
              canAddMore={true}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
