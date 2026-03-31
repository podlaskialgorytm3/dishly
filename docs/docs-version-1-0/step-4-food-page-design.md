# 🍟 Strona Szczegółów Posiłku – Design (Spójny z Ekosystemem)

## 🎯 Cel

Strona danego posiłku ma:

- eksponować zdjęcie i nazwę dania
- podkreślać cenę i warianty
- umożliwiać szybkie dodanie do koszyka
- estetycznie prezentować wartości odżywcze i oznaczenia

Styl:  
Nowoczesny • Lekki • Apetyczny • Spójny z `#FF4D4F` + `#FF8C42`

---

# 🎨 System Kolorów

- **Background:** `#FAFAFA`
- **Karty / sekcje:** `#FFFFFF`
- **Primary (CTA):** `#FF4D4F`
- **Accent (hover):** `#FF8C42`
- **Tekst główny:** `#1F1F1F`
- **Tekst pomocniczy:** `#8C8C8C`
- **Border:** `#EEEEEE`
- **Badge wege:** `#4CAF50`
- **Badge ostrość:** `#FF5722`

---

# 📐 Układ Strony

## Desktop

| Zdjęcie (lewa kolumna 50%) | Szczegóły (prawa kolumna 50%) |

- Max-width: 1200px
- Margin: auto
- Padding: 40px
- Grid: 2 kolumny
- Gap: 40px

## Mobile

- Układ jednokolumnowy
- Zdjęcie na górze
- Sticky przycisk „Dodaj do koszyka” na dole

---

# 🖼 Sekcja Zdjęcia

## Styl

- Border-radius: 24px
- Box-shadow: 0 12px 30px rgba(0,0,0,0.05)
- Object-fit: cover
- Aspect-ratio: 1:1 lub 4:3

Opcjonalnie:

- Subtelna animacja zoom on hover
- Overlay z oznaczeniem promocji

---

# 🏷 Nagłówek Posiłku

## Nazwa

- Font-size: 28–32px
- Font-weight: 700
- Kolor: `#1F1F1F`
- Margin-bottom: 8px

## Kategoria

- Mały badge
- Tło: `#FFF1F1`
- Tekst: `#FF4D4F`
- Border-radius: 12px
- Padding: 4px 10px

---

# 💰 Cena

- Duża czcionka (24px)
- Kolor: `#FF4D4F`
- Font-weight: 700

Jeśli wariant wybrany:

- Mała informacja „Cena bazowa + modyfikator”

---

# 📝 Opis

- Kolor: `#8C8C8C`
- Line-height: 1.6
- Max-width: 90%o
- Oddzielony odstępem 16–24px

---

# 🌿 Oznaczenia Specjalne

Forma:

- Chip / Badge
- Border-radius: 20px
- Padding: 6px 14px
- Font-size: 14px

### Wegetariańskie / Wegańskie

- Tło: `#E8F5E9`
- Tekst: `#2E7D32`

### Bezglutenowe

- Tło: `#FFF8E1`
- Tekst: `#F57F17`

Układ:

- Flex-wrap
- Gap: 8px

---

# 🌶 Poziom Ostrości

- Ikony papryczek
- Aktywne: `#FF5722`
- Nieaktywne: `#E0E0E0`

Mały opis pod spodem:

- Kolor: `#8C8C8C`
- Font-size: 13px

---

# 📊 Profil Dietetyczny

Sekcja jako karta:

- Background: `#FFFFFF`
- Border-radius: 20px
- Padding: 24px
- Box-shadow: 0 8px 24px rgba(0,0,0,0.04)

Układ:
Grid 2–4 kolumny

Każda wartość:

- Duża liczba
- Jednostka mniejszą czcionką
- Opis pod spodem w `#8C8C8C`

---

# 📏 Warianty (Rozmiary)

Każdy wariant jako selectable card:

- Border: 1px solid `#EEEEEE`
- Border-radius: 16px
- Padding: 12px 16px
- Cursor: pointer

### Active:

- Border: 2px solid `#FF4D4F`
- Background: `#FFF1F1`

### Hover:

- Border: 1px solid `#FF8C42`

Układ:

- Flex
- Justify-content: space-between

---

# ➕ Dodatki

Każdy dodatek jako wiersz:

- Border-bottom: 1px solid `#F5F5F5`
- Padding: 12px 0
- Display: flex
- Justify-content: space-between

Checkbox:

- Kolor zaznaczenia: `#FF4D4F`

Cena dodatku:

- Kolor: `#1F1F1F`
- Font-weight: 500

---

# 🛒 Sekcja Akcji (CTA)

## Przycisk „Dodaj do koszyka”

- Background: `#FF4D4F`
- Kolor tekstu: biały
- Border-radius: 16px
- Padding: 16px
- Font-size: 16px
- Font-weight: 600
- Width: 100%

### Hover:

- Background: `#FF3B30`
- Lekkie powiększenie (scale 1.02)
- Transition: 200ms

### Sticky (mobile):

- Position: fixed
- Bottom: 16px
- Left/Right: 16px
- Box-shadow: 0 8px 24px rgba(0,0,0,0.15)

---

# ✨ Mikrointerakcje

- Animacja wyboru wariantu
- Smooth transitions (0.2s ease)
- Skeleton loading przy ładowaniu danych
- Subtelny fade-in sekcji

---

# 📱 Responsywność

## Desktop

- 2 kolumny
- Szczegóły po prawej
- Warianty i dodatki jako sekcje pod sobą

## Mobile

- Jedna kolumna
- Zdjęcie na górze
- Sticky CTA
- Większe przyciski i odstępy

---

# 🎓 Opis do pracy

Strona szczegółów posiłku została zaprojektowana w sposób eksponujący kluczowe informacje, takie jak zdjęcie, cena, warianty oraz wartości odżywcze. Zastosowano nowoczesny układ dwukolumnowy na urządzeniach desktopowych oraz uproszczony układ jednokolumnowy na urządzeniach mobilnych. Kolorystyka oparta na ciepłym akcencie czerwieni zapewnia spójność z resztą systemu oraz wyraźnie wskazuje elementy interaktywne, takie jak przyciski i aktywne warianty.
