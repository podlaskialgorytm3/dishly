import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLocations } from "@/actions/owner/locations";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MapPin,
  Phone,
  Clock,
  Truck,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import DeleteLocationButton from "./DeleteLocationButton";

export default async function LocationsPage() {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "OWNER" && session.user.role !== "MANAGER")
  )
    redirect("/dashboard");

  const isOwner = session.user.role === "OWNER";
  const { locations, restaurant } = await getLocations();

  const activeSub = (restaurant as any).subscriptions?.[0];
  const maxLocations = activeSub?.plan?.maxLocations ?? 1;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1F1F1F]">
                {isOwner ? "Lokalizacje" : "Lokalizacja"}
              </h1>
              <p className="mt-1 text-sm text-[#8C8C8C]">
                {isOwner
                  ? `${locations.length} / ${maxLocations} lokalizacji w planie`
                  : "Zarządzaj godzinami otwarcia i ustawieniami lokalizacji"}
              </p>
            </div>
            {isOwner &&
              (locations.length < maxLocations ? (
                <Link href="/dashboard/owner/locations/new">
                  <Button className="gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]">
                    <Plus className="h-4 w-4" />
                    Dodaj lokalizację
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  Osiągnięto limit planu
                </div>
              ))}
          </div>

          {/* Subscription limit bar - tylko dla OWNER */}
          {isOwner && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-[#8C8C8C] mb-1">
                <span>Wykorzystanie planu</span>
                <span>
                  {locations.length}/{maxLocations}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EEEEEE]">
                <div
                  className={`h-2 rounded-full transition-all ${
                    locations.length >= maxLocations
                      ? "bg-[#FF4D4F]"
                      : "bg-[#4CAF50]"
                  }`}
                  style={{
                    width: `${Math.min((locations.length / maxLocations) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#EEEEEE] bg-white px-8 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F1]">
                <MapPin className="h-8 w-8 text-[#FF4D4F]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#1F1F1F]">
                Brak lokalizacji
              </h3>
              <p className="mt-2 max-w-sm text-sm text-[#8C8C8C]">
                {isOwner
                  ? "Dodaj pierwszą lokalizację swojej restauracji, aby zacząć przyjmować zamówienia."
                  : "Nie masz przypisanej lokalizacji. Skontaktuj się z właścicielem restauracji."}
              </p>
              {isOwner && (
                <Link href="/dashboard/owner/locations/new" className="mt-6">
                  <Button className="gap-2 rounded-xl bg-[#FF4D4F] text-white hover:bg-[#FF3B30]">
                    <Plus className="h-4 w-4" />
                    Dodaj pierwszą lokalizację
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {locations.map((loc) => {
                const oh = loc.openingHours as any;
                const todayKey = [
                  "sunday",
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                ][new Date().getDay()];
                const today = oh?.[todayKey];

                return (
                  <div
                    key={loc.id}
                    className="group rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1F1]">
                          <MapPin className="h-5 w-5 text-[#FF4D4F]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1F1F1F]">
                            {loc.name}
                          </h3>
                          <div
                            className={`mt-0.5 flex items-center gap-1 text-xs ${loc.isActive ? "text-[#4CAF50]" : "text-[#F44336]"}`}
                          >
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${loc.isActive ? "bg-[#4CAF50]" : "bg-[#F44336]"}`}
                            />
                            {loc.isActive ? "Aktywna" : "Nieaktywna"}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Link href={`/dashboard/owner/locations/${loc.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-[#FFF1F1] hover:text-[#FF4D4F]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {isOwner && (
                          <DeleteLocationButton id={loc.id} name={loc.name} />
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#8C8C8C]">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {loc.address}, {loc.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#8C8C8C]">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{loc.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#8C8C8C]">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>
                          {loc.isAllDay
                            ? "Całodobowo"
                            : today?.closed
                              ? "Dziś zamknięte"
                              : today
                                ? `${today.open} - ${today.close}`
                                : "Brak godzin"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#8C8C8C]">
                        <Truck className="h-4 w-4 shrink-0" />
                        <span>
                          Dostawa do {loc.deliveryRadius} km •{" "}
                          {Number(loc.deliveryFee).toFixed(2)} PLN
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#8C8C8C]">
                        <ShoppingBag className="h-4 w-4 shrink-0" />
                        <span>
                          Min. zamówienie:{" "}
                          {Number(loc.minOrderValue).toFixed(2)} PLN
                        </span>
                      </div>
                    </div>

                    {/* Staff count */}
                    <div className="mt-4 border-t border-[#EEEEEE] pt-4">
                      <div className="flex items-center justify-between text-xs text-[#8C8C8C]">
                        <span>Pracownicy</span>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-[#4CAF50]" />
                          <span className="font-medium text-[#1F1F1F]">
                            {(loc as any).workers?.length ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
