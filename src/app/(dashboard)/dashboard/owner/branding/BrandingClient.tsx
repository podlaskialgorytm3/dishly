"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBranding, submitTagRequest } from "@/actions/owner/branding";
import {
  Image,
  Tag,
  UtensilsCrossed,
  Save,
  Plus,
  Check,
  X,
  Send,
} from "lucide-react";

type CuisineType = { id: string; name: string };
type RestaurantTag = { id: string; name: string };

type RestaurantData = {
  id: string;
  name: string;
  bio: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  cuisineTypeIds: string[];
  tagIds: string[];
};

export default function BrandingClient({
  restaurant,
  allCuisineTypes,
  allTags,
}: {
  restaurant: RestaurantData;
  allCuisineTypes: CuisineType[];
  allTags: RestaurantTag[];
}) {
  const [logoUrl, setLogoUrl] = useState(restaurant.logoUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(restaurant.coverImageUrl ?? "");
  const [bio, setBio] = useState(restaurant.bio ?? "");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    restaurant.cuisineTypeIds,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(restaurant.tagIds);
  const [saving, setSaving] = useState(false);

  // Tag request
  const [reqName, setReqName] = useState("");
  const [reqType, setReqType] = useState<"CUISINE" | "AMENITY">("CUISINE");
  const [sending, setSending] = useState(false);

  const toggleCuisine = (id: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBranding({
        logoUrl: logoUrl || undefined,
        coverImageUrl: coverUrl || undefined,
        bio,
        cuisineTypeIds: selectedCuisines,
        tagIds: selectedTags,
      });
      toast.success("Branding zapisany");
    } catch (e: any) {
      toast.error(e.message || "Błąd podczas zapisywania");
    } finally {
      setSaving(false);
    }
  };

  const handleTagRequest = async () => {
    if (!reqName.trim()) {
      toast.error("Wpisz nazwę");
      return;
    }
    setSending(true);
    try {
      await submitTagRequest({ name: reqName.trim(), type: reqType });
      toast.success("Zgłoszenie wysłane do administratora");
      setReqName("");
    } catch (e: any) {
      toast.error(e.message || "Błąd podczas wysyłania zgłoszenia");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Identyfikacja wizualna */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1F1F1F]">
          <Image className="h-5 w-5 text-[#FF4D4F]" />
          Identyfikacja wizualna
        </h2>
        <div className="space-y-4">
          {/* Logo preview */}
          {logoUrl && (
            <div className="flex items-center gap-4">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-16 w-16 rounded-xl object-cover border border-[#EEEEEE]"
                onError={() => {}}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLogoUrl("")}
                className="text-red-500 hover:text-red-600"
              >
                <X className="mr-1 h-4 w-4" /> Usuń logo
              </Button>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F1F1F]">
              URL Logo
            </label>
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="rounded-xl border-[#EEEEEE]"
            />
            <p className="text-xs text-[#8C8C8C]">
              Wklej URL obrazka logo Twojej restauracji
            </p>
          </div>

          {/* Cover preview */}
          {coverUrl && (
            <div>
              <img
                src={coverUrl}
                alt="Cover"
                className="h-32 w-full rounded-xl object-cover border border-[#EEEEEE]"
                onError={() => {}}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F1F1F]">
              URL Zdjęcia głównego (cover)
            </label>
            <Input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="rounded-xl border-[#EEEEEE]"
            />
            <p className="text-xs text-[#8C8C8C]">
              Baner główny wyświetlany na stronie restauracji
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1F1F1F]">
              Opis restauracji
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Krótki opis Twojej restauracji..."
              className="w-full rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#FF4D4F] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/20"
            />
          </div>
        </div>
      </div>

      {/* Rodzaj kuchni */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1F1F1F]">
          <UtensilsCrossed className="h-5 w-5 text-[#FF4D4F]" />
          Rodzaj kuchni
        </h2>
        {allCuisineTypes.length === 0 ? (
          <p className="text-sm text-[#8C8C8C]">
            Brak dostępnych typów kuchni. Możesz zgłosić nowy poniżej.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allCuisineTypes.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCuisine(c.id)}
                className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all ${
                  selectedCuisines.includes(c.id)
                    ? "border-[#FF4D4F] bg-[#FFF1F1] text-[#FF4D4F]"
                    : "border-[#EEEEEE] text-[#1F1F1F] hover:border-[#FF4D4F]/50"
                }`}
              >
                {selectedCuisines.includes(c.id) && (
                  <Check className="h-3.5 w-3.5" />
                )}
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tagi / amenities */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1F1F1F]">
          <Tag className="h-5 w-5 text-[#FF4D4F]" />
          Etykiety i udogodnienia
        </h2>
        {allTags.length === 0 ? (
          <p className="text-sm text-[#8C8C8C]">
            Brak dostępnych etykiet. Możesz zgłosić nową poniżej.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all ${
                  selectedTags.includes(t.id)
                    ? "border-[#FF4D4F] bg-[#FFF1F1] text-[#FF4D4F]"
                    : "border-[#EEEEEE] text-[#1F1F1F] hover:border-[#FF4D4F]/50"
                }`}
              >
                {selectedTags.includes(t.id) && (
                  <Check className="h-3.5 w-3.5" />
                )}
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zgłoś nową etykietę / kuchnię */}
      <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <h2 className="mb-1 flex items-center gap-2 font-semibold text-[#1F1F1F]">
          <Plus className="h-5 w-5 text-[#FF4D4F]" />
          Zgłoś nowy wpis do systemu
        </h2>
        <p className="mb-4 text-sm text-[#8C8C8C]">
          Nie znalazłeś odpowiedniej kuchni lub etykiety? Zgłoś ją
          administratorowi.
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setReqType("CUISINE")}
              className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${reqType === "CUISINE" ? "border-[#FF4D4F] bg-[#FFF1F1] text-[#FF4D4F]" : "border-[#EEEEEE] text-[#1F1F1F]"}`}
            >
              Rodzaj kuchni
            </button>
            <button
              type="button"
              onClick={() => setReqType("AMENITY")}
              className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${reqType === "AMENITY" ? "border-[#FF4D4F] bg-[#FFF1F1] text-[#FF4D4F]" : "border-[#EEEEEE] text-[#1F1F1F]"}`}
            >
              Etykieta / udogodnienie
            </button>
          </div>
          <div className="flex gap-2">
            <Input
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
              placeholder={
                reqType === "CUISINE"
                  ? "np. Kuchnia meksykańska"
                  : "np. Ogródek letni"
              }
              className="flex-1 rounded-xl border-[#EEEEEE]"
            />
            <Button
              type="button"
              onClick={handleTagRequest}
              disabled={sending || !reqName.trim()}
              className="gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]"
            >
              {sending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Zgłoś
            </Button>
          </div>
        </div>
      </div>

      {/* Save */}
      <Button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full gap-2 rounded-xl bg-[#FF4D4F] py-3 text-white hover:bg-[#FF3B30]"
      >
        {saving ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Zapisz branding
      </Button>
    </div>
  );
}
