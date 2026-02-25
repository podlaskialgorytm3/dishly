import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MainHeader } from "@/components/layout/MainHeader";

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

  return (
    <div className="min-h-screen bg-[var(--dishly-background)]">
      <MainHeader
        user={{
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          role: session.user.role,
        }}
      />
      <main>{children}</main>
    </div>
  );
}
