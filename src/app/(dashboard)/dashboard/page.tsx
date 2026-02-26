import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Store,
  ShieldCheck,
  LogOut,
  Mail,
  UtensilsCrossed,
  Settings,
  ShoppingBag,
  Home,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "from-purple-500 to-purple-600";
      case "OWNER":
        return "from-[#FF4D4F] to-[#FF3B30]";
      case "CLIENT":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "OWNER":
        return "Właściciel Restauracji";
      case "CLIENT":
        return "Klient";
      case "MANAGER":
        return "Menedżer";
      case "WORKER":
        return "Pracownik";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#FFF5F5] to-[#FAFAFA]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#FF4D4F] to-[#FF3B30] shadow-lg">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DISHLY</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Home Button for CLIENT role */}
              {session.user.role === "CLIENT" && (
                <Link href="/">
                  <Button
                    variant="outline"
                    className="gap-2 rounded-xl border-2 transition-all hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                  >
                    <Home className="h-4 w-4" />
                    Strona Główna
                  </Button>
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl border-2 transition-all hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                >
                  <LogOut className="h-4 w-4" />
                  Wyloguj
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Witaj ponownie!
              </h2>
              <p className="mt-2 text-gray-600">
                {session.user.firstName && session.user.lastName
                  ? `${session.user.firstName} ${session.user.lastName}`
                  : session.user.email}
              </p>
            </div>
            <div
              className={`inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br ${getRoleColor(session.user.role)} shadow-lg`}
            >
              {session.user.role === "ADMIN" ? (
                <ShieldCheck className="h-8 w-8 text-white" />
              ) : session.user.role === "OWNER" ? (
                <Store className="h-8 w-8 text-white" />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Role Card */}
          <Card className="rounded-2xl border-gray-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${getRoleColor(session.user.role)}`}
                >
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Twoja Rola</CardTitle>
                  <CardDescription>Uprawnienia w systemie</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {getRoleLabel(session.user.role)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${session.user.isApproved ? "bg-green-500" : "bg-yellow-500"}`}
                />
                <p className="text-sm text-gray-600">
                  {session.user.isApproved
                    ? "Konto zatwierdzone"
                    : "Oczekuje na zatwierdzenie"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card className="rounded-2xl border-gray-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Informacje</CardTitle>
                  <CardDescription>Szczegóły konta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">
                  {session.user.email}
                </p>
              </div>
              {session.user.firstName && (
                <div>
                  <p className="text-xs text-gray-500">Imię i nazwisko</p>
                  <p className="font-medium text-gray-900">
                    {session.user.firstName} {session.user.lastName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="rounded-2xl border-gray-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-orange-600">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Szybkie akcje</CardTitle>
                  <CardDescription>Zarządzaj kontem</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {session.user.role === "OWNER" && (
                <Button
                  className="w-full justify-start gap-2 rounded-xl"
                  variant="outline"
                >
                  <Store className="h-4 w-4" />
                  Zarządzaj restauracją
                </Button>
              )}
              {session.user.role === "CLIENT" && (
                <Button className="w-full justify-start gap-2 rounded-xl bg-linear-to-r from-[#FF4D4F] to-[#FF3B30] text-white hover:opacity-90">
                  <ShoppingBag className="h-4 w-4" />
                  Przeglądaj restauracje
                </Button>
              )}
              {session.user.role === "ADMIN" && (
                <Link href="/dashboard/content-management" className="w-full">
                  <Button className="w-full justify-start gap-2 rounded-xl bg-linear-to-r from-purple-500 to-purple-600 text-white hover:opacity-90">
                    <ShieldCheck className="h-4 w-4" />
                    Zarządzanie treścią
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        {!session.user.isApproved && session.user.role === "OWNER" && (
          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <ShieldCheck className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900">
                  Oczekuje na zatwierdzenie
                </h3>
                <p className="mt-1 text-sm text-yellow-800">
                  Twoje konto restauracji wymaga zatwierdzenia przez
                  administratora. Otrzymasz powiadomienie email gdy będziesz
                  mógł rozpocząć korzystanie z pełnej funkcjonalności platformy.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
