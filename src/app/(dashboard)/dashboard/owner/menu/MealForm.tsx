"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createMeal,
  updateMeal,
  type MealInput,
  type MealVariantInput,
  type MealAddonInput,
} from "@/actions/owner/meals";
import {
  UtensilsCrossed,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Scale,
  Flame,
  Leaf,
  Zap,
  Info,
  DollarSign,
  Image,
  Tag,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Location = {
  id: string;
  name: string;
  city: string;
};

type MealData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
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
  variants: {
    id: string;
    name: string;
    priceModifier: number;
    isAvailable: boolean;
  }[];
  addons: {
    id: string;
    name: string;
    price: number;
    isRequired: boolean;
    maxQuantity: number;
    isAvailable: boolean;
  }[];
  locationIds: string[];
};

type MealFormProps = {
  meal?: MealData;
  categories: Category[];
  locations: Location[];
  canAddMore: boolean;
};

export default function MealForm({
  meal,
  categories,
  locations,
  canAddMore,
}: MealFormProps) {
  const router = useRouter();
  const isEdit = !!meal;

  // Stan formularza
  const [form, setForm] = useState({
    name: meal?.name ?? "",
    description: meal?.description ?? "",
    imageUrl: meal?.imageUrl ?? "",
    categoryId: meal?.categoryId ?? "",
    basePrice: meal?.basePrice?.toFixed(2) ?? "",
    preparationTime: meal?.preparationTime?.toString() ?? "",
    weight: meal?.weight?.toString() ?? "",
    calories: meal?.calories?.toString() ?? "",
    protein: meal?.protein?.toFixed(2) ?? "",
    carbs: meal?.carbs?.toFixed(2) ?? "",
    fat: meal?.fat?.toFixed(2) ?? "",
    spiceLevel: meal?.spiceLevel ?? 0,
    isAvailable: meal?.isAvailable ?? true,
    isVegetarian: meal?.isVegetarian ?? false,
    isVegan: meal?.isVegan ?? false,
    isGlutenFree: meal?.isGlutenFree ?? false,
  });

  const [variants, setVariants] = useState<MealVariantInput[]>(
    meal?.variants.map((v) => ({
      name: v.name,
      priceModifier: v.priceModifier,
      isAvailable: v.isAvailable,
    })) ?? [],
  );

  const [addons, setAddons] = useState<MealAddonInput[]>(
    meal?.addons.map((a) => ({
      name: a.name,
      price: a.price,
      isRequired: a.isRequired,
      maxQuantity: a.maxQuantity,
      isAvailable: a.isAvailable,
    })) ?? [],
  );

  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(
    meal?.locationIds ?? locations.map((l) => l.id), // Domyślnie wszystkie
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sekcje rozwijane
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    nutrition: true,
    variants: true,
    addons: true,
    locations: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Warianty
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { name: "", priceModifier: 0, isAvailable: true },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof MealVariantInput,
    value: any,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  // Dodatki
  const addAddon = () => {
    setAddons((prev) => [
      ...prev,
      {
        name: "",
        price: 0,
        isRequired: false,
        maxQuantity: 1,
        isAvailable: true,
      },
    ]);
  };

  const removeAddon = (index: number) => {
    setAddons((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAddon = (
    index: number,
    field: keyof MealAddonInput,
    value: any,
  ) => {
    setAddons((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  };

  // Lokalizacje
  const toggleLocation = (locationId: string) => {
    setSelectedLocationIds((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId],
    );
  };

  const selectAllLocations = () => {
    setSelectedLocationIds(locations.map((l) => l.id));
  };

  const deselectAllLocations = () => {
    setSelectedLocationIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Walidacja
    if (!form.categoryId) {
      setError("Wybierz kategorię");
      setLoading(false);
      return;
    }

    if (!form.name || !form.basePrice || !form.preparationTime) {
      setError("Wypełnij wszystkie wymagane pola");
      setLoading(false);
      return;
    }

    // Filtruj puste warianty
    const validVariants = variants.filter((v) => v.name.trim());
    const validAddons = addons.filter((a) => a.name.trim());

    const data: MealInput = {
      name: form.name,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      categoryId: form.categoryId,
      basePrice: parseFloat(form.basePrice),
      preparationTime: parseInt(form.preparationTime),
      weight: form.weight ? parseInt(form.weight) : undefined,
      calories: form.calories ? parseInt(form.calories) : undefined,
      protein: form.protein ? parseFloat(form.protein) : undefined,
      carbs: form.carbs ? parseFloat(form.carbs) : undefined,
      fat: form.fat ? parseFloat(form.fat) : undefined,
      spiceLevel: form.spiceLevel,
      isAvailable: form.isAvailable,
      isVegetarian: form.isVegetarian,
      isVegan: form.isVegan,
      isGlutenFree: form.isGlutenFree,
      locationIds: selectedLocationIds,
      variants: validVariants,
      addons: validAddons,
    };

    try {
      if (isEdit) {
        await updateMeal(meal.id, data);
        toast.success("Danie zaktualizowane");
      } else {
        await createMeal(data);
        toast.success("Danie dodane");
        router.push("/dashboard/owner/menu");
      }
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Wystąpił błąd");
      toast.error(e.message || "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: string) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(parseFloat(value) || 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Nie można dodać więcej */}
      {!isEdit && !canAddMore && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <strong>Limit osiągnięty!</strong> Twój plan subskrypcji nie pozwala
          na dodanie więcej dań. Ulepsz plan, aby kontynuować.
        </div>
      )}

      {/* Sekcja 1: Dane podstawowe */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("basic")}
          className="flex w-full items-center justify-between p-6 text-left hover:bg-[#FAFAFA] transition-colors"
        >
          <h2 className="flex items-center gap-2 font-semibold text-[#1F1F1F]">
            <UtensilsCrossed className="h-5 w-5 text-[#FF4D4F]" />
            Informacje podstawowe
          </h2>
          {expandedSections.basic ? (
            <ChevronUp className="h-5 w-5 text-[#8C8C8C]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#8C8C8C]" />
          )}
        </button>

        {expandedSections.basic && (
          <div className="border-t border-[#EEEEEE] p-6 pt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1F1F1F]">
                  Nazwa dania *
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="np. Pizza Margherita"
                  required
                  className="rounded-xl border-[#EEEEEE]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1F1F1F]">
                  Kategoria *
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm focus:border-[#FF4D4F] focus:outline-none"
                >
                  <option value="">Wybierz kategorię</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F1F1F]">Opis</label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Opisz składniki i szczegóły dania..."
                rows={3}
                className="rounded-xl border-[#EEEEEE]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1F1F1F]">
                URL zdjęcia
              </label>
              <div className="flex gap-2">
                <Input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="rounded-xl border-[#EEEEEE]"
                />
                {form.imageUrl && (
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1F1F1F]">
                  Cena bazowa (PLN) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8C8C]" />
                  <Input
                    name="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.basePrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    className="rounded-xl border-[#EEEEEE] pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1F1F1F]">
                  Czas przygotowania (min) *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8C8C]" />
                  <Input
                    name="preparationTime"
                    type="number"
                    min="1"
                    value={form.preparationTime}
                    onChange={handleChange}
                    placeholder="15"
                    required
                    className="rounded-xl border-[#EEEEEE] pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1F1F1F]">
                  Gramatura (g)
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8C8C]" />
                  <Input
                    name="weight"
                    type="number"
                    min="0"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="300"
                    className="rounded-xl border-[#EEEEEE] pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Oznaczenia specjalne */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#1F1F1F]">
                Oznaczenia specjalne
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#EEEEEE] px-4 py-2 hover:border-green-300 transition-colors has-[:checked]:bg-green-50 has-[:checked]:border-green-400">
                  <input
                    type="checkbox"
                    name="isVegetarian"
                    checked={form.isVegetarian}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Wegetariańskie</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#EEEEEE] px-4 py-2 hover:border-green-300 transition-colors has-[:checked]:bg-green-50 has-[:checked]:border-green-400">
                  <input
                    type="checkbox"
                    name="isVegan"
                    checked={form.isVegan}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Wegańskie</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#EEEEEE] px-4 py-2 hover:border-blue-300 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                  <input
                    type="checkbox"
                    name="isGlutenFree"
                    checked={form.isGlutenFree}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Bezglutenowe</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#EEEEEE] px-4 py-2 hover:border-[#FF4D4F] transition-colors has-[:checked]:bg-green-50 has-[:checked]:border-green-400">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={form.isAvailable}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-[#FF4D4F] focus:ring-[#FF4D4F]"
                  />
                  <span className="text-sm">Dostępne w menu</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sekcja 2: Profil dietetyczny */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("nutrition")}
          className="flex w-full items-center justify-between p-6 text-left hover:bg-[#FAFAFA] transition-colors"
        >
          <h2 className="flex items-center gap-2 font-semibold text-[#1F1F1F]">
            <Zap className="h-5 w-5 text-[#FF4D4F]" />
            Profil dietetyczny i zdrowotny
          </h2>
          {expandedSections.nutrition ? (
            <ChevronUp className="h-5 w-5 text-[#8C8C8C]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#8C8C8C]" />
          )}
        </button>

        {expandedSections.nutrition && (
          <div className="border-t border-[#EEEEEE] p-6 pt-4 space-y-4">
            <p className="text-sm text-[#8C8C8C]">
              Podaj wartości odżywcze na 100g produktu
            </p>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1F1F1F]">
                  Kalorie (kcal)
                </label>
                <Input
                  name="calories"
                  type="number"
                  min="0"
                  value={form.calories}
                  onChange={handleChange}
                  placeholder="450"
                  className="rounded-xl border-[#EEEEEE]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1F1F1F]">
                  Białko (g/100g)
                </label>
                <Input
                  name="protein"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.protein}
                  onChange={handleChange}
                  placeholder="12.5"
                  className="rounded-xl border-[#EEEEEE]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1F1F1F]">
                  Węglowodany (g/100g)
                </label>
                <Input
                  name="carbs"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.carbs}
                  onChange={handleChange}
                  placeholder="35.0"
                  className="rounded-xl border-[#EEEEEE]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1F1F1F]">
                  Tłuszcze (g/100g)
                </label>
                <Input
                  name="fat"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.fat}
                  onChange={handleChange}
                  placeholder="8.5"
                  className="rounded-xl border-[#EEEEEE]"
                />
              </div>
            </div>

            {/* Poziom ostrości */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#1F1F1F]">
                Poziom ostrości (0-9)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  name="spiceLevel"
                  min="0"
                  max="9"
                  value={form.spiceLevel}
                  onChange={handleChange}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#FF4D4F]"
                />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Flame
                      key={i}
                      className={`h-4 w-4 ${
                        i < form.spiceLevel ? "text-[#FF4D4F]" : "text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-[#1F1F1F]">
                    {form.spiceLevel}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#8C8C8C]">
                0 = brak ostrości, 9 = bardzo ostre
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sekcja 3: Warianty */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("variants")}
          className="flex w-full items-center justify-between p-6 text-left hover:bg-[#FAFAFA] transition-colors"
        >
          <h2 className="flex items-center gap-2 font-semibold text-[#1F1F1F]">
            <Tag className="h-5 w-5 text-[#FF4D4F]" />
            Warianty (rozmiary)
            <span className="ml-2 text-sm font-normal text-[#8C8C8C]">
              ({variants.length})
            </span>
          </h2>
          {expandedSections.variants ? (
            <ChevronUp className="h-5 w-5 text-[#8C8C8C]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#8C8C8C]" />
          )}
        </button>

        {expandedSections.variants && (
          <div className="border-t border-[#EEEEEE] p-6 pt-4 space-y-4">
            <p className="text-sm text-[#8C8C8C]">
              Dodaj warianty rozmiaru, np. Mała, Średnia, Duża. Modyfikator ceny
              będzie dodany do ceny bazowej.
            </p>

            {variants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#EEEEEE] p-6 text-center">
                <p className="text-sm text-[#8C8C8C]">Brak wariantów</p>
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-[#EEEEEE] p-3"
                  >
                    <Input
                      value={variant.name}
                      onChange={(e) =>
                        updateVariant(index, "name", e.target.value)
                      }
                      placeholder="np. Duża 42cm"
                      className="flex-1 rounded-xl border-[#EEEEEE]"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-[#8C8C8C]">+</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.priceModifier}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "priceModifier",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-24 rounded-xl border-[#EEEEEE]"
                      />
                      <span className="text-sm text-[#8C8C8C]">PLN</span>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={variant.isAvailable}
                        onChange={(e) =>
                          updateVariant(index, "isAvailable", e.target.checked)
                        }
                        className="rounded"
                      />
                      <span className="text-xs text-[#8C8C8C]">Aktywny</span>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(index)}
                      className="h-8 w-8 rounded-xl hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={addVariant}
              className="gap-2 rounded-xl border-dashed"
            >
              <Plus className="h-4 w-4" />
              Dodaj wariant
            </Button>
          </div>
        )}
      </div>

      {/* Sekcja 4: Dodatki */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("addons")}
          className="flex w-full items-center justify-between p-6 text-left hover:bg-[#FAFAFA] transition-colors"
        >
          <h2 className="flex items-center gap-2 font-semibold text-[#1F1F1F]">
            <Plus className="h-5 w-5 text-[#FF4D4F]" />
            Dodatki
            <span className="ml-2 text-sm font-normal text-[#8C8C8C]">
              ({addons.length})
            </span>
          </h2>
          {expandedSections.addons ? (
            <ChevronUp className="h-5 w-5 text-[#8C8C8C]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#8C8C8C]" />
          )}
        </button>

        {expandedSections.addons && (
          <div className="border-t border-[#EEEEEE] p-6 pt-4 space-y-4">
            <p className="text-sm text-[#8C8C8C]">
              Dodaj opcjonalne dodatki do dania, np. extra ser, sosy.
            </p>

            {addons.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#EEEEEE] p-6 text-center">
                <p className="text-sm text-[#8C8C8C]">Brak dodatków</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addons.map((addon, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[#EEEEEE] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Input
                        value={addon.name}
                        onChange={(e) =>
                          updateAddon(index, "name", e.target.value)
                        }
                        placeholder="np. Extra ser"
                        className="flex-1 rounded-xl border-[#EEEEEE]"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-[#8C8C8C]">+</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={addon.price}
                          onChange={(e) =>
                            updateAddon(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-24 rounded-xl border-[#EEEEEE]"
                        />
                        <span className="text-sm text-[#8C8C8C]">PLN</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAddon(index)}
                        className="h-8 w-8 rounded-xl hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addon.isRequired}
                          onChange={(e) =>
                            updateAddon(index, "isRequired", e.target.checked)
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-[#8C8C8C]">Wymagane</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#8C8C8C]">
                          Max ilość:
                        </span>
                        <Input
                          type="number"
                          min="1"
                          value={addon.maxQuantity}
                          onChange={(e) =>
                            updateAddon(
                              index,
                              "maxQuantity",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-16 rounded-xl border-[#EEEEEE]"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addon.isAvailable}
                          onChange={(e) =>
                            updateAddon(index, "isAvailable", e.target.checked)
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-[#8C8C8C]">Aktywny</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={addAddon}
              className="gap-2 rounded-xl border-dashed"
            >
              <Plus className="h-4 w-4" />
              Dodaj dodatek
            </Button>
          </div>
        )}
      </div>

      {/* Sekcja 5: Lokalizacje */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("locations")}
          className="flex w-full items-center justify-between p-6 text-left hover:bg-[#FAFAFA] transition-colors"
        >
          <h2 className="flex items-center gap-2 font-semibold text-[#1F1F1F]">
            <MapPin className="h-5 w-5 text-[#FF4D4F]" />
            Przypisanie do lokalizacji
            <span className="ml-2 text-sm font-normal text-[#8C8C8C]">
              ({selectedLocationIds.length}/{locations.length})
            </span>
          </h2>
          {expandedSections.locations ? (
            <ChevronUp className="h-5 w-5 text-[#8C8C8C]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#8C8C8C]" />
          )}
        </button>

        {expandedSections.locations && (
          <div className="border-t border-[#EEEEEE] p-6 pt-4 space-y-4">
            <p className="text-sm text-[#8C8C8C]">
              Wybierz lokalizacje, w których to danie będzie dostępne.
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAllLocations}
                className="rounded-xl"
              >
                Zaznacz wszystkie
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={deselectAllLocations}
                className="rounded-xl"
              >
                Odznacz wszystkie
              </Button>
            </div>

            {locations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50 p-6 text-center">
                <p className="text-sm text-orange-700">
                  Nie masz jeszcze żadnych lokalizacji. Dodaj lokalizację, aby
                  móc przypisywać dania.
                </p>
                <Link href="/dashboard/owner/locations/new">
                  <Button className="mt-4 gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]">
                    <Plus className="h-4 w-4" />
                    Dodaj lokalizację
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {locations.map((location) => (
                  <label
                    key={location.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                      selectedLocationIds.includes(location.id)
                        ? "border-green-400 bg-green-50"
                        : "border-[#EEEEEE] hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                        selectedLocationIds.includes(location.id)
                          ? "bg-green-500"
                          : "border border-gray-300"
                      }`}
                    >
                      {selectedLocationIds.includes(location.id) && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedLocationIds.includes(location.id)}
                      onChange={() => toggleLocation(location.id)}
                      className="sr-only"
                    />
                    <div>
                      <div className="font-medium text-[#1F1F1F]">
                        {location.name}
                      </div>
                      <div className="text-xs text-[#8C8C8C]">
                        {location.city}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {selectedLocationIds.length === 0 && locations.length > 0 && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
                ⚠️ Danie nie jest przypisane do żadnej lokalizacji i nie będzie
                widoczne dla klientów.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Przyciski akcji */}
      <div className="flex items-center justify-between rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <Link href="/dashboard/owner/menu">
          <Button
            type="button"
            variant="ghost"
            className="gap-2 rounded-xl text-[#8C8C8C] hover:text-[#1F1F1F]"
          >
            <ArrowLeft className="h-4 w-4" />
            Anuluj
          </Button>
        </Link>

        <Button
          type="submit"
          disabled={loading || (!isEdit && !canAddMore)}
          className="gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading
            ? "Zapisywanie..."
            : isEdit
              ? "Zapisz zmiany"
              : "Dodaj danie"}
        </Button>
      </div>
    </form>
  );
}
