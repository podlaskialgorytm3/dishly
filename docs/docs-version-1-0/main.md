# 🍔 DISHLY - Specyfikacja Implementacji (SaaS Food Delivery Platform)

System klasy SaaS do obsługi zamówień jedzenia, wspierający wielopoziomowe role użytkowników, zarządzanie wieloma lokalizacjami oraz tryb PWA.

## 🛠 Tech Stack

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Baza danych:** PostgreSQL (Neon.tech / Supabase)
- **ORM:** Prisma
- **Autentykacja:** NextAuth.js
- **Stylizacja:** Tailwind CSS + Shadcn/ui
- **State Management:** Zustand (koszyk i sesja)
- **Płatności:** Stripe (Test Mode)
- **Real-time:** Supabase Realtime / Pusher (statusy zamówień)

---

## 📅 ROADMAP PROJEKTU

### 🏗 ETAP 1: Fundamenty, Infrastruktura i Baza Danych

**Cel:** Skonfigurowanie środowiska i modelu danych umożliwiającego skalowanie SaaS.

- [ ] **Inicjalizacja Next.js:** Konfiguracja TypeScript, ESLint, Tailwind CSS.
- [ ] **Konfiguracja Prisma:** Połączenie z PostgreSQL.
- [ ] **Definicja Schematu bazy danych:**
  - `User` & `Account`: Obsługa ról (ADMIN, OWNER, MANAGER, WORKER, CLIENT).
  - `SubscriptionPlan`: Limity dań, lokalizacji i kont.
  - `Restaurant`: Dane globalne marki + relacja do lokalizacji.
  - `Location`: Adresy, godziny otwarcia, koszty dostawy.
  - `Menu`: Kategorie, Dania (`Meal`), Warianty (`MealVariant`), Dodatki (`MealAddon`).
  - `Order`: Relacje do lokalu, klienta, pozycje zamówienia, statusy.
- [ ] **NextAuth Setup:** Logowanie Credentials (Email/Password) + Role-based access logic.

### 👑 ETAP 2: Panel Administratora Systemu (Backoffice)

**Cel:** Zarządzanie ekosystemem DISHLY.

- [ ] **Zarządzanie Planami Subskrypcyjnymi:** CRUD dla pakietów cenowych i limitów.
- [ ] **System Akceptacji Restauracji:** Widok weryfikacji nowo zarejestrowanych firm.
- [ ] **Globalne Słowniki:** Zarządzanie bazą typów kuchni, etykiet (wege, ostre) i udogodnień (Wi-Fi, parking).
- [ ] **Moderacja:** Możliwość usuwania opinii i blokowania użytkowników.

### 🏢 ETAP 3: Onboarding Restauracji i Struktura (Panel Właściciela)

**Cel:** Umożliwienie restauracjom wejścia na platformę.

- [ ] **Rejestracja biznesowa:** Wybór planu -> Formularz danych firmy -> Status "Oczekujący".
- [ ] **Konfiguracja lokali:** Dodawanie wielu adresów (punktów sprzedaży) w ramach jednej restauracji.
- [ ] **Zarządzanie Pracownikami:** System zaproszeń dla Managerów i Pracowników z przypisaniem do konkretnych lokalizacji.
- [ ] **Zarządzanie Widocznością:** Ustawienia, co dana rola (Manager/Worker) widzi w panelu.

### 🍕 ETAP 4: Cyfrowa Karta Menu (CMS Menu)

**Cel:** Implementacja zaawansowanego kreatora posiłków zgodnie z modelem danych.

- [ ] **Kreator dań:** Formularz dodawania dania (nazwa, opis, gramatura, makroskładniki, kalorie, poziom ostrości).
- [ ] **Warianty i Dodatki:** Obsługa różnych rozmiarów (mała/duża pizza) oraz opcjonalnych dodatków (sosy, ser).
- [ ] **Walidacja limitów:** Blokada dodania dań po przekroczeniu limitu z planu subskrypcji.
- [ ] **Zarządzanie dostępnością:** Przełącznik `isAvailable` (wyłączanie dań, gdy brakuje składników).

### 🛒 ETAP 5: Aplikacja Klienta (Storefront & Search)

**Cel:** Proces przeglądania i wybierania produktów.

- [ ] **Strona Główna (Dashboard):** Wyszukiwarka, geolokalizacja, kafelki z kategoriami i promocjami.
- [ ] **Filtrowanie Zaawansowane:** Sortowanie po cenie, ocenach, dystansie, kcal i makroskładnikach.
- [ ] **Karta lokalu:** Widok menu z podziałem na sekcje.
- [ ] **Logika Koszyka:** Obsługa stanów lokalnych (Zustand), blokada zamawiania z wielu restauracji jednocześnie.

### 💳 ETAP 6: Realizacja Zamówień i Płatności

**Cel:** Finalizacja procesu sprzedażowego.

- [ ] **Proces Checkout:** Formularz adresu (autouzupełnianie dla zalogowanych), notatki do zamówienia.
- [ ] **Integracja Stripe:** Generowanie Checkout Session i obsługa webhooków do zmiany statusu płatności.
- [ ] **Statusy zamówień:** Nowe, W przygotowaniu, Gotowe, Dostarczone/Odebrane, Anulowane.

### 👨‍🍳 ETAP 7: System Operacyjny Kuchni i Real-time

**Cel:** Narzędzia dla pracowników do realizacji zamówień.

- [ ] **Panel zamówień LIVE:** Lista wpadających zamówień z automatycznym odświeżaniem (Server Actions / Webhooks).
- [ ] **Manager Czasu:** Ręczne i automatyczne wyliczanie czasu przygotowania zamówienia.
- [ ] **Display Board (McDonald's Mode):** Specjalny widok pełnoekranowy `/status-board` dla klientów oczekujących na miejscu.

### 📈 ETAP 8: Statystyki, Opinie i Funkcje PWA

**Cel:** Analityka biznesowa, feedback i mobilność.

- [ ] **System ocen:** Wystawianie gwiazdek i opinii po odebraniu jedzenia (tylko dla zweryfikowanych zamówień).
- [ ] **Statystyki sprzedaży:** Wykresy przychodów, popularności dań i ilości zamówień dla Właściciela.
- [ ] **Konfiguracja PWA:**
  - Plik `manifest.json`.
  - Service Worker do cache'owania assetów i pracy w trybie offline (przeglądanie menu).
  - Obsługa ikony na ekranie głównym urządzenia mobilnego.

---

## 🔒 Bezpieczeństwo i Normy (RODO)

- Szyfrowanie haseł (BCrypt).
- Ochrona tras (`middleware.ts`) – weryfikacja uprawnień serwerowych.
- Logika retencji danych zgodnie z dokumentacją odniesienia (Punkt 1.4 specyfikacji).
