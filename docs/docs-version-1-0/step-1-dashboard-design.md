# 📊 Panel Dashboard – Styl Nowoczesny i Spójny z Designem Aplikacji

## 🎯 Koncepcja

Panel dashboard powinien być:

- nowoczesny
- czysty wizualnie
- przejrzysty
- profesjonalny
- spójny z paletą: `#FF4D4F` + `#FF8C42`

Styl: **minimalistyczny + lekko premium + miękkie cienie**

Nie może wyglądać jak „stary system ERP” – ma być lekki i intuicyjny.

---

# 🎨 System Kolorów (Spójny z aplikacją)

- **Background główny:** `#FAFAFA`
- **Sidebar:** `#FFFFFF`
- **Karty (widgets):** `#FFFFFF`
- **Primary (akcje):** `#FF4D4F`
- **Accent (hover / wykresy):** `#FF8C42`
- **Tekst główny:** `#1F1F1F`
- **Tekst pomocniczy:** `#8C8C8C`
- **Border / linie:** `#EEEEEE`
- **Success:** `#4CAF50`
- **Warning:** `#FFC107`
- **Error:** `#F44336`

---

# 📐 Układ Dashboardu

## 1️⃣ Layout Główny

Struktura:

- Sidebar po lewej
- Topbar u góry
- Główna przestrzeń treści po prawej

Tło całej strony:
`#FAFAFA`

Maksymalna szerokość kontentu:
1200–1400px

---

# 📂 Sidebar (Lewy Panel)

## Styl:

- Tło: `#FFFFFF`
- Szerokość: 240–260px
- Border-right: 1px solid `#EEEEEE`
- Wysokość: 100vh
- Sticky (przyklejony)

## Elementy:

- Logo u góry (kolor `#FF4D4F`)
- Lista pozycji menu
- Ikony liniowe (outline)

## Styl pozycji menu:

- Padding: 12–16px
- Border-radius: 12px
- Kolor tekstu: `#1F1F1F`

### Active:

- Tło: `#FFF1F1`
- Tekst: `#FF4D4F`

### Hover:

- Tło: `#FAFAFA`
- Płynne przejście 200ms

Efekt:
Czysty, nowoczesny, lekko startupowy.

---

# 🔝 Topbar (Górny Pasek)

## Styl:

- Tło: `#FFFFFF`
- Border-bottom: 1px solid `#EEEEEE`
- Padding: 16–24px
- Display: flex
- Justify-content: space-between

## Zawiera:

- Tytuł sekcji (np. „Dashboard”)
- Wyszukiwarkę (opcjonalnie)
- Ikonę powiadomień
- Avatar użytkownika

Styl avatara:

- Okrągły
- Subtelny cień

---

# 📊 Sekcja Główna (Content Area)

Padding:
32px

Układ:
Grid (2–4 kolumny zależnie od szerokości)

---

# 📦 Karty (Statystyki / Widgets)

## Styl karty:

- Tło: `#FFFFFF`
- Border-radius: 20px
- Box-shadow: 0 8px 24px rgba(0,0,0,0.04)
- Padding: 24px
- Transition: 0.2s ease

### Hover:

- Lekkie podniesienie:
  `transform: translateY(-4px);`

---

## 📈 Karty statystyk (np. Przychód)

Układ:

- Mała ikona w okrągłym tle (np. `#FFF1F1`)
- Duża liczba (bold)
- Opis (mały, szary tekst)
- Wskaźnik wzrostu:
  - Zielony (wzrost)
  - Czerwony (spadek)

---

# 📊 Wykresy

Karty z wykresami:

- Tło: `#FFFFFF`
- Border-radius: 20px
- Dużo przestrzeni
- Linie wykresu:
  - Primary: `#FF4D4F`
  - Accent: `#FF8C42`

Tło wykresu:
Bardzo subtelna siatka (`#F5F5F5`)

---

# 📋 Tabele (np. Zamówienia)

Styl:

- Brak ciężkich obramowań
- Wiersze oddzielone delikatną linią `#EEEEEE`
- Hover na wierszu:
  - Tło: `#FAFAFA`
- Statusy w formie badge:

### Status Badge:

- Nowe → `#FFF1F1`
- W trakcie → `#FFF8E1`
- Zrealizowane → `#E8F5E9`
- Anulowane → `#FFEBEE`

Zaokrąglenie badge:
12px

---

# 🔘 Przyciski

## Primary Button:

- Tło: `#FF4D4F`
- Tekst: biały
- Border-radius: 14px
- Hover: `#FF3B30`

## Secondary:

- Tło: `#F5F5F5`
- Tekst: `#1F1F1F`

---

# ✨ Mikrointerakcje

- Delikatne animacje hover
- Smooth transitions (200–300ms)
- Skeleton loading przy ładowaniu danych
- Fade-in przy zmianie sekcji

---

# 📱 Responsywność

## Desktop:

- Sidebar widoczny
- 3–4 kolumny kart

## Tablet:

- 2 kolumny kart

## Mobile:

- Sidebar jako drawer (wysuwany)
- 1 kolumna kart
- Większe przyciski

---

# 🎓 Opis do pracy

Panel dashboard został zaprojektowany w stylu nowoczesnym i minimalistycznym, z naciskiem na przejrzystość danych oraz intuicyjną nawigację. Zastosowano jasne tło, modułową strukturę kart oraz subtelne animacje interaktywne, co pozwala na komfortowe zarządzanie systemem. Kolorystyka oparta na ciepłym akcencie czerwieni zapewnia spójność wizualną z częścią kliencką aplikacji, przy jednoczesnym zachowaniu profesjonalnego charakteru panelu administracyjnego.
