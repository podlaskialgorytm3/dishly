import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getDailyStatistics,
  getLast7DaysStatistics,
  getBestsellers,
  getOwnerAverageRating,
} from "@/actions/kitchen";
import StatisticsDashboardClient from "./StatisticsDashboardClient";

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

  // Fetch all data in parallel
  const [dailyData, last7DaysData, bestsellers, avgRating] = await Promise.all([
    getDailyStatistics(),
    getLast7DaysStatistics(),
    getBestsellers(10),
    getOwnerAverageRating(),
  ]);

  return (
    <StatisticsDashboardClient
      initialData={dailyData}
      last7DaysData={last7DaysData}
      bestsellers={bestsellers}
      avgRating={avgRating}
      userRole={session.user.role}
    />
  );
}
