import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDailyStatistics } from "@/actions/kitchen";
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

  const data = await getDailyStatistics();

  return <StatisticsDashboardClient initialData={data} />;
}
