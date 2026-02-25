import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Witaj, {session.user.firstName || session.user.email}!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Twoja Rola</CardTitle>
              <CardDescription>Uprawnienia w systemie</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{session.user.role}</p>
              <p className="text-sm text-gray-500 mt-2">
                Status:{" "}
                <span
                  className={
                    session.user.isApproved
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {session.user.isApproved ? "Zatwierdzony" : "Oczekuje"}
                </span>
              </p>
            </CardContent>
          </Card>

          {session.user.role === "OWNER" && session.user.restaurantId && (
            <Card>
              <CardHeader>
                <CardTitle>Twoja Restauracja</CardTitle>
                <CardDescription>Zarządzaj swoją restauracją</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Przejdź do zarządzania</Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Informacje</CardTitle>
              <CardDescription>Szczegóły konta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID Użytkownika</p>
                <p className="font-mono text-xs">{session.user.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
