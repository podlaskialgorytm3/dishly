# 🛒 Etap 5: Aplikacja Klienta (Storefront & Search)

Celem tego etapu jest stworzenie kompletnego doświadczenia dla użytkownika końcowego – od momentu wejścia na platformę, przez znalezienie idealnego posiłku dopasowanego do preferencji zdrowotnych, aż po skompletowanie zamówienia w koszyku.

---

## 5.1. Dashboard Klienta i Geolokalizacja

Pierwszy punkt styku klienta z aplikacją DISHLY. Strona główna musi być dynamiczna i spersonalizowana.

- **Inteligentne Wykrywanie Lokalizacji:**
  - Integracja z API geolokalizacji przeglądarki.
  - Możliwość ręcznego wpisania adresu (szablony adresów dla zalogowanych użytkowników).
  - **Wynik:** Filtrowanie widocznych restauracji na podstawie ich "Obszaru dostawy" zdefiniowanego przez właściciela w Etapie 3.
- **Centrum Nawigacyjne:**
  - Sekcja "Ostatnie zamówienia" (tylko dla zalogowanych) umożliwiająca szybkie ponowienie zakupu.
  - Szybkie kategorie: Kafelki graficzne (Pizza, Sushi, Burgery) oparte na globalnych typach kuchni.
  - Slider z promocjami oraz sekcja "Polecane" wykorzystująca dane o ocenach i popularności lokali.

## 5.2. Zaawansowane Wyszukiwanie i Multi-Filtrowanie

DISHLY wyróżnia się szczegółowością danych, co musi zostać odzwierciedlone w potężnym silniku filtrów.

- **Filtry Restauracji:**
  - Ilość gwiazdek (0-5), średnia cena, typ kuchni.
  - **Udogodnienia (Tagi):** Możliwość wyszukania miejsc przyjaznych dzieciom, z Wi-Fi, ogródkiem letnim czy parkingiem.
- **Filtry Dietetyczne i Żywieniowe (Nutritional Search):**
  - **Makroskładniki:** Suwaki (sliders) umożliwiające określenie przedziału kalorii [kcal], ilości białka, węglowodanów i tłuszczów na 100g posiłku.
  - **Preferencje:** "Wegetariańskie", "Wegańskie".
  - **Poziom Ostrości:** Wybór poziomu ostrości w przedziale 0-9.
- **Wyniki wyszukiwania:** Dynamiczne odświeżanie listy (React Server Actions lub Client-side filtering) przy każdej zmianie parametrów.

## 5.3. Interaktywna Karta Lokalu i Wybór Produktu

Widok menu restauracji to kluczowy moment decyzyjny klienta.

- **Nagłówek lokalu:** Wyświetlanie zdjęcia głównego, logotypu, ocen oraz dynamicznej informacji: "Dostawa od: [X] zł", "Minimalne zamówienie: [Y] zł".
- **Sekcje Menu:** Grupowanie dań w czytelne kategorie (Przystawki, Dania Główne, Desery).
- **Konfigurator Posiłku (Modal):** Po kliknięciu w danie pojawia się okno z:
  - Wyborem **Wariantów** (np. Mała / Duża).
  - Wyborem **Dodatków** (z walidacją "maxQuantity" zdefiniowaną w Etapie 4).
  - Możliwością dodania notatki dla kucharza.
  - Wyborem ilości sztuk.

## 5.4. Logika Smart-Koszyka (Zustand State Management)

System DISHLY posiada rygorystyczne reguły dotyczące składania zamówień, które musisz zaimplementować po stronie frontendu.

- **Zasada "Jedna Restauracja - Jeden Koszyk":**
  - Użytkownik może dodawać dania tylko z jednej restauracji.
  - **Logic Check:** Przy próbie dodania dania z restauracji B, gdy w koszyku są produkty z restauracji A, system wyświetla komunikat: _"Czy chcesz wyczyścić koszyk z poprzedniej restauracji?"_.
- **Ochrona przed Nadużyciami (Cyberdręczenie):**
  - Implementacja limitów narzuconych przez właściciela (max ilość sztuk w koszyku / max wartość koszyka).
- **Podsumowanie Real-time:**
  - Automatyczne doliczanie kosztu dostawy specyficznego dla danego punktu.
  - Weryfikacja minimalnej kwoty zamówienia – przycisk "Zamów" jest zablokowany, dopóki wartość produktów nie osiągnie minimum lokalu.
  - Obsługa kodów rabatowych zarządzanych przez właściciela.

---

## ✅ Kryteria zakończenia Etapu 5:

1. **Persystencja Koszyka:** Po odświeżeniu strony zawartość koszyka nie znika (użycie `persist` middleware w **Zustand** i localStorage).
2. **Precyzyjne Filtrowanie:** Ustawienie filtra "Białko: >20g" ukrywa wszystkie dania, które nie spełniają tego kryterium w całej okolicy.
3. **Obsługa Braku Dostępności:** Produkty z flagą `isAvailable: false` są wyświetlane w menu jako "Niedostępne" i przycisk dodawania do koszyka jest dla nich wyłączony.
4. **Responsywność:** Storefront działa płynnie na urządzeniach mobilnych (zasada Mobile First).
5. **Autoryzacja Adresów:** Jeśli użytkownik jest zalogowany, adres dostawy podstawia się automatycznie z jego profilu.

**Podpowiedź techniczna:**
Użyj biblioteki **Lucide React** do ikon filtrów dietetycznych oraz **Framer Motion** do płynnych przejść przy otwieraniu modalów konfiguracji dań. Logika geolokalizacji powinna najpierw sprawdzać `navigator.geolocation`, a w razie braku zgody klienta, przekierować go do pola tekstowego wyszukiwania adresu.
