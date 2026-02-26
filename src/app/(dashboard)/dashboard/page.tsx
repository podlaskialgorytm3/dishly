import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Users,
  Store,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

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

  // Admin stats
  const adminStats = [
    {
      title: "Opublikowane strony",
      value: "8",
      change: "+2",
      trend: "up",
      icon: FileText,
      color: "#FF4D4F",
      bgColor: "#FFF1F1",
    },
    {
      title: "Aktywni użytkownicy",
      value: "156",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "#4CAF50",
      bgColor: "#E8F5E9",
    },
    {
      title: "Restauracje",
      value: "24",
      change: "+3",
      trend: "up",
      icon: Store,
      color: "#FF8C42",
      bgColor: "#FFF4E6",
    },
    {
      title: "Zamówienia (dziś)",
      value: "89",
      change: "+18%",
      trend: "up",
      icon: ShoppingBag,
      color: "#2196F3",
      bgColor: "#E3F2FD",
    },
  ];

  // Client stats
  const clientStats = [
    {
      title: "Twoje zamówienia",
      value: "12",
      subtitle: "W tym miesiącu",
      icon: ShoppingBag,
      color: "#FF4D4F",
      bgColor: "#FFF1F1",
    },
    {
      title: "Ulubione restauracje",
      value: "5",
      subtitle: "Obserwowane",
      icon: Store,
      color: "#FF8C42",
      bgColor: "#FFF4E6",
    },
  ];

  const stats = session.user.role === "ADMIN" ? adminStats : clientStats;

  // Quick actions based on role
  const getQuickActions = () => {
    if (session.user.role === "ADMIN") {
      return [
        {
          title: "Zarządzanie treścią",
          description: "Edytuj strony i publikuj treści",
          href: "/dashboard/content-management",
          icon: FileText,
          color: "#FF4D4F",
        },
        {
          title: "Użytkownicy",
          description: "Zarządzaj kontami użytkowników",
          href: "/dashboard/users",
          icon: Users,
          color: "#4CAF50",
          disabled: true,
        },
        {
          title: "Restauracje",
          description: "Przeglądaj i moderuj restauracje",
          href: "/dashboard/restaurants",
          icon: Store,
          color: "#FF8C42",
          disabled: true,
        },
      ];
    }

    if (session.user.role === "OWNER") {
      return [
        {
          title: "Moja restauracja",
          description: "Zarządzaj menu i lokalizacjami",
          href: "/dashboard/restaurant",
          icon: Store,
          color: "#FF4D4F",
          disabled: true,
        },
      ];
    }

    return [
      {
        title: "Przeglądaj restauracje",
        description: "Znajdź i zamów jedzenie",
        href: "/",
        icon: Store,
        color: "#FF4D4F",
      },
      {
        title: "Twoje zamówienia",
        description: "Historia i aktywne zamówienia",
        href: "/orders",
        icon: ShoppingBag,
        color: "#FF8C42",
        disabled: true,
      },
    ];
  };

  const quickActions = getQuickActions();

  // Recent activity (mock data for now)
  const recentActivity =
    session.user.role === "ADMIN"
      ? [
          {
            title: "Nowa strona utworzona",
            description: "Polityka cookies została opublikowana",
            time: "2 godz. temu",
            icon: FileText,
            color: "#FF4D4F",
          },
          {
            title: "Nowy użytkownik",
            description: "jan.kowalski@email.com zarejestrował się",
            time: "5 godz. temu",
            icon: Users,
            color: "#4CAF50",
          },
          {
            title: "Restauracja zaakceptowana",
            description: "Pizza Palace została zatwierdzona",
            time: "1 dzień temu",
            icon: CheckCircle2,
            color: "#2196F3",
          },
        ]
      : [];

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1F1F1F]">Dashboard</h1>
              <p className="mt-1 text-sm text-[#8C8C8C]">
                Witaj ponownie, {session.user.firstName || session.user.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {session.user.role === "CLIENT" && (
                <Link
                  href="/"
                  className="rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm font-medium text-[#1F1F1F] transition-colors hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                >
                  Strona Główna
                </Link>
              )}
              <div className="flex items-center gap-2 rounded-xl bg-[#FAFAFA] px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-[#4CAF50]" />
                <span className="text-sm font-medium text-[#1F1F1F]">
                  {getRoleLabel(session.user.role)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="group rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: stat.bgColor }}
                    >
                      <Icon className="h-6 w-6" style={{ color: stat.color }} />
                    </div>
                    {"change" in stat && stat.change && (
                      <div
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          "trend" in stat && stat.trend === "up"
                            ? "bg-[#E8F5E9] text-[#4CAF50]"
                            : "bg-[#FFEBEE] text-[#F44336]"
                        }`}
                      >
                        {"trend" in stat && stat.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {stat.change}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-[#1F1F1F]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-[#8C8C8C]">{stat.title}</p>
                    {"subtitle" in stat && stat.subtitle && (
                      <p className="mt-0.5 text-xs text-[#8C8C8C]">
                        {stat.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[#1F1F1F]">
              Szybkie akcje
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const isDisabled = action.disabled;

                const content = (
                  <div
                    className={`group rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-200 ${
                      !isDisabled
                        ? "cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: action.color + "15",
                        }}
                      >
                        <Icon
                          className="h-6 w-6"
                          style={{ color: action.color }}
                        />
                      </div>
                      {isDisabled && (
                        <span className="rounded-full bg-[#EEEEEE] px-2 py-1 text-xs text-[#8C8C8C]">
                          Wkrótce
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="font-semibold text-[#1F1F1F]">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#8C8C8C]">
                        {action.description}
                      </p>
                    </div>
                  </div>
                );

                if (isDisabled) {
                  return <div key={index}>{content}</div>;
                }

                return (
                  <Link key={index} href={action.href}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity (Admin only) */}
          {session.user.role === "ADMIN" && recentActivity.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-[#1F1F1F]">
                Ostatnia aktywność
              </h2>
              <div className="rounded-[20px] border border-[#EEEEEE] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="divide-y divide-[#EEEEEE]">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-6 transition-colors hover:bg-[#FAFAFA]"
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: activity.color + "15",
                          }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: activity.color }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[#1F1F1F]">
                            {activity.title}
                          </p>
                          <p className="mt-0.5 text-sm text-[#8C8C8C]">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-xs text-[#8C8C8C]">
                          {activity.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Pending approval warning for OWNER */}
          {!session.user.isApproved && session.user.role === "OWNER" && (
            <div className="rounded-[20px] border border-[#FFC107] bg-[#FFF8E1] p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFECB3]">
                  <AlertCircle className="h-5 w-5 text-[#F57C00]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#E65100]">
                    Oczekuje na zatwierdzenie
                  </h3>
                  <p className="mt-1 text-sm text-[#F57C00]">
                    Twoje konto restauracji wymaga zatwierdzenia przez
                    administratora. Otrzymasz powiadomienie email gdy będziesz
                    mógł rozpocząć korzystanie z pełnej funkcjonalności
                    platformy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
