Krok ZERO to fundament techniczny. Dobrze wykonana inicjalizacja oszczędzi Ci godzin „odkręcania” błędnych konfiguracji w przyszłości. Poniżej znajduje się profesjonalny, szczegółowy plan startowy dla projektu **dishly**.

---

# 🚀 Krok ZERO: Inicjalizacja projektu "dishly"

**Cel:** Przygotowanie czystego, skalowalnego i typowanego środowiska deweloperskiego pod architekturę SaaS.

---

## 0.1. Generowanie szkieletu Next.js

Używamy najnowszego zestawu technologii, który jest wspierany przez Vercel.

- **Komenda inicjalizacyjna:**
  ```bash
  npx create-next-app@latest dishly
  ```
- **Wybory w interfejsie CLI (krytyczne):**
  - **TypeScript:** `Yes` (niezbędny przy skomplikowanej logice menu i ról).
  - **ESLint:** `Yes` (wymuszenie czystego kodu).
  - **Tailwind CSS:** `Yes` (najszybszy sposób na UI restauracji).
  - **`src/` directory:** `Yes` (wyraźne oddzielenie kodu od konfiguracji).
  - **App Router:** `Yes` (standard modern Next.js).
  - **Import Alias:** `@/*`.

---

## 0.2. Architektura Folderów (Project Structure)

W Next.js App Router porządek w `src/` jest kluczowy dla dużych projektów. Po utworzeniu projektu stwórz następującą strukturę:

```text
src/
├── app/              # Router, strony, API (Server Components)
│   ├── (admin)/      # Grupa tras: Panel administratora aplikacji
│   ├── (auth)/       # Grupa tras: Logowanie i rejestracja
│   ├── (client)/     # Grupa tras: Storefront dla klientów
│   ├── (dashboard)/  # Grupa tras: Panel restauracji (owner/staff)
│   └── api/          # Punkty końcowe API, Webhooki Stripe
├── components/       # Komponenty UI wielokrotnego użytku
│   ├── ui/           # Bazowe komponenty (shadcn)
│   ├── forms/        # Złożone formularze (Zod)
│   ├── shared/       # Komponenty wspólne dla wszystkich paneli
│   └── layout/       # Sidebary, Nawigacje dla poszczególnych ról
├── lib/              # Konfiguracja zewnętrznych usług (db.ts, auth.ts, stripe.ts)
├── hooks/            # Własne React Hooks
├── types/            # Globalne definicje TypeScript (next-auth.d.ts)
├── actions/          # Next.js Server Actions (logika biznesowa)
└── constants/        # Stałe, np. stawki VAT, statusy zamówień
```

---

## 0.3. Design System i UI Kit (shadcn/ui)

Aplikacja typu SaaS wymaga profesjonalnego i czystego wyglądu.

1.  **Inicjalizacja shadcn/ui:**
    ```bash
    npx shadcn-ui@latest init
    ```
    _Wybierz: Style: New York, Base Color: Slate/Stone._
2.  **Instalacja niezbędnych ikon (Lucide React):**
    ```bash
    npm install lucide-react
    ```
3.  **Wstępna instalacja komponentów UI:**
    Dodaj te, które będą potrzebne od zaraz: `button, input, table, dialog, card, badge, tabs`.

---

## 0.4. Warstwa Danych (Prisma + PostgreSQL)

Przygotowanie bazy danych do przechowywania skomplikowanych relacji.

1.  **Instalacja Prisma:**
    ```bash
    npm install prisma @prisma/client
    npx prisma init
    ```
2.  **Instancja Bazy Danych:** Stwórz projekt na **Neon.tech** lub **Supabase**. Skopiuj `DATABASE_URL` do pliku `.env`.
3.  **Singleton Prisma Client:** W `src/lib/db.ts` zadeklaruj instancję, aby zapobiec wyciekom połączeń w dewelopmencie:
    ```typescript
    import { PrismaClient } from "@prisma/client";
    declare global {
      var prisma: PrismaClient | undefined;
    }
    export const db = globalThis.prisma || new PrismaClient();
    if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
    ```

---

## 0.5. Środowisko i Kontrola Wersji

1.  **Inicjalizacja Git:** `git init`.
2.  **Repozytorium GitHub:** Stwórz repozytorium `dishly` i podłącz pod lokalny folder.
3.  **Plik `.env`:** Dodaj klucze dla NextAuth i Stripe (puste szablony). Przykładowo:
    ```env
    DATABASE_URL="postgresql://..."
    NEXTAUTH_SECRET="twoj_sekret"
    NEXTAUTH_URL="http://localhost:3000"
    STRIPE_API_KEY="sk_test_..."
    STRIPE_WEBHOOK_SECRET="whsec_..."
    ```

---

## 0.6. Globalna Konfiguracja TypeScript

W `src/types/next-auth.d.ts` rozszerzamy typ sesji, aby TypeScript "rozumiał", że każdy użytkownik ma rolę (potrzebne do Etapu 1):

```typescript
import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      restaurantId?: string;
    } & DefaultSession["user"];
  }
}
```

---

## ✅ Kryteria zakończenia Kroku ZERO:

1. [ ] Aplikacja odpala się bez błędów przez `npm run dev`.
2. [ ] Folder `src/lib` zawiera działający `db.ts`.
3. [ ] Polecenie `npx prisma migrate dev` przechodzi pomyślnie (nawet z pustym schematem).
4. [ ] Folder `components/ui` posiada zainstalowane bazowe elementy shadcn.
5. [ ] Repozytorium GitHub posiada pierwszy "Initial Commit".

Dopiero z tak przygotowanym środowiskiem jesteś gotowy, by zacząć budować **Etap 1: Fundamenty i Modele Bazy Danych**.
