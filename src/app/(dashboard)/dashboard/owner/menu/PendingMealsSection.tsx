"use client";

import { useState } from "react";
import { approveMeal, rejectMeal } from "@/actions/owner/meals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Check,
  X,
  User,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type PendingMeal = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  category: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  locations: Array<{
    location: {
      id: string;
      name: string;
      city: string;
    };
  }>;
  createdAt: Date;
  variants?: Array<{ name: string; priceModifier: number }>;
  addons?: Array<{ name: string; price: number }>;
};

type PendingMealsSectionProps = {
  pendingMeals: PendingMeal[];
  locations: Array<{ id: string; name: string; city: string }>;
};

export default function PendingMealsSection({
  pendingMeals,
  locations,
}: PendingMealsSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  const handleApprove = async (mealId: string, mealName: string) => {
    try {
      setLoading(mealId);
      await approveMeal(mealId);
      toast.success(`Posiłek "${mealName}" został zatwierdzony`);
      router.refresh();
    } catch (error) {
      toast.error("Wystąpił błąd podczas zatwierdzania posiłku");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (mealId: string, mealName: string) => {
    try {
      setLoading(mealId);
      await rejectMeal(mealId, rejectionNote || undefined);
      toast.success(`Posiłek "${mealName}" został odrzucony`);
      setShowRejectForm(null);
      setRejectionNote("");
      router.refresh();
    } catch (error) {
      toast.error("Wystąpił błąd podczas odrzucania posiłku");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const toggleExpand = (mealId: string) => {
    setExpandedMeal(expandedMeal === mealId ? null : mealId);
  };

  return (
    <div className="rounded-[20px] border border-orange-200 bg-orange-50/50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
          <Clock className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#1F1F1F]">
            Posiłki do zatwierdzenia
          </h2>
          <p className="text-sm text-[#8C8C8C]">
            {pendingMeals.length}{" "}
            {pendingMeals.length === 1
              ? "posiłek oczekuje"
              : "posiłków oczekuje"}{" "}
            na Twoją akceptację
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {pendingMeals.map((meal) => {
          const isExpanded = expandedMeal === meal.id;
          const isRejecting = showRejectForm === meal.id;

          return (
            <div
              key={meal.id}
              className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#F5F5F5]">
                  {meal.imageUrl ? (
                    <Image
                      src={meal.imageUrl}
                      alt={meal.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#CCCCCC]">
                      <DollarSign className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[#1F1F1F]">
                        {meal.name}
                      </h3>
                      <p className="mt-1 text-sm text-[#8C8C8C]">
                        {meal.category.name} • {meal.basePrice.toFixed(2)} zł
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700"
                    >
                      Oczekujące
                    </Badge>
                  </div>

                  {/* Creator info */}
                  {meal.creator && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#8C8C8C]">
                      <User className="h-4 w-4" />
                      <span>
                        Dodane przez: {meal.creator.name || meal.creator.email}
                      </span>
                    </div>
                  )}

                  {/* Locations */}
                  {meal.locations.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#8C8C8C]">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {meal.locations
                          .map((ml) => ml.location.name)
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Description preview */}
                  {meal.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-[#8C8C8C]">
                      {meal.description}
                    </p>
                  )}

                  {/* Expand button */}
                  {(meal.variants && meal.variants.length > 0) ||
                  (meal.addons && meal.addons.length > 0) ? (
                    <button
                      onClick={() => toggleExpand(meal.id)}
                      className="mt-2 flex items-center gap-1 text-sm text-[#FF4D4F] hover:underline"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Zwiń szczegóły
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Rozwiń szczegóły
                        </>
                      )}
                    </button>
                  ) : null}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-[#EEEEEE] pt-4">
                      {meal.variants && meal.variants.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-[#1F1F1F]">
                            Warianty:
                          </h4>
                          <ul className="mt-1 space-y-1 text-sm text-[#8C8C8C]">
                            {meal.variants.map((variant, idx) => (
                              <li key={idx}>
                                • {variant.name} (
                                {variant.priceModifier >= 0 ? "+" : ""}
                                {variant.priceModifier.toFixed(2)} zł)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {meal.addons && meal.addons.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-[#1F1F1F]">
                            Dodatki:
                          </h4>
                          <ul className="mt-1 space-y-1 text-sm text-[#8C8C8C]">
                            {meal.addons.map((addon, idx) => (
                              <li key={idx}>
                                • {addon.name} (+{addon.price.toFixed(2)} zł)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-4 flex gap-2">
                    {!isRejecting ? (
                      <>
                        <Button
                          onClick={() => handleApprove(meal.id, meal.name)}
                          disabled={loading === meal.id}
                          className="gap-2 rounded-lg bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                          Zatwierdź
                        </Button>
                        <Button
                          onClick={() => setShowRejectForm(meal.id)}
                          disabled={loading === meal.id}
                          variant="outline"
                          className="gap-2 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                          Odrzuć
                        </Button>
                      </>
                    ) : (
                      <div className="flex-1 space-y-2">
                        <textarea
                          value={rejectionNote}
                          onChange={(e) => setRejectionNote(e.target.value)}
                          placeholder="Opcjonalnie: Podaj powód odrzucenia..."
                          className="w-full rounded-lg border border-[#EEEEEE] p-2 text-sm focus:border-[#FF4D4F] focus:outline-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReject(meal.id, meal.name)}
                            disabled={loading === meal.id}
                            className="gap-2 rounded-lg bg-red-600 hover:bg-red-700"
                          >
                            Potwierdź odrzucenie
                          </Button>
                          <Button
                            onClick={() => {
                              setShowRejectForm(null);
                              setRejectionNote("");
                            }}
                            variant="outline"
                            className="rounded-lg"
                          >
                            Anuluj
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
