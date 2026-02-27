import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ClipboardList,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Clock,
} from "lucide-react";

export default async function ReportsPage() {
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
              <h1 className="text-3xl font-bold text-[#1F1F1F]">Raporty</h1>
              <p className="text-[#8C8C8C]">
                Generuj szczegółowe raporty okresowe i eksportuj dane
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
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600">
              <ClipboardList className="h-10 w-10 text-white" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-[#1F1F1F]">
              System Raportowania
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#8C8C8C]">
              Moduł raportowania jest obecnie w fazie rozwoju. Wkrótce będziesz
              mógł generować szczegółowe raporty sprzedażowe, finansowe i
              operacyjne z możliwością eksportu do różnych formatów.
            </p>

            {/* Report Types */}
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-[#1F1F1F]">
                    Raport finansowy
                  </h3>
                </div>
                <p className="mt-3 text-sm text-[#8C8C8C]">
                  Przychody, koszty, marże i rentowność w wybranym okresie
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#8C8C8C]">
                  <Calendar className="h-3 w-3" />
                  <span>Dzienny / Tygodniowy / Miesięczny</span>
                </div>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-[#1F1F1F]">
                    Raport sprzedaży
                  </h3>
                </div>
                <p className="mt-3 text-sm text-[#8C8C8C]">
                  Najlepiej sprzedające się produkty, kategorie i warianty
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#8C8C8C]">
                  <TrendingUp className="h-3 w-3" />
                  <span>Porównanie rok do roku</span>
                </div>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-[#1F1F1F]">
                    Raport klientów
                  </h3>
                </div>
                <p className="mt-3 text-sm text-[#8C8C8C]">
                  Nowi klienci, powracający, wartość życiowa (LTV)
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#8C8C8C]">
                  <Clock className="h-3 w-3" />
                  <span>Analiza retencji</span>
                </div>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-[#1F1F1F]">
                    Raport operacyjny
                  </h3>
                </div>
                <p className="mt-3 text-sm text-[#8C8C8C]">
                  Czasy realizacji, wydajność kuchni, godziny szczytu
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#8C8C8C]">
                  <Clock className="h-3 w-3" />
                  <span>Optymalizacja procesów</span>
                </div>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100">
                    <TrendingUp className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-[#1F1F1F]">
                    Raport marketingowy
                  </h3>
                </div>
                <p className="mt-3 text-sm text-[#8C8C8C]">
                  Skuteczność promocji, ROI kampanii, źródła ruchu
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#8C8C8C]">
                  <TrendingUp className="h-3 w-3" />
                  <span>Mierzenie konwersji</span>
                </div>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                    <Download className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-[#1F1F1F]">
                    Eksport danych
                  </h3>
                </div>
                <p className="mt-3 text-sm text-[#8C8C8C]">
                  Pobierz raporty w formatach PDF, Excel, CSV
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#8C8C8C]">
                  <FileText className="h-3 w-3" />
                  <span>Automatyczne planowanie</span>
                </div>
              </div>
            </div>

            {/* Features Coming */}
            <div className="mx-auto mt-12 max-w-3xl rounded-[16px] border border-[#EEEEEE] bg-gradient-to-br from-[#FAFAFA] to-white p-8">
              <h3 className="text-lg font-semibold text-[#1F1F1F]">
                Nadchodzące funkcje
              </h3>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#1F1F1F]">
                      Automatyczne planowanie
                    </p>
                    <p className="mt-1 text-xs text-[#8C8C8C]">
                      Otrzymuj raporty automatycznie co tydzień/miesiąc
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#1F1F1F]">
                      Niestandardowe filtry
                    </p>
                    <p className="mt-1 text-xs text-[#8C8C8C]">
                      Twórz własne raporty z dowolnymi parametrami
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#1F1F1F]">
                      Wizualizacje danych
                    </p>
                    <p className="mt-1 text-xs text-[#8C8C8C]">
                      Wykresy i diagramy w raportach PDF
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#1F1F1F]">
                      Porównanie lokalizacji
                    </p>
                    <p className="mt-1 text-xs text-[#8C8C8C]">
                      Analizuj wyniki różnych punktów restauracji
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[16px] border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Zgodnie z Etapem 7:</strong> System raportowania będzie
                integralną częścią dashboardu menadżera, umożliwiając pełną
                kontrolę nad danymi biznesowymi i ich prezentacją.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
