import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/layout/Footer";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

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
    <>
      <MainHeader user={session?.user} navigationPages={navigationPages} />
      <main className="min-h-screen bg-[#FAFAFA]">{children}</main>
      <Footer />
    </>
  );
}
