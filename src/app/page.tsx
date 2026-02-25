import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // Jeśli użytkownik jest zalogowany, przekieruj do dashboardu
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-gray-50 to-gray-100">
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-900">
          Witaj w <span className="text-blue-600">DISHLY</span>
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Platforma do zamawiania jedzenia online dla restauracji i klientów
        </p>

        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Zaloguj się
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Zarejestruj się jako klient
            </Button>
          </Link>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-2xl font-bold text-gray-900">
                Dla Klientów
              </h2>
              <p className="mb-4 text-gray-600">
                Zamawiaj jedzenie z Twoich ulubionych restauracji z wygodą
                dostawy do domu.
              </p>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Załóż konto klienta
                </Button>
              </Link>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-2xl font-bold text-gray-900">
                Dla Restauracji
              </h2>
              <p className="mb-4 text-gray-600">
                Dołącz do platformy DISHLY i zacznij przyjmować zamówienia
                online.
              </p>
              <Link href="/register-owner">
                <Button className="w-full">Zarejestruj restaurację</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
