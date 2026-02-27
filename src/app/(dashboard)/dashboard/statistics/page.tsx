import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Calendar,
  PieChart,
  LineChart,
} from "lucide-react";

export default async function StatisticsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Sprawdź czy użytkownik ma uprawnienia (MANAGER, OWNER)
  const hasAccess =
    session.user.role === "MANAGER" ||
    session.user.role === "OWNER" ||
    session.user.role === "ADMIN";

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b border-[#EEEEEE] bg-white">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1F1F1F]">Statystyki</h1>
              <p className="text-[#8C8C8C]">
                Analizuj wykresy sprzedaży i wskaźniki wydajności restauracji
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Coming Soon Card */}
          <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-[#1F1F1F]">
              Panel Analityczny
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#8C8C8C]">
              Moduł statystyk i analityki biznesowej jest obecnie w fazie
              rozwoju. Wkrótce będziesz mógł śledzić kluczowe wskaźniki
              wydajności, trendy sprzedaży i zachowania klientów.
            </p>

            {/* Features Preview */}
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-4 font-semibold text-[#1F1F1F]">Przychody</h3>
                <p className="mt-2 text-sm text-[#8C8C8C]">
                  Śledź dzienne, tygodniowe i miesięczne przychody
                </p>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 font-semibold text-[#1F1F1F]">
                  Zamówienia
                </h3>
                <p className="mt-2 text-sm text-[#8C8C8C]">
                  Liczba zamówień i średnia wartość koszyka
                </p>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <PieChart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mt-4 font-semibold text-[#1F1F1F]">
                  Top produkty
                </h3>
                <p className="mt-2 text-sm text-[#8C8C8C]">
                  Najpopularniejsze dania i kategorie
                </p>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="mt-4 font-semibold text-[#1F1F1F]">Trendy</h3>
                <p className="mt-2 text-sm text-[#8C8C8C]">
                  Analiza wzrostów i spadków sprzedaży
                </p>
              </div>
            </div>

            {/* Additional Features */}
            <div className="mx-auto mt-8 grid max-w-5xl gap-6 md:grid-cols-3">
              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1F1]">
                    <LineChart className="h-5 w-5 text-[#FF4D4F]" />
                  </div>
                  <h3 className="font-semibold text-[#1F1F1F]">
                    Wykresy sprzedaży
                  </h3>
                </div>
                <p className="mt-3 text-sm text-[#8C8C8C]">
                  Interaktywne wykresy pokazujące sprzedaż w godzinach szczytu i
                  dni tygodnia
                </p>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-[#1F1F1F]">
                    Analiza klientów
                  </h3>
                </div>
                <p className="mt-3 text-sm text-[#8C8C8C]">
                  Segmentacja klientów, powtarzalność zamówień i wartość życiowa
                </p>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-[#1F1F1F]">
                    Porównania okresowe
                  </h3>
                </div>
                <p className="mt-3 text-sm text-[#8C8C8C]">
                  Porównaj wyniki z poprzednimi miesiącami i rokiem ubiegłym
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[16px] border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Zgodnie z Etapem 7:</strong> Panel statystyk będzie
                zawierał zaawansowane dashboardy z filtrami dat, eksportem do
                CSV/PDF i możliwością ustawienia celów sprzedażowych.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
