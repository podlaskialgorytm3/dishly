import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[var(--dishly-text)]">
        Moje Zamówienia
      </h1>

      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-6xl">📦</div>
        <h2 className="mb-2 text-xl font-bold text-[var(--dishly-text)]">
          Brak zamówień
        </h2>
        <p className="text-[var(--dishly-text-muted)]">
          Nie masz jeszcze żadnych zamówień. Wróć na stronę główną i złóż
          pierwsze zamówienie!
        </p>
      </div>
    </div>
  );
}
