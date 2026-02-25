# 📈 Etap 8: Statystyki, Opinie i Funkcje PWA

Ostatni etap projektu **DISHLY** ma na celu przekształcenie prostej aplikacji zamówieniowej w dojrzały produkt analityczny i mobilny. Skupiamy się tutaj na zbieraniu feedbacku, wizualizacji danych biznesowych dla właścicieli oraz zapewnieniu doświadczenia zbliżonego do aplikacji natywnej na smartfonach.

---

## 8.1. System Recenzji i Ocen (Feedback Loop)

Budowanie zaufania na platformie DISHLY odbywa się poprzez weryfikowalne opinie.

- **Mechanizm "Tylko dla Klienta":** Zgodnie ze specyfikacją, możliwość wystawienia opinii jest dostępna **wyłącznie po sfinalizowaniu zamówienia** (status: _Dostarczone / Odebrane_). Chroni to restaurację przed fałszywymi ocenami.
- **Formularz opinii:**
  - **Skala gwiazdkowa:** Wybór od 0 do 5 gwiazdek.
  - **Komentarz tekstowy:** Opcjonalny opis wrażeń z zamówienia.
  - **Oceny produktów:** (Rozszerzenie) Możliwość oceny konkretnego dania, a nie tylko całej restauracji.
- **Interfejsy:**
  - **Dla klienta:** Sekcja w profilu umożliwiająca edycję swoich opinii.
  - **Dla restauracji:** Panel widoczny dla Managera i Właściciela do przeglądania opinii o danej lokalizacji.
  - **Dla admina:** Centralne zarządzanie i możliwość usuwania komentarzy naruszających regulamin.

---

## 8.2. Panel Analityczny (Analytical Hub)

Przekształcamy dane z bazy w wiedzę biznesową dla Właściciela sieci restauracji.

- **Zakres Statystyk:**
  - **Przychód:** Łączna kwota zarobiona w danym okresie (filtrowanie po datach).
  - **Liczba zamówień:** Dynamika sprzedaży w czasie.
  - **Ranking produktów:** Zestawienie "Bestsellerów" (najczęściej kupowane dania).
  - **Średnia ocena:** Monitoring poziomu satysfakcji klientów.
- **Hierarchia Widoczności:**
  - **Pracownik/Menadżer:** Widzą statystyki tylko dla lokalu, w którym pracują.
  - **Właściciel:** Ma widok globalny (zbiorczy dla wszystkich lokalizacji) z możliwością porównywania wyników różnych punktów.
- **Technologia:** Użycie biblioteki `recharts` lub `chart.js` do generowania responsywnych wykresów w Next.js.

---

## 8.3. Konfiguracja PWA (Mobilność i Offline)

Aplikacja DISHLY ma stać się funkcjonalną alternatywą dla aplikacji ze sklepów App Store / Play.

- **Manifest Webowy (`manifest.json`):**
  - Definicja kolorów tematycznych, ikon aplikacji i trybu wyświetlania (`standalone`). Dzięki temu po dodaniu do ekranu głównego użytkownik nie widzi paska adresu przeglądarki.
- **Service Workers (next-pwa):**
  - **Zasoby statyczne:** Przechowywanie w pamięci podręcznej CSS-ów, skryptów i czcionek, co przyspiesza działanie aplikacji przy słabym internecie.
  - **Przeglądanie Offline:** Zgodnie ze specyfikacją, system ma umożliwić przeglądanie wcześniej wczytanego menu nawet bez połączenia z siecią.
- **Powiadomienia Push (Opcjonalnie):**
  - Implementacja API powiadomień przeglądarkowych. Powiadamianie klienta w czasie rzeczywistym o zmianie statusu zamówienia (np. _"Twoja pizza wyjechała z kuchni!"_).

---

## 8.4. Profil Klienta i Personalizacja

Dopracowanie sekcji użytkownika dla zapewnienia wygody przy wielokrotnych zamówieniach.

- **Dashboard Klienta:** Ostatnio zamówione dania wyświetlane na samej górze (możliwość zamówienia tego samego zestawu jednym kliknięciem).
- **Zapisane dane:** Możliwość łatwego zarządzania adresami dostawy (np. Praca / Dom) i aktualizacja numeru telefonu.
- **Historia zamówień:** Szczegółowy podgląd przeszłych transakcji z możliwością pobrania potwierdzenia w formacie PDF (opcjonalnie).

---

## ✅ Kryteria zakończenia Etapu 8 (Koniec projektu):

1. [ ] **Flow Opinii:** Po zakończeniu testowego zamówienia, klient otrzymuje możliwość wystawienia oceny, a po jej dodaniu, średnia gwiazdek lokalu w bazie danych zostaje zaktualizowana.
2. [ ] **Poprawne Wykresy:** Właściciel widzi czytelny wykres słupkowy sprzedaży z ostatnich 7 dni dla wszystkich swoich lokali.
3. [ ] **Status "Installable":** Przeglądarka (Chrome/Safari) sugeruje instalację DISHLY jako aplikację na pulpicie smartfona.
4. [ ] **Weryfikacja Limitów (Finisher):** Przed ostatecznym oddaniem projektu, weryfikujemy czy subskrypcje SaaS poprawnie odcinają dostęp przy przekroczeniu terminów płatności lub limitów.
5. [ ] **Szybkość (Lighthouse):** Wynik wydajności (Performance) i PWA w teście Google Lighthouse wynosi powyżej 90 punktów.

**Dobra wiadomość pod Vercel:** Next.js wraz z paczką `@ducanh2912/next-pwa` świetnie radzi sobie z automatyzacją konfiguracji Service Workerów, co sprawia, że wdrożenie funkcji offline jest stosunkowo szybkie i bezpieczne na Twojej infrastrukturze.
