# 🍕 Etap 4: Cyfrowa Karta Menu (CMS Menu)

Celem tego etapu jest stworzenie serca oferty restauracji – zaawansowanego systemu zarządzania menu (CMS). System musi obsłużyć zarówno proste dania, jak i złożone produkty z wariantami i dodatkami, zachowując przy tym rygorystyczne limity subskrypcji SaaS.

---

## 4.1. Kreator Posiłków (Advanced Meal Form)

Właściciel lub Menadżer (o ile ma przyznane uprawnienia) może tworzyć bazę produktów. Każdy posiłek jest opisywany zestawem bardzo szczegółowych cech:

- **Informacje podstawowe:**
  - Nazwa posiłku.
  - Zdjęcie (opcjonalne).
  - Opis produktu (szczegóły oferty).
  - Cena bazowa.
- **Kategoryzacja:** Przypisanie do kategorii (np. Napoje, Dania główne) zdefiniowanej przez restaurację lub administratora.
- **Parametry logistyczne:**
  - Czas przygotowania (wykorzystywany później do estymacji dla klienta).
  - Gramatura (masa netto posiłku).
- **Profil dietetyczny i zdrowotny:**
  - **Makroskładniki:** Ilość białka, węglowodanów i tłuszczy w 100g produktu.
  - **Kaloryczność:** Łączna ilość kalorii [kcal].
  - **Poziom ostrości:** Skala od 0 do 9 (pozwala klientowi filtrować dania pod kątem preferencji).
  - **Oznaczenia specjalne:** Flagi informacyjne (np. produkt wegetariański, wegański).

## 4.2. Warianty i Modyfikatory (Meal Variants & Addons)

System DISHLY nie ogranicza się do prostych produktów. Wspiera dynamiczną konfigurację dania podczas dodawania do koszyka.

- **MealVariant (Warianty):** Służą do definiowania np. rozmiarów dania.
  - Atrybuty: Nazwa (np. "Duża pizza 42cm"), Modyfikator ceny (np. +10,00 zł do ceny bazowej).
- **MealAddon (Dodatki):** Służą do personalizacji (np. extra ser, sosy).
  - Atrybuty: Nazwa, Cena, Wymagalność (czy klient musi coś wybrać), Maksymalna ilość (np. klient może wybrać maksymalnie 3 darmowe sosy).
- **Zasada działania:** Po stworzeniu głównego "modelu" dania, restauracja może przypisać do niego nieskończenie wiele wariantów i dodatków, które zostaną zaprezentowane klientowi w oknie wyboru.

## 4.3. Mechanizm Dystrybucji do Lokalizacji

Zgodnie z ideą zarządzania siecią, proces publikacji menu jest dwuetapowy:

1. **Stworzenie globalnego menu:** Właściciel tworzy danie w głównym panelu restauracji.
2. **Przypisanie do lokalu:** Po stworzeniu posiłku, właściciel decyduje, czy dany produkt jest dostępny we wszystkich lokalizacjach, czy tylko w wybranych (np. oferta sezonowa dostępna tylko w jednym punkcie w mieście).

## 4.4. Walidacja Limitów Subskrypcyjnych

Jako platforma SaaS, DISHLY kontroluje ilość danych wprowadzanych przez restaurację.

- **Kontrola "Miejsca w Menu":** Każdy nowo utworzony posiłek zajmuje dokładnie jedno miejsce z limitu przewidzianego w wybranej subskrypcji.
- **Logika systemowa:** Podczas próby zapisu nowego dania, system wykonuje zapytanie: `COUNT(meals)` vs `subscriptionPlan.maxMeals`. W przypadku przekroczenia limitu, przycisk zapisu zostaje zablokowany, a użytkownik otrzymuje komunikat o konieczności przejścia na wyższy plan subskrypcji u Administratora.

## 4.5. Operacyjne Zarządzanie Dostępnością (Live Status)

W pracy restauracyjnej dynamicznie zmienia się dostępność produktów (np. brak składnika).

- **Przełącznik isAvailable:** Szybki przycisk (toggle) w panelu Menadżera i Właściciela. Pozwala natychmiast ukryć danie z menu klienta bez konieczności jego usuwania.
- **Integracja:** Dania z `isAvailable = false` stają się niewidoczne w wyszukiwarce klienta i nie można ich dodać do koszyka, dopóki personel ich nie "odblokuje".

---

## ✅ Kryteria zakończenia Etapu 4:

1. **Złożony Formularz (Next.js + Zod):** Właściciel może dodać danie uzupełniając wszystkie pola makroskładników i poziomu ostrości.
2. **Baza Danych (PostgreSQL/Prisma):** Poprawne zapisanie relacji: Posiłek -> Warianty (rozmiary) -> Dodatki.
3. **Inteligentny Licznik:** Restauracja z limitem 10 dań po dodaniu dziesiątego produktu traci możliwość utworzenia kolejnego.
4. **Filtry Dietetyczne:** Posiłki poprawnie zapisują flagi "vege" oraz "vegan", co przygotowuje grunt pod filtry wyszukiwania klienta.
5. **UI Reaktywne:** Zmiana statusu `isAvailable` na "false" skutkuje natychmiastowym zniknięciem dania z publicznej strony restauracji (pobieranie danych w Next.js uwzględniające ten parametr).

**Podpowiedź techniczna (Models):**
Model `Meal` powinien zawierać pole `restaurantId` (globalne) oraz tabelę łącznikową lub pole tablicowe przypisujące dany posiłek do `LocationId`, aby uniknąć wielokrotnego wpisywania tych samych danych dla różnych punktów sieci.
