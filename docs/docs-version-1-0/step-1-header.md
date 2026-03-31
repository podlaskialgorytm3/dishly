# 📌 Wymagania Projektowe – Nagłówek (Header / Top Navigation)

## 🎯 Cel

Nagłówek aplikacji stanowi główny element nawigacyjny systemu.  
W przyszłości będzie zawierał odnośniki do kluczowych podstron (np. Strona główna, Restauracje, Promocje, Kontakt, Panel użytkownika).

Powinien być:

- nowoczesny
- minimalistyczny
- lekki wizualnie
- spójny z paletą (`#FF4D4F`, `#FF8C42`)
- responsywny (mobile-first)

---

# 🎨 Styl Wizualny

## Kolorystyka

- **Tło:** `#FFFFFF`
- **Dolna linia oddzielająca:** `1px solid #EEEEEE`
- **Tekst główny:** `#1F1F1F`
- **Tekst nieaktywny:** `#8C8C8C`
- **Aktywny link:** `#FF4D4F`
- **Hover link:** `#FF4D4F`
- **Badge (np. koszyk):** `#FF4D4F`

Opcjonalnie (efekt premium):

backdrop-filter: blur(10px);
background: rgba(255, 255, 255, 0.9);

---

# 📐 Układ

## Struktura (desktop)

| Logo | Linki nawigacyjne | Ikony (koszyk, profil) |

- Wysokość: 70–80px
- Padding poziomy: 32px
- Display: flex
- Justify-content: space-between
- Align-items: center

Nagłówek powinien być:

- Sticky (position: sticky; top: 0;)
- Z-index wysoki (np. 1000)

---

# 🏷 Logo

- Kolor: `#FF4D4F`
- Typografia: nowoczesna, bezszeryfowa
- Lekko pogrubiona
- Minimalistyczna forma

Hover:

- Lekka zmiana opacity (0.85)
- Transition 200ms

---

# 🔗 Linki Nawigacyjne

## Styl podstawowy

- Kolor: `#1F1F1F`
- Font-weight: 500
- Odstęp między linkami: 24–32px
- Brak klasycznego underline

## Hover

- Kolor: `#FF4D4F`
- Animowane podkreślenie:

position: relative;

Efekt:

- Cienka linia pod tekstem
- Animacja rozszerzania od środka
- Transition: 0.3s ease

## Aktywny link

- Kolor: `#FF4D4F`
- Font-weight: 600

---

# 🛒 Ikony (Koszyk / Profil / Powiadomienia)

## Styl:

- Ikony liniowe (outline)
- Rozmiar: 20–24px
- Kolor: `#1F1F1F`
- Odstęp między ikonami: 20px

## Hover:

- Kolor: `#FF4D4F`
- Lekkie powiększenie (scale 1.05)
- Transition: 200ms

## Badge (np. liczba produktów w koszyku)

- Tło: `#FF4D4F`
- Tekst: biały
- Border-radius: 50%
- Mały rozmiar (12–14px)
- Pozycjonowanie: absolutne (górny róg ikony)

---

# 🔍 Wyszukiwarka (opcjonalnie w headerze)

- Zaokrąglone pole (border-radius: 20px)
- Border: `1px solid #E0E0E0`
- Focus:
  - Border: `#FF4D4F`
  - Delikatny cień

Tło inputu:
`#FAFAFA`

---

# 📱 Responsywność

## Mobile

- Logo po lewej
- Ikona menu (hamburger) po prawej
- Linki rozwijane w drawerze (wysuwany panel)

Drawer:

- Tło: `#FFFFFF`
- Szerokość: 75–85%
- Animacja slide-in 250ms
- Delikatny cień

---

# ✨ Mikrointerakcje

- Płynne przejścia (200–300ms)
- Subtelne animacje hover
- Lekki cień przy scrollowaniu (po przewinięciu strony)
- Zmniejszenie wysokości headera po scrollu (opcjonalnie)

---

# 🧩 Spójność z Ekosystemem

Nagłówek musi:

- Używać tej samej palety co dashboard i strona główna
- Zachowywać identyczne zaokrąglenia (12–16px)
- Korzystać z tej samej typografii
- Mieć identyczny styl przycisków jak reszta systemu

---

# 🎓 Opis do pracy

Nagłówek aplikacji został zaprojektowany jako centralny element nawigacyjny systemu. Zastosowano minimalis
