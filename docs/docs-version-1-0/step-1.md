Oto szczegółowy opis **Etapu 1**, przygotowany w formacie `.md`. Dokument ten pełni rolę technicznego przewodnika ("Deep Dive") dla Twojego zespołu deweloperskiego lub Twojej własnej pracy nad projektem DISHLY.

---

# 🏗 Etap 1: Fundamenty, Infrastruktura i Baza Danych

Ten etap jest najważniejszym punktem projektu. Poprawna struktura bazy danych i systemu uprawnień na samym początku zapobiegnie kosztownym refaktoryzacjom w fazie rozwoju aplikacji SaaS.

---

## 1.1. Inicjalizacja Środowiska Next.js

Pierwszym krokiem jest stworzenie czystego projektu opartego o architekturę **App Router**.

- **Komenda inicjalizacyjna:**
  ```bash
  npx create-next-app@latest dishly-app --typescript --tailwind --eslint
  ```
- **Wymagane parametry:**
  - **App Router:** Tak (zalecane przez Next.js dla nowych projektów).
  - **Src directory:** Tak (dla lepszej segregacji kodu).
  - **Import Alias:** `@/*`.
- **Zadania uzupełniające:**
  - Konfiguracja `tsconfig.json` dla rygorystycznego sprawdzania typów.
  - Instalacja biblioteki komponentów **shadcn/ui** (`npx shadcn-ui@latest init`).

---

## 1.2. Konfiguracja Prisma & PostgreSQL

DISHLY wymaga relacyjnej bazy danych do obsługi złożonych zależności (np. zamówienie -> restauracja -> lokalizacja).

- **Instalacja:** `npm install prisma @prisma/client` oraz `npx prisma init`.
- **Baza danych:** Rekomendowane użycie instancji **Neon.tech** (Serverless PostgreSQL) lub **Supabase** dla łatwego deployu.
- **Plik `.env`:** Konfiguracja `DATABASE_URL` i `DIRECT_URL`.
- **Podstawowe zapytania:** Skonfigurowanie instancji Prisma Client w `@/lib/db.ts`, aby uniknąć tworzenia wielu połączeń w deweloperskim przeładowaniu strony (Hot Reload).

---

## 1.3. Definicja Schematu Bazy Danych (Prisma Schema)

Najważniejszy element Etapu 1. Poniżej znajdują się wymagane modele i ich kluczowe pola.

### A. Autentykacja i Role (User)

```prisma
enum Role {
  ADMIN      // Zarządca DISHLY
  OWNER      // Właściciel sieci restauracji
  MANAGER    // Manager konkretnej lokalizacji
  WORKER     // Pracownik operacyjny
  CLIENT     // Klient końcowy
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          Role      @default(CLIENT)
  firstName     String?
  lastName      String?
  addresses     Address[]
  orders        Order[]
  ownedRestaurants Restaurant[] // Tylko dla OWNER
  workingAt     Location?  @relation(fields: [locationId], references: [id])
  locationId    String?
}
```

### B. Subskrypcje (SaaS Logic)

Pakiety stworzone przez Admina dla Restauracji.

- **SubscriptionPlan:** `name`, `price`, `currency`, `interval` (monthly/yearly), `maxMeals`, `maxLocations`, `maxStaffAccounts`.

### C. Struktura Biznesowa (Restaurant & Location)

Podział na markę (Restauracja) i fizyczne punkty (Lokalizacja).

- **Restaurant:** `name`, `logoUrl`, `bio`, `ownerId`.
- **Location:** `address`, `phone`, `deliveryRadius`, `deliveryFee`, `minOrderValue`, `openingHours` (JSON: tablica dni z godzinami).

### D. Katalog Menu (Meal & Variants)

Zgodnie ze stroną 9 i 10 specyfikacji PDF.

- **Category:** np. "Pizza", "Burgery".
- **Meal:** `name`, `description`, `basePrice`, `preparationTime`, `calories`, `protein`, `carbs`, `fat`, `spiceLevel` (0-9).
- **MealVariant:** `name`, `priceModifier` (np. Rozmiar L: +10zł).
- **MealAddon:** `name`, `price`, `maxQuantity`.

### E. Zamówienia (Orders)

- **Order:** `totalPrice`, `status` (ENUM: NEW, PROCESSING, READY, DELIVERED, CANCELLED), `paymentStatus`, `type` (DELIVERY/PICKUP).

---

## 1.4. NextAuth Setup & RBAC

System logowania musi rozpoznawać, czy użytkownik ma dostęp do panelu restauracji, czy tylko do panelu klienta.

- **Dostawca:** `CredentialsProvider` (Email + Hasło).
- **Bezpieczeństwo:** Haszowanie haseł przy użyciu `bcrypt`.
- **Middleware Uprawnień:**
  - Ochrona tras `/admin/**` tylko dla roli `ADMIN`.
  - Ochrona `/dashboard/**` tylko dla roli `OWNER`, `MANAGER`, `WORKER`.
- **JWT Callback:** Konfiguracja NextAuth tak, aby rola (`role`) była zapisana w tokenie JWT i dostępna w sesji (`useSession`) bez konieczności ponownego pytania bazy danych przy każdej akcji.

---

## ✅ Kryteria zakończenia Etapu 1:

1. [ ] Wykonana komenda `npx prisma db push` bez błędów w schemacie.
2. [ ] Możliwość zarejestrowania nowego użytkownika (Client) w bazie danych.
3. [ ] Działający middleware przekierowujący niezalogowanych użytkowników z chronionych stron na `/login`.
4. [ ] Widoczna rola użytkownika w obiekcie sesji po stronie klienta.
5. [ ] Plik `.env` zawiera bezpieczne klucze dla bazy danych i NextAuth.
