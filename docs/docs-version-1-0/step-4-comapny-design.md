# 🍽 Strona Restauracji – Style (wg parametrów: logo, cover, opis, rodzaj kuchni, etykiety)

## 🎯 Cel

Strona restauracji ma:

- eksponować identyfikację wizualną (logo + cover),
- budować klimat lokalu,
- czytelnie prezentować rodzaj kuchni i udogodnienia,
- wyglądać nowocześnie, lekko i premium.

Styl spójny z całym systemem:

- Primary: `#FF4D4F`
- Accent: `#FF8C42`
- Background: `#FAFAFA`
- Card: `#FFFFFF`
- Border: `#EEEEEE`

---

# 🎨 Kolorystyka

- **Tło strony:** `#FAFAFA`
- **Sekcje / karty:** `#FFFFFF`
- **Tekst główny:** `#1F1F1F`
- **Tekst pomocniczy:** `#8C8C8C`
- **Primary (akcent, aktywne elementy):** `#FF4D4F`
- **Hover akcent:** `#FF3B30`
- **Chip aktywny:** `#FFF1F1`
- **Cień kart:** `0 8px 24px rgba(0,0,0,0.04)`

---

# 🖼 1️⃣ Sekcja Cover + Logo (Hero Restauracji)

## 📐 Układ

- Cover (baner) na pełną szerokość kontenera
- Logo nachodzące lekko na dół covera (efekt warstw)

---

## 🎨 Cover (Zdjęcie główne)

- Height: 300–400px
- Border-radius: 24px
- Object-fit: cover
- Box-shadow: `0 12px 30px rgba(0,0,0,0.08)`
- Position: relative

Opcjonalnie:

- Gradient overlay od dołu:

linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)

---

## 🔴 Logo Restauracji

- Kształt: okrągłe lub zaokrąglony kwadrat (16–20px radius)
- Rozmiar: 100–120px
- Border: 4px solid `#FFFFFF`
- Box-shadow: `0 8px 24px rgba(0,0,0,0.15)`
- Tło: `#FFFFFF`
- Pozycja: nachodzące na dolną krawędź covera

Efekt:
Nowoczesny, lekko socialowy (jak profil na Instagramie).

---

# 🏷 2️⃣ Nazwa + Opis Restauracji

## Nazwa

- Font-size: 30–34px
- Font-weight: 700
- Kolor: `#1F1F1F`
- Margin-top: 24px

## Opis

- Kolor: `#8C8C8C`
- Line-height: 1.6
- Max-width: 700px
- Margin-top: 12px

Sekcja w osobnej karcie:

- Background: `#FFFFFF`
- Border-radius: 20px
- Padding: 24px
- Box-shadow: `0 8px 24px rgba(0,0,0,0.04)`

---

# 🍔 3️⃣ Rodzaj Kuchni (Chipy)

## Układ

- Display: flex
- Flex-wrap: wrap
- Gap: 12px
- Margin-top: 16px

---

## Styl Chipów

### Default:

- Background: `#FFFFFF`
- Border: 1px solid `#EEEEEE`
- Border-radius: 20px
- Padding: 8px 16px
- Font-size: 14px
- Cursor: pointer
- Transition: 0.2s ease

### Hover:

- Border: 1px solid `#FF8C42`

### Active (wybrana kuchnia):

- Background: `#FFF1F1`
- Border: 1px solid `#FF4D4F`
- Kolor tekstu: `#FF4D4F`

Efekt:
Nowoczesne, lekkie filtry jak w aplikacjach social.

---

# 🏷 4️⃣ Etykiety i Udogodnienia (np. Wi-Fi)

## Styl

- Małe chipy
- Border-radius: 16px
- Padding: 6px 14px
- Font-size: 13px

### Default:

- Background: `#F5F5F5`
- Kolor tekstu: `#1F1F1F`

### Ikony:

- Liniowe (outline)
- Kolor: `#FF4D4F`
- Rozmiar: 16px

Układ:

- Flex
- Gap: 10px

---

# 🧾 5️⃣ Sekcja „Zgłoś nowy wpis”

Powinna być wizualnie lżejsza, informacyjna.

## Styl:

- Background: `#FFFFFF`
- Border-radius: 20px
- Padding: 24px
- Border: 1px dashed `#EEEEEE`

Nagłówek:

- Kolor: `#1F1F1F`
- Ikona w kolorze `#FF4D4F`

Przycisk:

- Background: `#FFF1F1`
- Border: 1px solid `#FF4D4F`
- Border-radius: 16px
- Kolor tekstu: `#FF4D4F`

Hover:

- Background: `#FF4D4F`
- Kolor tekstu: biały

---

# ✨ Mikrointerakcje

- Smooth hover na chipach
- Delikatne podnoszenie kart (translateY -4px)
- Fade-in przy wejściu na stronę
- Lazy loading covera

Transition globalny:

transition: all 0.2s ease;

---

# 📱 Responsywność

## Desktop

- Cover pełna szerokość
- Logo nakładające się
- Sekcje w formie kart

## Mobile

- Logo mniejsze (80px)
- Opis pod nazwą
- Chipy przewijane poziomo
- Większe odstępy (24px)

---

# 🎓 Opis do pracy

Strona restauracji została zaprojektowana w oparciu o nowoczesny, kartowy układ interfejsu z wyraźnym wyeksponow
