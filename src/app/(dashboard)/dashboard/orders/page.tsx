import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";

export default async function OrdersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Sprawdź czy użytkownik ma uprawnienia (MANAGER, WORKER, OWNER)
  const hasAccess =
    session.user.role === "MANAGER" ||
    session.user.role === "WORKER" ||
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
              <h1 className="text-3xl font-bold text-[#1F1F1F]">Zamówienia</h1>
              <p className="text-[#8C8C8C]">
                Zarządzaj zamówieniami i śledź ich status w czasie rzeczywistym
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
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1F1]">
              <ShoppingBag className="h-10 w-10 text-[#FF4D4F]" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-[#1F1F1F]">
              System Zamówień
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#8C8C8C]">
              Panel zarządzania zamówieniami jest obecnie w fazie rozwoju.
              Wkrótce będziesz mógł obsługiwać zamówienia w czasie rzeczywistym,
              zarządzać statusami i komunikować się z klientami.
            </p>

            {/* Features Preview */}
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 font-semibold text-[#1F1F1F]">Real-time</h3>
                <p className="mt-2 text-sm text-[#8C8C8C]">
                  Powiadomienia o nowych zamówieniach w czasie rzeczywistym
                </p>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-4 font-semibold text-[#1F1F1F]">
                  Zarządzanie statusami
                </h3>
                <p className="mt-2 text-sm text-[#8C8C8C]">
                  Łatwa zmiana statusów: Nowe, W przygotowaniu, Gotowe
                </p>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="mt-4 font-semibold text-[#1F1F1F]">
                  Historia zamówień
                </h3>
                <p className="mt-2 text-sm text-[#8C8C8C]">
                  Pełna historia wszystkich zamówień z filtrowaniem
                </p>
              </div>

              <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mt-4 font-semibold text-[#1F1F1F]">
                  Integracja Stripe
                </h3>
                <p className="mt-2 text-sm text-[#8C8C8C]">
                  Automatyczne potwierdzanie płatności online
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[16px] border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Zgodnie z Etapem 6 i 7:</strong> System zamówień obejmie
                pełny cykl życia zamówienia od płatności Stripe, przez
                zarządzanie statusami, aż po Display Board dla klientów.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
