"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
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
  Star,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDailyStatistics, getLast7DaysStatistics } from "@/actions/kitchen";

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

type Last7DaysData = {
  dailyData: {
    date: string;
    dayName: string;
    orders: number;
    revenue: number;
  }[];
  totalRevenue: number;
  totalOrders: number;
} | null;

type Bestseller = {
  mealId: string;
  mealName: string;
  imageUrl: string | null;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
};

type AvgRating = {
  avgRating: number;
  reviewCount: number;
} | null;

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
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
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
// CUSTOM TOOLTIP FOR CHARTS
// ============================================

function CustomTooltip({ active, payload, label, type }: any) {
  if (!active || !payload || !payload.length) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);

  return (
    <div className="rounded-lg bg-[#1F1F1F] px-3 py-2 text-sm text-white shadow-lg">
      <p className="font-medium">{type === "hourly" ? `${label}:00` : label}</p>
      <p>
        {payload[0].name}: {payload[0].value}
      </p>
      {payload[1] && (
        <p>
          {payload[1].name}: {formatPrice(payload[1].value)}
        </p>
      )}
    </div>
  );
}

// ============================================
// MAIN STATISTICS COMPONENT
// ============================================

export default function StatisticsDashboardClient({
  initialData,
  last7DaysData: initialLast7Days,
  bestsellers,
  avgRating,
  userRole,
}: {
  initialData: StatisticsData;
  last7DaysData: Last7DaysData;
  bestsellers: Bestseller[];
  avgRating: AvgRating;
  userRole: string;
}) {
  const [data, setData] = useState<StatisticsData>(initialData);
  const [last7Days, setLast7Days] = useState<Last7DaysData>(initialLast7Days);
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
      const [result, weekResult] = await Promise.all([
        getDailyStatistics(undefined, dateFrom, dateTo),
        getLast7DaysStatistics(),
      ]);
      setData(result);
      setLast7Days(weekResult);
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

  const isOwnerOrAdmin = userRole === "OWNER" || userRole === "ADMIN";

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
                {isOwnerOrAdmin && " • Widok globalny"}
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
                label="Śr. wartość zam."
                value={formatPrice(data.avgOrderValue)}
                color="#2196F3"
                bgColor="#E3F2FD"
              />
              <StatCard
                icon={Users}
                label="Pracownicy"
                value={data.staffCount.toString()}
                color="#9C27B0"
                bgColor="#F3E5F5"
              />
              <StatCard
                icon={Star}
                label="Średnia ocena"
                value={avgRating ? avgRating.avgRating.toFixed(1) : "—"}
                subtext={avgRating ? `${avgRating.reviewCount} opinii` : ""}
                color="#FFC107"
                bgColor="#FFF8E1"
              />
            </div>

            {/* 7-Day Sales Chart - Właściciel widzi wykres słupkowy */}
            {isOwnerOrAdmin && last7Days && (
              <div className="mt-6 rounded-2xl border border-[#EEEEEE] bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#FF4D4F]" />
                  <h3 className="text-lg font-bold text-[#1F1F1F]">
                    Sprzedaż z ostatnich 7 dni
                  </h3>
                  <span className="ml-auto text-sm text-[#8C8C8C]">
                    Razem: {formatPrice(last7Days.totalRevenue)} (
                    {last7Days.totalOrders} zam.)
                  </span>
                </div>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={last7Days.dailyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
                      <XAxis
                        dataKey="dayName"
                        tick={{ fill: "#8C8C8C", fontSize: 12 }}
                        axisLine={{ stroke: "#EEEEEE" }}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fill: "#8C8C8C", fontSize: 12 }}
                        axisLine={{ stroke: "#EEEEEE" }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: "#8C8C8C", fontSize: 12 }}
                        axisLine={{ stroke: "#EEEEEE" }}
                        tickFormatter={(value) => `${value} zł`}
                      />
                      <Tooltip content={<CustomTooltip type="daily" />} />
                      <Bar
                        yAxisId="left"
                        dataKey="orders"
                        name="Zamówienia"
                        fill="#FF4D4F"
                        radius={[4, 4, 0, 0]}
                      >
                        {last7Days.dailyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === last7Days.dailyData.length - 1
                                ? "#FF4D4F"
                                : "#FFCDD2"
                            }
                          />
                        ))}
                      </Bar>
                      <Bar
                        yAxisId="right"
                        dataKey="revenue"
                        name="Przychód"
                        fill="#4CAF50"
                        radius={[4, 4, 0, 0]}
                      >
                        {last7Days.dailyData.map((entry, index) => (
                          <Cell
                            key={`cell-rev-${index}`}
                            fill={
                              index === last7Days.dailyData.length - 1
                                ? "#4CAF50"
                                : "#C8E6C9"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Hourly chart */}
            <div className="mt-6 rounded-2xl border border-[#EEEEEE] bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#FF4D4F]" />
                <h3 className="text-lg font-bold text-[#1F1F1F]">
                  Zamówienia wg godzin
                </h3>
              </div>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={data.hourlyData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#EEEEEE"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: "#8C8C8C", fontSize: 10 }}
                      axisLine={{ stroke: "#EEEEEE" }}
                      tickFormatter={(h) => `${h}`}
                    />
                    <YAxis
                      tick={{ fill: "#8C8C8C", fontSize: 10 }}
                      axisLine={{ stroke: "#EEEEEE" }}
                    />
                    <Tooltip content={<CustomTooltip type="hourly" />} />
                    <Bar
                      dataKey="orders"
                      name="Zamówienia"
                      fill="#FF4D4F"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bestsellers */}
            {bestsellers.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[#EEEEEE] bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#FFC107]" />
                  <h3 className="text-lg font-bold text-[#1F1F1F]">
                    Bestsellery (ostatnie 30 dni)
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {bestsellers.slice(0, 10).map((meal, index) => (
                    <div
                      key={meal.mealId}
                      className="flex items-center gap-3 rounded-xl border border-[#EEEEEE] p-3 transition-colors hover:border-[#FF4D4F]/30"
                    >
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5F5F5] overflow-hidden">
                          {meal.imageUrl ? (
                            <img
                              src={meal.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">🍽️</span>
                          )}
                        </div>
                        <span
                          className={`absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                  ? "bg-amber-600"
                                  : "bg-[#8C8C8C]"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-[#1F1F1F]">
                          {meal.mealName}
                        </p>
                        <p className="text-xs text-[#8C8C8C]">
                          {meal.totalQuantity} szt. •{" "}
                          {formatPrice(meal.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
