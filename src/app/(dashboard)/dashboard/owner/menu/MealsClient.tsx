"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Flame,
  Leaf,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Scale,
  Zap,
} from "lucide-react";
import { toggleMealAvailability, deleteMeal } from "@/actions/owner/meals";
import { toast } from "sonner";

type MealVariant = {
  id: string;
  name: string;
  priceModifier: number;
  isAvailable: boolean;
};

type MealAddon = {
  id: string;
  name: string;
  price: number;
  isRequired: boolean;
  maxQuantity: number;
  isAvailable: boolean;
};

type MealLocation = {
  id: string;
  mealId: string;
  locationId: string;
  isAvailable: boolean;
  location: {
    id: string;
    name: string;
    city: string;
  };
};

type Meal = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  preparationTime: number;
  weight: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  spiceLevel: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  variants: MealVariant[];
  addons: MealAddon[];
  locations: MealLocation[];
};

type Location = {
  id: string;
  name: string;
  city: string;
};

type MealsClientProps = {
  meals: Meal[];
  locations: Location[];
  canAddMore: boolean;
};

export default function MealsClient({
  meals: initialMeals,
  locations,
  canAddMore,
}: MealsClientProps) {
  const [meals, setMeals] = useState(initialMeals);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [filterDietary, setFilterDietary] = useState<string | null>(null);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Pobierz unikalne kategorie z dań
  const categories = Array.from(
    new Map(meals.map((m) => [m.category.id, m.category])).values(),
  );

  // Filtrowanie dań
  const filteredMeals = meals.filter((meal) => {
    // Wyszukiwanie
    if (
      searchQuery &&
      !meal.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !meal.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filtr kategorii
    if (filterCategory && meal.category.id !== filterCategory) {
      return false;
    }

    // Filtr lokalizacji
    if (
      filterLocation &&
      !meal.locations.some((ml) => ml.locationId === filterLocation)
    ) {
      return false;
    }

    // Filtr dietetyczny
    if (filterDietary === "vegetarian" && !meal.isVegetarian) return false;
    if (filterDietary === "vegan" && !meal.isVegan) return false;
    if (filterDietary === "glutenFree" && !meal.isGlutenFree) return false;

    return true;
  });

  const handleToggleAvailability = async (id: string) => {
    try {
      const result = await toggleMealAvailability(id);
      if (result.success) {
        setMeals((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, isAvailable: result.isAvailable } : m,
          ),
        );
        toast.success(
          result.isAvailable ? "Danie jest teraz dostępne" : "Danie ukryte",
        );
      }
    } catch (error) {
      toast.error("Wystąpił błąd");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to danie?")) return;

    setIsDeleting(id);
    try {
      await deleteMeal(id);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      toast.success("Danie zostało usunięte");
    } catch (error: any) {
      toast.error(error.message || "Wystąpił błąd");
    } finally {
      setIsDeleting(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const renderSpiceLevel = (level: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <Flame
            key={i}
            className={`h-3 w-3 ${
              i < level ? "text-[#FF4D4F]" : "text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtry i wyszukiwarka */}
      <div className="flex flex-wrap items-center gap-4 rounded-[20px] border border-[#EEEEEE] bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8C8C]" />
          <Input
            placeholder="Szukaj dania..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-[#EEEEEE]"
          />
        </div>

        <select
          value={filterCategory || ""}
          onChange={(e) => setFilterCategory(e.target.value || null)}
          className="rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm text-[#1F1F1F] focus:border-[#FF4D4F] focus:outline-none"
        >
          <option value="">Wszystkie kategorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={filterLocation || ""}
          onChange={(e) => setFilterLocation(e.target.value || null)}
          className="rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm text-[#1F1F1F] focus:border-[#FF4D4F] focus:outline-none"
        >
          <option value="">Wszystkie lokalizacje</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} ({loc.city})
            </option>
          ))}
        </select>

        <select
          value={filterDietary || ""}
          onChange={(e) => setFilterDietary(e.target.value || null)}
          className="rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm text-[#1F1F1F] focus:border-[#FF4D4F] focus:outline-none"
        >
          <option value="">Filtry dietetyczne</option>
          <option value="vegetarian">Wegetariańskie</option>
          <option value="vegan">Wegańskie</option>
          <option value="glutenFree">Bezglutenowe</option>
        </select>
      </div>

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[16px] border border-[#EEEEEE] bg-white p-4">
          <div className="text-2xl font-bold text-[#1F1F1F]">
            {filteredMeals.length}
          </div>
          <div className="text-sm text-[#8C8C8C]">Dań ogółem</div>
        </div>
        <div className="rounded-[16px] border border-[#EEEEEE] bg-white p-4">
          <div className="text-2xl font-bold text-[#4CAF50]">
            {filteredMeals.filter((m) => m.isAvailable).length}
          </div>
          <div className="text-sm text-[#8C8C8C]">Dostępnych</div>
        </div>
        <div className="rounded-[16px] border border-[#EEEEEE] bg-white p-4">
          <div className="text-2xl font-bold text-[#FF9800]">
            {filteredMeals.filter((m) => !m.isAvailable).length}
          </div>
          <div className="text-sm text-[#8C8C8C]">Ukrytych</div>
        </div>
        <div className="rounded-[16px] border border-[#EEEEEE] bg-white p-4">
          <div className="text-2xl font-bold text-[#2196F3]">
            {filteredMeals.filter((m) => m.isVegetarian || m.isVegan).length}
          </div>
          <div className="text-sm text-[#8C8C8C]">Vege/Vegan</div>
        </div>
      </div>

      {/* Lista dań */}
      <div className="space-y-4">
        {filteredMeals.length === 0 ? (
          <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-8 text-center">
            <p className="text-[#8C8C8C]">Brak dań spełniających kryteria</p>
          </div>
        ) : (
          filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className={`rounded-[20px] border bg-white overflow-hidden transition-all ${
                meal.isAvailable
                  ? "border-[#EEEEEE]"
                  : "border-orange-200 bg-orange-50/30"
              }`}
            >
              {/* Główny wiersz */}
              <div className="flex items-center gap-4 p-4">
                {/* Obrazek */}
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F5F5F5]">
                  {meal.imageUrl ? (
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl">🍽️</div>
                  )}
                </div>

                {/* Informacje podstawowe */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#1F1F1F] truncate">
                      {meal.name}
                    </h3>
                    {meal.isVegan && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Vegan
                      </span>
                    )}
                    {meal.isVegetarian && !meal.isVegan && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Vege
                      </span>
                    )}
                    {meal.isGlutenFree && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        B/G
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#8C8C8C] line-clamp-1">
                    {meal.description || "Brak opisu"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#8C8C8C]">
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-[#FF4D4F]">
                        {formatPrice(meal.basePrice)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {meal.preparationTime} min
                    </span>
                    {meal.weight && (
                      <span className="flex items-center gap-1">
                        <Scale className="h-3 w-3" />
                        {meal.weight}g
                      </span>
                    )}
                    {meal.calories && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {meal.calories} kcal
                      </span>
                    )}
                    <span className="rounded bg-[#F5F5F5] px-2 py-0.5">
                      {meal.category.name}
                    </span>
                  </div>
                </div>

                {/* Lokalizacje */}
                <div className="hidden lg:flex flex-col items-end gap-1">
                  <span className="text-xs text-[#8C8C8C]">Dostępne w:</span>
                  <div className="flex items-center gap-1">
                    {meal.locations.slice(0, 3).map((ml) => (
                      <span
                        key={ml.id}
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          ml.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {ml.location.name}
                      </span>
                    ))}
                    {meal.locations.length > 3 && (
                      <span className="text-xs text-[#8C8C8C]">
                        +{meal.locations.length - 3}
                      </span>
                    )}
                    {meal.locations.length === 0 && (
                      <span className="text-xs text-orange-500">
                        Brak przypisań
                      </span>
                    )}
                  </div>
                </div>

                {/* Akcje */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleAvailability(meal.id)}
                    className={`h-9 w-9 rounded-xl ${
                      meal.isAvailable
                        ? "hover:bg-orange-50 hover:text-orange-600"
                        : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                    }`}
                    title={meal.isAvailable ? "Ukryj danie" : "Pokaż danie"}
                  >
                    {meal.isAvailable ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Link href={`/dashboard/owner/menu/${meal.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-[#FFF1F1] hover:text-[#FF4D4F]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(meal.id)}
                    disabled={isDeleting === meal.id}
                    className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setExpandedMealId(
                        expandedMealId === meal.id ? null : meal.id,
                      )
                    }
                    className="h-9 w-9 rounded-xl hover:bg-[#F5F5F5]"
                  >
                    {expandedMealId === meal.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Rozwinięte szczegóły */}
              {expandedMealId === meal.id && (
                <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] p-4">
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Informacje dietetyczne */}
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-[#1F1F1F]">
                        Wartości odżywcze
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#8C8C8C]">Kalorie:</span>
                          <span>{meal.calories ?? "—"} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C8C8C]">Białko (100g):</span>
                          <span>{meal.protein ?? "—"} g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C8C8C]">
                            Węglowodany (100g):
                          </span>
                          <span>{meal.carbs ?? "—"} g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C8C8C]">
                            Tłuszcze (100g):
                          </span>
                          <span>{meal.fat ?? "—"} g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8C8C8C]">Ostrość:</span>
                          {renderSpiceLevel(meal.spiceLevel)}
                        </div>
                      </div>
                    </div>

                    {/* Warianty */}
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-[#1F1F1F]">
                        Warianty ({meal.variants.length})
                      </h4>
                      {meal.variants.length > 0 ? (
                        <div className="space-y-2">
                          {meal.variants.map((v) => (
                            <div
                              key={v.id}
                              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                            >
                              <span
                                className={
                                  v.isAvailable
                                    ? "text-[#1F1F1F]"
                                    : "text-[#8C8C8C] line-through"
                                }
                              >
                                {v.name}
                              </span>
                              <span className="text-[#FF4D4F]">
                                {v.priceModifier >= 0 ? "+" : ""}
                                {formatPrice(v.priceModifier)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#8C8C8C]">Brak wariantów</p>
                      )}
                    </div>

                    {/* Dodatki */}
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-[#1F1F1F]">
                        Dodatki ({meal.addons.length})
                      </h4>
                      {meal.addons.length > 0 ? (
                        <div className="space-y-2">
                          {meal.addons.map((a) => (
                            <div
                              key={a.id}
                              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                            >
                              <div>
                                <span
                                  className={
                                    a.isAvailable
                                      ? "text-[#1F1F1F]"
                                      : "text-[#8C8C8C] line-through"
                                  }
                                >
                                  {a.name}
                                </span>
                                {a.isRequired && (
                                  <span className="ml-2 text-xs text-[#FF4D4F]">
                                    (wymagane)
                                  </span>
                                )}
                                {a.maxQuantity > 1 && (
                                  <span className="ml-1 text-xs text-[#8C8C8C]">
                                    max: {a.maxQuantity}
                                  </span>
                                )}
                              </div>
                              <span className="text-[#FF4D4F]">
                                +{formatPrice(a.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#8C8C8C]">Brak dodatków</p>
                      )}
                    </div>
                  </div>

                  {/* Lokalizacje (pełna lista) */}
                  <div className="mt-6 border-t border-[#EEEEEE] pt-4">
                    <h4 className="mb-3 text-sm font-semibold text-[#1F1F1F]">
                      Przypisane lokalizacje ({meal.locations.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {meal.locations.length > 0 ? (
                        meal.locations.map((ml) => (
                          <span
                            key={ml.id}
                            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm ${
                              ml.isAvailable
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <MapPin className="h-3 w-3" />
                            {ml.location.name} ({ml.location.city})
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-orange-500">
                          To danie nie jest przypisane do żadnej lokalizacji
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
