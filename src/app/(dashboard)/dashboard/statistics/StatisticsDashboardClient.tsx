"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Calendar,
  UtensilsCrossed,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDailyStatistics } from "@/actions/kitchen";

// ============================================
// TYPES
// ============================================

type StatisticsData = {
  totalRevenue: number;
  totalOrders: number;
  totalMeals: number;
  avgOrderValue: number;
  staffCount: number;
  hourlyData: { hour: number; orders: number; revenue: number }[];
  periodFrom: string;
  periodTo: string;
} | null;

// ============================================
// HOURLY CHART COMPONENT
// ============================================

function HourlyChart({
  data,
}: {
  data: { hour: number; orders: number; revenue: number }[];
}) {
  const maxOrders = Math.max(...data.map((d) => d.orders), 1);

  return (
    <div className="rounded-2xl border border-[#EEEEEE] bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-[#FF4D4F]" />
        <h3 className="text-lg font-bold text-[#1F1F1F]">
          Zamówienia wg godzin
        </h3>
      </div>
      <div className="flex items-end gap-1" style={{ height: "200px" }}>
        {data.map((d) => {
          const height = maxOrders > 0 ? (d.orders / maxOrders) * 100 : 0;
          return (
            <div
              key={d.hour}
              className="group relative flex flex-1 flex-col items-center justify-end"
              style={{ height: "100%" }}
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-8 z-10 hidden rounded-lg bg-[#1F1F1F] px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap">
                {d.orders} zam. |{" "}
                {new Intl.NumberFormat("pl-PL", {
                  style: "currency",
                  currency: "PLN",
                }).format(d.revenue)}
              </div>
              {/* Bar */}
              <div
                className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-80"
                style={{
                  height: `${Math.max(height, d.orders > 0 ? 4 : 0)}%`,
                  backgroundColor: d.orders > 0 ? "#FF4D4F" : "transparent",
                  minHeight: d.orders > 0 ? "4px" : "0",
                }}
              />
              {/* Hour label */}
              <span className="mt-1 text-[10px] text-[#8C8C8C]">
                {d.hour.toString().padStart(2, "0")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext?: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EEEEEE] bg-white p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <div>
          <p className="text-sm text-[#8C8C8C]">{label}</p>
          <p className="text-2xl font-bold text-[#1F1F1F]">{value}</p>
          {subtext && <p className="text-xs text-[#8C8C8C]">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN STATISTICS COMPONENT
// ============================================

export default function StatisticsDashboardClient({
  initialData,
}: {
  initialData: StatisticsData;
}) {
  const [data, setData] = useState<StatisticsData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);

  const fetchStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await getDailyStatistics(undefined, dateFrom, dateTo);
      setData(result);
    } catch {
      // Ignore
    }
    setIsRefreshing(false);
  }, [dateFrom, dateTo]);

  // Refresh when dates change
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Quick date navigation
  const goToDay = (offset: number) => {
    const current = new Date(dateFrom);
    current.setDate(current.getDate() + offset);
    const dateStr = current.toISOString().split("T")[0];
    setDateFrom(dateStr);
    setDateTo(dateStr);
  };

  const goToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setDateFrom(today);
    setDateTo(today);
  };

  const isToday =
    dateFrom === new Date().toISOString().split("T")[0] &&
    dateTo === new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b border-[#EEEEEE] bg-white">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1F1F1F]">
                📊 Statystyki
              </h1>
              <p className="text-[#8C8C8C]">
                Analiza sprzedaży i wyniki operacyjne
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStats}
                disabled={isRefreshing}
                className="flex items-center gap-2 rounded-xl bg-[#F5F5F5] px-4 py-2 text-sm font-medium text-[#8C8C8C] transition-all hover:bg-[#EEEEEE]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Odśwież
              </button>
            </div>
          </div>

          {/* Date filter */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => goToDay(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EEEEEE] bg-white text-[#8C8C8C] hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-[#EEEEEE] bg-white px-4 py-2">
              <Calendar className="h-4 w-4 text-[#8C8C8C]" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-none bg-transparent text-sm font-medium text-[#1F1F1F] outline-none"
              />
              <span className="text-[#8C8C8C]">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-none bg-transparent text-sm font-medium text-[#1F1F1F] outline-none"
              />
            </div>

            <button
              onClick={() => goToDay(1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EEEEEE] bg-white text-[#8C8C8C] hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {!isToday && (
              <Button
                onClick={goToToday}
                variant="outline"
                className="rounded-xl border-[#FF4D4F] text-[#FF4D4F] hover:bg-[#FF4D4F]/5"
              >
                Dzisiaj
              </Button>
            )}

            {/* Quick date ranges */}
            <div className="flex gap-1">
              {[
                {
                  label: "Ostatnie 7 dni",
                  fn: () => {
                    const to = new Date();
                    const from = new Date();
                    from.setDate(from.getDate() - 6);
                    setDateFrom(from.toISOString().split("T")[0]);
                    setDateTo(to.toISOString().split("T")[0]);
                  },
                },
                {
                  label: "Ostatnie 30 dni",
                  fn: () => {
                    const to = new Date();
                    const from = new Date();
                    from.setDate(from.getDate() - 29);
                    setDateFrom(from.toISOString().split("T")[0]);
                    setDateTo(to.toISOString().split("T")[0]);
                  },
                },
              ].map((range) => (
                <button
                  key={range.label}
                  onClick={range.fn}
                  className="rounded-lg border border-[#EEEEEE] bg-white px-3 py-1.5 text-xs font-medium text-[#8C8C8C] transition-colors hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-8 py-6">
        {!data ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-bold text-[#1F1F1F]">
              Brak danych do wyświetlenia
            </p>
            <p className="mt-1 text-sm text-[#8C8C8C]">
              Sprawdź wybrane daty i spróbuj ponownie
            </p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <StatCard
                icon={DollarSign}
                label="Przychód"
                value={formatPrice(data.totalRevenue)}
                color="#4CAF50"
                bgColor="#E8F5E9"
              />
              <StatCard
                icon={ShoppingBag}
                label="Zamówienia"
                value={data.totalOrders.toString()}
                color="#FF4D4F"
                bgColor="#FFF1F1"
              />
              <StatCard
                icon={UtensilsCrossed}
                label="Sprzedane posiłki"
                value={data.totalMeals.toString()}
                color="#FF8C42"
                bgColor="#FFF3E8"
              />
              <StatCard
                icon={TrendingUp}
                label="Śr. wartość zamówienia"
                value={formatPrice(data.avgOrderValue)}
                color="#2196F3"
                bgColor="#E3F2FD"
              />
              <StatCard
                icon={Users}
                label="Pracownicy na zmianie"
                value={data.staffCount.toString()}
                color="#9C27B0"
                bgColor="#F3E5F5"
              />
            </div>

            {/* Hourly chart */}
            <div className="mt-6">
              <HourlyChart data={data.hourlyData} />
            </div>

            {/* Peak hour summary */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {/* Busiest hour */}
              {(() => {
                const peakHour = data.hourlyData.reduce(
                  (max, d) => (d.orders > max.orders ? d : max),
                  data.hourlyData[0],
                );
                return (
                  <div className="rounded-2xl border border-[#EEEEEE] bg-white p-6">
                    <div className="flex items-center gap-2 text-[#8C8C8C]">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Godzina szczytu</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-[#1F1F1F]">
                      {peakHour.hour.toString().padStart(2, "0")}:00
                    </p>
                    <p className="text-sm text-[#8C8C8C]">
                      {peakHour.orders} zamówień •{" "}
                      {formatPrice(peakHour.revenue)}
                    </p>
                  </div>
                );
              })()}

              {/* Revenue per order */}
              <div className="rounded-2xl border border-[#EEEEEE] bg-white p-6">
                <div className="flex items-center gap-2 text-[#8C8C8C]">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Przychód / zamówienie</span>
                </div>
                <p className="mt-2 text-3xl font-bold text-[#1F1F1F]">
                  {formatPrice(data.avgOrderValue)}
                </p>
                <p className="text-sm text-[#8C8C8C]">
                  Na podstawie {data.totalOrders} zamówień
                </p>
              </div>

              {/* Active hours */}
              {(() => {
                const activeHours = data.hourlyData.filter(
                  (d) => d.orders > 0,
                ).length;
                return (
                  <div className="rounded-2xl border border-[#EEEEEE] bg-white p-6">
                    <div className="flex items-center gap-2 text-[#8C8C8C]">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm">Aktywne godziny</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-[#1F1F1F]">
                      {activeHours}h
                    </p>
                    <p className="text-sm text-[#8C8C8C]">
                      Godzin z zamówieniami
                    </p>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
