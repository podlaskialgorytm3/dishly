import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMeals, getPendingMeals } from "@/actions/owner/meals";
import { Button } from "@/components/ui/button";
import {
  Plus,
  UtensilsCrossed,
  AlertCircle,
  Search,
  Filter,
  Clock,
} from "lucide-react";
import MealsClient from "./MealsClient";
import PendingMealsSection from "./PendingMealsSection";

export default async function MenuPage() {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "OWNER" && session.user.role !== "MANAGER")
  )
    redirect("/dashboard");

  const { meals, restaurant, limits } = await getMeals();
  const isOwner = session.user.role === "OWNER";

  // Pobierz oczekujące posiłki tylko dla Owner
  const pendingMeals = isOwner ? await getPendingMeals() : [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1F1F1F]">
                {isOwner ? "Zarządzanie Menu" : "Menu Restauracji"}
              </h1>
              {isOwner && (
                <p className="mt-1 text-sm text-[#8C8C8C]">
                  {limits.currentMealsCount} / {limits.maxMeals} dań w planie
                  {pendingMeals.length > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                      <Clock className="h-3 w-3" />
                      {pendingMeals.length} do zatwierdzenia
                    </span>
                  )}
                </p>
              )}
            </div>
            {isOwner &&
              (limits.canAddMore ? (
                <Link href="/dashboard/owner/menu/new">
                  <Button className="gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]">
                    <Plus className="h-4 w-4" />
                    Dodaj danie
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  Osiągnięto limit planu ({limits.maxMeals} dań)
                </div>
              ))}
          </div>

          {/* Subscription limit bar - tylko dla OWNER */}
          {isOwner && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-[#8C8C8C]">
                <span>Wykorzystanie planu</span>
                <span>
                  {limits.currentMealsCount}/{limits.maxMeals}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EEEEEE]">
                <div
                  className={`h-2 rounded-full transition-all ${
                    !limits.canAddMore ? "bg-[#FF4D4F]" : "bg-[#4CAF50]"
                  }`}
                  style={{
                    width: `${Math.min(
                      (limits.currentMealsCount / limits.maxMeals) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Pending meals section - tylko dla Owner */}
          {isOwner && pendingMeals.length > 0 && (
            <PendingMealsSection
              pendingMeals={pendingMeals}
              locations={restaurant.locations}
            />
          )}

          {/* Approved meals section */}
          {meals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#EEEEEE] bg-white px-8 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F1]">
                <UtensilsCrossed className="h-8 w-8 text-[#FF4D4F]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1F1F1F]">
                Brak dań w menu
              </h3>
              <p className="mt-2 max-w-sm text-sm text-[#8C8C8C]">
                {isOwner
                  ? "Dodaj pierwsze danie do menu swojej restauracji, aby klienci mogli składać zamówienia."
                  : "W menu nie ma jeszcze żadnych dań. Skontaktuj się z właścicielem restauracji."}
              </p>
              {isOwner && (
                <Link href="/dashboard/owner/menu/new" className="mt-6">
                  <Button className="gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]">
                    <Plus className="h-4 w-4" />
                    Dodaj pierwsze danie
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <MealsClient
              meals={meals}
              locations={restaurant.locations}
              canAddMore={limits.canAddMore}
              isOwner={isOwner}
            />
          )}
        </div>
      </div>
    </div>
  );
}
