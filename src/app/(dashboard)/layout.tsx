import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Users,
  Store,
  LogOut,
  ShieldCheck,
  UtensilsCrossed,
  Home,
  CreditCard,
  BookOpen,
  Shield,
  MapPin,
  Users2,
  Palette,
  Eye,
  ShoppingBag,
  BarChart3,
  ClipboardList,
  Clock,
  Monitor,
  type LucideIcon,
} from "lucide-react";

type MenuItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
  disabled?: boolean;
  panelKey?: string; // Klucz panelu dla kontroli widoczności
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Pobierz ustawienia widoczności paneli dla MANAGER/WORKER
  let visibilityMap: Record<string, boolean> = {};
  if (
    (session.user.role === "MANAGER" || session.user.role === "WORKER") &&
    session.user.restaurantId
  ) {
    const settings = await db.visibilitySettings.findMany({
      where: {
        restaurantId: session.user.restaurantId,
        role: session.user.role as any,
      },
    });
    for (const s of settings) {
      visibilityMap[s.panelKey] = s.isVisible;
    }
  }

  // Menu items based on role
  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["ADMIN", "OWNER", "CLIENT"],
      },
    ];

    if (session.user.role === "ADMIN") {
      return [
        ...baseItems,
        {
          name: "Zarządzanie treścią",
          href: "/dashboard/content-management",
          icon: FileText,
          roles: ["ADMIN"],
        },
        {
          name: "Subskrypcje",
          href: "/dashboard/subscriptions",
          icon: CreditCard,
          roles: ["ADMIN"],
        },
        {
          name: "Restauracje",
          href: "/dashboard/restaurants",
          icon: Store,
          roles: ["ADMIN"],
        },
        {
          name: "Słowniki",
          href: "/dashboard/dictionaries",
          icon: BookOpen,
          roles: ["ADMIN"],
        },
        {
          name: "Moderacja",
          href: "/dashboard/moderation",
          icon: Shield,
          roles: ["ADMIN"],
        },
      ];
    }

    if (session.user.role === "OWNER") {
      return [
        ...baseItems,
        {
          name: "Zamówienia",
          href: "/dashboard/orders",
          icon: ShoppingBag,
          roles: ["OWNER"],
        },
        {
          name: "Lokalizacje",
          href: "/dashboard/owner/locations",
          icon: MapPin,
          roles: ["OWNER"],
        },
        {
          name: "Menu",
          href: "/dashboard/owner/menu",
          icon: UtensilsCrossed,
          roles: ["OWNER"],
        },
        {
          name: "Zespół",
          href: "/dashboard/owner/staff",
          icon: Users2,
          roles: ["OWNER"],
        },
        {
          name: "Branding",
          href: "/dashboard/owner/branding",
          icon: Palette,
          roles: ["OWNER"],
        },
        {
          name: "Widoczność paneli",
          href: "/dashboard/owner/visibility",
          icon: Eye,
          roles: ["OWNER"],
        },
        {
          name: "Statystyki",
          href: "/dashboard/statistics",
          icon: BarChart3,
          roles: ["OWNER"],
        },
      ];
    }

    if (session.user.role === "MANAGER") {
      const allItems: MenuItem[] = [
        ...baseItems,
        {
          name: "Zamówienia",
          href: "/dashboard/orders",
          icon: ShoppingBag,
          roles: ["MANAGER"],
          panelKey: "orders",
        },
        {
          name: "Menu",
          href: "/dashboard/owner/menu",
          icon: UtensilsCrossed,
          roles: ["MANAGER"],
          panelKey: "menu",
        },
        {
          name: "Lokalizacje",
          href: "/dashboard/owner/locations",
          icon: MapPin,
          roles: ["MANAGER"],
          panelKey: "locations",
        },
        {
          name: "Statystyki",
          href: "/dashboard/statistics",
          icon: BarChart3,
          roles: ["MANAGER"],
          panelKey: "statistics",
        },
        {
          name: "Raporty",
          href: "/dashboard/reports",
          icon: ClipboardList,
          roles: ["MANAGER"],
          panelKey: "reports",
        },
      ];
      // Filtruj wg ustawień widoczności (domyślnie widoczne)
      return allItems.filter(
        (item) => !item.panelKey || visibilityMap[item.panelKey] !== false,
      );
    }

    if (session.user.role === "WORKER") {
      const allItems: MenuItem[] = [
        ...baseItems,
        {
          name: "Zamówienia",
          href: "/dashboard/orders",
          icon: ShoppingBag,
          roles: ["WORKER"],
          panelKey: "orders",
        },
        {
          name: "Menu",
          href: "/dashboard/owner/menu",
          icon: UtensilsCrossed,
          roles: ["WORKER"],
          panelKey: "menu",
        },
      ];
      // Filtruj wg ustawień widoczności (domyślnie widoczne)
      return allItems.filter(
        (item) => !item.panelKey || visibilityMap[item.panelKey] !== false,
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#EEEEEE] bg-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 border-b border-[#EEEEEE] px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4D4F] to-[#FF3B30] shadow-lg">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1F1F1F]">DISHLY</h1>
              <p className="text-xs text-[#8C8C8C]">
                {session.user.role === "ADMIN"
                  ? "Panel Admina"
                  : session.user.role === "OWNER"
                    ? "Panel Właściciela"
                    : session.user.role === "MANAGER"
                      ? "Panel Menadżera"
                      : session.user.role === "WORKER"
                        ? "Panel Pracownika"
                        : "Panel Klienta"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = false; // Will be handled by client component
              const isDisabled = item.disabled || false;

              if (isDisabled) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#8C8C8C] opacity-50 cursor-not-allowed"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="ml-auto text-xs bg-[#EEEEEE] px-2 py-0.5 rounded-full">
                      Wkrótce
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 text-[#1F1F1F] transition-all duration-200 hover:bg-[#FAFAFA]"
                >
                  <Icon className="h-5 w-5 transition-colors group-hover:text-[#FF4D4F]" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-[#EEEEEE] p-4">
            <div className="mb-3 rounded-xl bg-[#FAFAFA] p-3">
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    session.user.role === "ADMIN"
                      ? "bg-gradient-to-br from-purple-500 to-purple-600"
                      : session.user.role === "OWNER"
                        ? "bg-gradient-to-br from-[#FF4D4F] to-[#FF3B30]"
                        : "bg-gradient-to-br from-blue-500 to-blue-600"
                  }`}
                >
                  {session.user.role === "ADMIN" ? (
                    <ShieldCheck className="h-4 w-4 text-white" />
                  ) : session.user.role === "OWNER" ? (
                    <Store className="h-4 w-4 text-white" />
                  ) : (
                    <Users className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1F1F1F] truncate">
                    {session.user.email}
                  </p>
                  <p className="text-xs text-[#8C8C8C]">
                    {session.user.role === "ADMIN"
                      ? "Administrator"
                      : session.user.role === "OWNER"
                        ? "Właściciel"
                        : session.user.role === "MANAGER"
                          ? "Menadżer"
                          : session.user.role === "WORKER"
                            ? "Pracownik"
                            : "Klient"}
                  </p>
                </div>
              </div>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#FAFAFA] hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
              >
                <LogOut className="h-4 w-4" />
                Wyloguj
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-64">
        {/* Top Header with Home Button */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-[10px] border-b border-[#EEEEEE]">
          <div className="px-8 h-[75px] flex items-center justify-end">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-transparent transition-all duration-200 hover:scale-105 group"
                title="Strona Główna"
              >
                <Home className="h-5 w-5 text-[#1F1F1F] group-hover:text-[#FF4D4F] transition-colors duration-200" />
              </Button>
            </Link>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
