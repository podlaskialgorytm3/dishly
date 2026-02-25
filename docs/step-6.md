# 💳 Etap 6: Realizacja Zamówień i Płatności

Celem tego etapu jest przekształcenie wirtualnego koszyka w wiążące zamówienie prawno-finansowe. Proces ten łączy interfejs użytkownika z systemem płatności Stripe oraz logiką biznesową zmiany stanów zamówienia w bazie danych.

---

## 6.1. Proces Checkout (Logistyka Zamówienia)

Gdy klient kliknie przycisk "Zamów" w koszyku, przechodzi do formularza finalizacji, który musi obsłużyć dwa tryby zdefiniowane w specyfikacji: **Dostawa do domu** lub **Odbiór osobisty**.

- **Interfejs wyboru:** Jasny przełącznik (toggle) między dostawą a odbiorem.
- **Zarządzanie adresem:**
  - **Użytkownicy niezalogowani:** Muszą każdorazowo wypełnić formularz: Ulica, nr domu/mieszkania, kod pocztowy, miasto oraz numer telefonu.
  - **Użytkownicy zalogowani:** System automatycznie pobiera zapisane adresy z profilu. Możliwość wyboru "Szablonu adresu" (np. Dom, Biuro).
- **Dodatkowe informacje:**
  - Pole "Notatka do zamówienia" (np. "Kod do domofonu 123", "Bez sztućców").
  - Wybór szacowanej godziny odbioru/dostawy (jeśli restauracja dopuszcza zamówienia na konkretną godzinę).
- **Weryfikacja końcowa:** Server-side check czy restauracja jest nadal otwarta i czy koszyk nie uległ zmianie (ceny/dostępność) w trakcie wypełniania formularza.

## 6.2. Integracja z Stripe (Płatności Online)

Zgodnie z wymaganiami, płatności w pierwszej wersji aplikacji są realizowane za pomocą **Stripe** (początkowo w wersji testowej).

- **Generowanie sesji (Checkout Session):**
  - Po kliknięciu "Zapłać i zamów", backend Next.js generuje `stripe.checkout.sessions.create`.
  - Do Stripe przesyłane są: `totalPrice`, `orderId` oraz lista pozycji (dla przejrzystości na wyciągu).
  - Użytkownik zostaje przekierowany na bezpieczną stronę płatności Stripe.
- **Obsługa Webhooków (`/api/webhooks/stripe`):**
  - System musi nasłuchiwać na zdarzenie `checkout.session.completed`.
  - **Kluczowa logika:** Dopiero po otrzymaniu potwierdzenia z Stripe, zamówienie w bazie danych zmienia status na **"Nowe" (NOWE)** i pojawia się w panelu restauracji.
- **Obsługa błędów:** Jeśli płatność zostanie odrzucona, system przekierowuje użytkownika z powrotem do checkoutu z informacją o błędzie.

## 6.3. Cykl Życia Zamówienia i Statusy

Po pomyślnej płatności zamówienie przechodzi przez proces operacyjny. Każdy status posiada przypisany intuicyjny kolor (np. Zielony dla "Gotowe", Czerwony dla "Anulowane").

- **Statusy zgodnie ze specyfikacją:**
  1.  **Nowe:** Zamówienie opłacone, oczekuje na akceptację przez pracownika lokalu.
  2.  **W trakcie przygotowania:** Pracownik zaakceptował zamówienie, posiłek jest realizowany w kuchni.
  3.  **Gotowe:** Zamówienie czeka na odbiór osobisty lub na kuriera.
  4.  **Odebrane / Dostarczone:** Proces realizacji zakończony sukcesem.
  5.  **Anulowane:** Zamówienie odrzucone przez restaurację lub anulowane przez klienta (jeśli zasady lokalu na to pozwalają).

## 6.4. Automatyzacja Czasu Realizacji

System DISHLY dodatkowo wspomaga logistykę poprzez inteligentne wyliczanie czasu oczekiwania.

- **Ustawienia ręczne:** Możliwość ustawienia przez pracownika szacowanego czasu przygotowania (np. +15 min przy dużym ruchu).
- **Automatyczne obliczenia:**
  - System sumuje średni czas przygotowania dań z koszyka.
  - Uwzględnia liczbę zamówień aktualnie będących "W trakcie przygotowania" (kolejka).
- **Informowanie klienta:** Aktualizacja "przewidywanej godziny odbioru" widoczna w czasie rzeczywistym w panelu klienta.

---

## ✅ Kryteria zakończenia Etapu 6:

1.  **Flow Finansowy:** Przejście przez płatność testową Stripe kończy się przekierowaniem na stronę sukcesu `/order/success/[id]`.
2.  **Webhook Reliability:** Nawet jeśli użytkownik zamknie kartę przeglądarki podczas płatności, status zamówienia w bazie zmieni się poprawnie dzięki webhookowi.
3.  **Integracja Bazy Danych:** Rekord zamówienia posiada relację do `User` (jeśli zalogowany), `Location` (konkretny punkt restauracji) oraz tabelę `OrderItems` z listą wybranych wariantów i dodatków.
4.  **Szablony Adresów:** Zalogowany użytkownik widzi listę swoich 3 ostatnio używanych adresów i może je wybrać jednym kliknięciem.
5.  **Logika Notatek:** Notatki wprowadzone przez klienta w checkoucie są poprawnie przesyłane do widoku panelu operacyjnego pracownika (Etap 7).

**Podpowiedź techniczna:**
Do obsługi statusów w bazie PostgreSQL najlepiej wykorzystać `ENUM`. Pamiętaj o zabezpieczeniu webhooka Stripe za pomocą `stripe-signature`, aby nikt nie mógł "sfałszować" potwierdzenia wpłaty wysyłając fałszywy request do Twojego API.
