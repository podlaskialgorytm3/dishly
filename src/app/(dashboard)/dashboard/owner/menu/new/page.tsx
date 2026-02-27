import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMeals, getCategories } from "@/actions/owner/meals";
import MealForm from "../MealForm";

export default async function NewMealPage() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") redirect("/dashboard");

  const [{ restaurant, limits }, categories] = await Promise.all([
    getMeals(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-[#1F1F1F]">
            Dodaj nowe danie
          </h1>
          <p className="mt-1 text-sm text-[#8C8C8C]">
            Uzupełnij informacje o daniu, wartościach odżywczych i przypisz do
            lokalizacji
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <MealForm
            categories={categories}
            locations={restaurant.locations}
            canAddMore={limits.canAddMore}
          />
        </div>
      </div>
    </div>
  );
}
