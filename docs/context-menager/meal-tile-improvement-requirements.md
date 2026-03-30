# Wymagania: Usprawnienie Kafelka Posiłku/Restauracji

## 📋 Kontekst
Obecny widok kafelka restauracji wymaga poprawy hierarchii wizualnej oraz dodania nowych funkcjonalności, aby lepiej służyć użytkownikom przy wyborze restauracji.

**Plik referencyjny:** `docs/context-menager/image.png`

---

## 🎯 Główny Problem
**Niejasna hierarchia wizualna** - użytkownik nie wie, na czym skupić uwagę w pierwszej kolejności.

---

## 📊 Hierarchia Informacji (od najważniejszej)

### 1. **KOSZT DOSTAWY** 👑
- **Wymaganie:** Najbardziej wyróżniony element kafelka
- **Sugestie implementacji:**
  - Większy rozmiar czcionki
  - Pogrubienie (bold/extra-bold)
  - Wyróżnienie kolorem (np. kolor primary aplikacji)
  - Możliwe umieszczenie w kontrastowym badge'u

### 2. **Ocena Restauracji** ⭐
- **Wymaganie:** System gwiazdkowy 5-stopniowy
- **Implementacja:**
  - Pełne gwiazdki (zamalowane) - dla pełnych punktów
  - Puste gwiazdki (szare) - dla brakujących punktów
  - **Przykład:** 4/5 → ★★★★☆ (4 żółte/zamalowane, 1 szara)
- **Umiejscowienie:** Dobrze widoczne, blisko nazwy restauracji

### 3. **Czas Dostawy** ⏱️
- **Wymaganie:** Wyświetlanie przewidywanego czasu (np. "25-35 min")
- **Implementacja:**
  - Dobrze widoczne umiejscowienie
  - Możliwa ikona zegara przed tekstem
  - Czytelna czcionka

### 4. **Nazwa Restauracji**
- Obecna pozycja może zostać, ale powinna być wyraźnie oddzielona od innych informacji

### 5. **Typ Kuchni**
- Pozostaje jako informacja pomocnicza

### 6. **Minimalne Zamówienie**
- Informacja pomocnicza, mniej wyróżniona

### 7. **Lokalizacja**
- Informacja pomocnicza

---

## ✨ Nowe Funkcjonalności

### 1. **Przycisk "Dodaj do Ulubionych"** ❤️

#### Dla Użytkowników Zalogowanych:
- **Wymaganie:** Ikona serca (outline/filled)
- **Funkcjonalność:**
  - Kliknięcie dodaje/usuwa z ulubionych
  - Stan zapisywany w bazie danych użytkownika
  - Wizualna zmiana (np. puste serce → wypełnione serce)
  - Możliwa animacja przy kliknięciu
- **Umiejscowienie:** Sugestia - prawy górny róg zdjęcia (jako floating button)

#### Dla Użytkowników Niezalogowanych:
- **Opcja A:** Brak ikony (ukryta dla niezalogowanych)
- **Opcja B:** Ikona widoczna, wykorzystująca LocalStorage
  - Kliknięcie zapisuje w LocalStorage przeglądarki
  - Informacja o ulubionych dostępna tylko lokalnie
  - Może pokazać komunikat "Zaloguj się, aby zapisać ulubione na stałe"

**DECYZJA DO PODJĘCIA:** Wybór między Opcją A i B

---

## 🏷️ Tagi/Badges

### Wymaganie: **Pozostają na obecnym miejscu (dół kafelka)**
- Szybka dostawa
- Popularne
- Premium
- (Ewentualnie rozszerzenie o: NOWOŚĆ, PROMOCJA)

---

## 🎨 Sugestie Layoutu

### Propozycja Struktury Kafelka (od góry):
```
┌─────────────────────────────────────┐
│                                     │
│         ZDJĘCIE POSIŁKU            │ ← ❤️ (prawy górny róg)
│                                     │
├─────────────────────────────────────┤
│ Nazwa Restauracji                  │
│ ⭐⭐⭐⭐☆ (4.0)                      │
├─────────────────────────────────────┤
│ Kuchnia Tajska                      │
│                                     │
│ 📍 Warszawa    🕐 25-35 min        │
│                                     │
│ 🚚 od 6,99 zł  💰 Min. 30.00 zł    │ ← Koszt dostawy WYRÓŻNIONY
│                                     │
│ [Szybka dostawa] [Popularne]       │
└─────────────────────────────────────┘
```

**Uwaga:** To tylko propozycja - layout do dopracowania w fazie projektowania

---

## 📱 Responsywność

### Wymagania:
- Kafelek musi dobrze wyglądać na:
  - Desktop (grid 3-4 kolumny)
  - Tablet (grid 2 kolumny)
  - Mobile (1 kolumna lub 2 małe kolumny)
- Wszystkie kluczowe informacje muszą pozostać czytelne na każdym urządzeniu

---

## ♿ Dostępność (Accessibility)

### Wymagania:
- Odpowiedni kontrast kolorów (WCAG AA minimum)
- Alt teksty dla zdjęć
- Aria-labels dla interaktywnych elementów
- Możliwość nawigacji klawiaturą
- Screen reader friendly (szczególnie oceny w gwiazdkach)

---

## 🔄 Interakcje

### Hover Effect (Desktop):
- Subtelne powiększenie/cień
- Zmiana kursora na pointer
- Ewentualne podświetlenie

### Kliknięcie:
- Przekierowanie do strony restauracji
- Wyjątek: Kliknięcie w ❤️ → dodanie/usunięcie z ulubionych (bez przekierowania)

---

## 🚀 Priorytety Implementacji

### Must Have (Priorytet 1):
1. ✅ Poprawa hierarchii wizualnej - wyróżnienie kosztu dostawy
2. ✅ Dodanie oceny w gwiazdkach
3. ✅ Dodanie czasu dostawy
4. ✅ Funkcjonalność "Dodaj do ulubionych"

### Should Have (Priorytet 2):
- Animacje i efekty hover
- Optymalizacja responsywności
- Testy A/B różnych layoutów

### Nice to Have (Priorytet 3):
- Dodatkowe badges (NOWOŚĆ, PROMOCJA)
- Lazy loading zdjęć
- Skeleton loading podczas ładowania

---

## 📝 Uwagi Techniczne

### Dane Wymagane w API/Database:
- `restaurantName` - nazwa restauracji
- `cuisineType` - typ kuchni
- `location` - lokalizacja
- `deliveryCost` - koszt dostawy (min)
- `minOrder` - minimalne zamówienie
- `rating` - ocena (0-5)
- `deliveryTime` - czas dostawy (min-max w minutach)
- `imageUrl` - URL zdjęcia
- `tags` - tablica tagów (Szybka dostawa, Popularne, Premium)
- `isFavorite` - czy w ulubionych (dla zalogowanych)

### LocalStorage (dla niezalogowanych):
```json
{
  "favoriteRestaurants": [123, 456, 789]
}
```

---

## ✅ Kryteria Akceptacji

Kafelek jest gotowy do produkcji, gdy:
- [ ] Koszt dostawy jest najbardziej widocznym elementem
- [ ] Ocena w gwiazdkach działa poprawnie (1-5 gwiazdek)
- [ ] Czas dostawy jest wyraźnie widoczny
- [ ] Przycisk ulubionych działa dla zalogowanych
- [ ] LocalStorage działa dla niezalogowanych (jeśli wybrano opcję B)
- [ ] Layout jest responsywny na wszystkich urządzeniach
- [ ] Tagi pozostają na dole kafelka
- [ ] Wszystkie informacje są czytelne
- [ ] Spełnione wymagania dostępności (WCAG AA)

---

**Data utworzenia:** 2026-03-30  
**Autor wymagań:** Na podstawie konsultacji z Product Owner
