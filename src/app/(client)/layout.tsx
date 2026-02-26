import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MainHeader } from "@/components/layout/MainHeader";
import { db } from "@/lib/db";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Jeśli nie zalogowany, przekieruj do logowania
  if (!session) {
    redirect("/login");
  }

  // Jeśli nie jest klientem, przekieruj do dashboardu
  if (session.user.role !== "CLIENT") {
    redirect("/dashboard");
  }

  // Pobierz strony do wyświetlenia w nagłówku
  const navigationPages = await db.page.findMany({
    where: {
      isPublished: true,
      showInHeader: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      title: true,
      slug: true,
    },
  });

  return (
    <div className="min-h-screen bg-[var(--dishly-background)]">
      <MainHeader
        user={{
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          role: session.user.role,
        }}
        navigationPages={navigationPages}
      />
      <main>{children}</main>
    </div>
  );
}
