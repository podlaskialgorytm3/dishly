# 🎨 Strona Główna – Design (Social / Instagramowy Klimat)

## 🎯 Koncepcja

Strona główna aplikacji ma przypominać nowoczesny feed społecznościowy – dynamiczny, wizualny i przyjazny.  
Układ opiera się na dużych zdjęciach, ciepłej kolorystyce i intuicyjnym scrollowaniu.

Styl: **nowoczesny, lekki, dopaminowy, apetyczny**

---

# 🎨 System Kolorów

## 🔥 Główna Paleta (Food & Dopamine)

- **Primary (CTA, przyciski):** `#FF4D4F`
- **Accent (hover, wyróżnienia):** `#FF8C42`
- **Background (tło strony):** `#FAFAFA`
- **Card background:** `#FFFFFF`
- **Text główny:** `#1F1F1F`
- **Text pomocniczy:** `#8C8C8C`
- **Promocja / Badge:** `#FF3B30`
- **Sukces (np. darmowa dostawa):** `#4CAF50`

Efekt:

- Ciepły, pobudzający apetyt
- Nowoczesny
- Social-mediowy klimat

---

# 📱 Struktura Strony Głównej

---

## 1️⃣ Sticky Header

**Tło:** `#FFFFFF`  
**Cień:** delikatny box-shadow

### Elementy:

- Logo (kolor primary)
- Ikona powiadomień
- Ikona koszyka z czerwonym badge
- Avatar użytkownika

Styl:

- Minimalistyczny
- Lekki
- Zawsze widoczny przy scrollowaniu

---

## 2️⃣ Hero Section (emocjonalne wejście)

Tło: linear-gradient(135deg, #FF4D4F, #FF8C42)

Na tle:

- Duży nagłówek:
  > Zamów coś pysznego 🍕
- Podtytuł:
  > Najlepsze restauracje w Twojej okolicy
- Duże pole wyszukiwania (zaokrąglone 30px)
- Przycisk CTA:
  - Tło: `#FFFFFF`
  - Tekst: `#FF4D4F`

Efekt:
Mocne, energetyczne wejście.

---

## 3️⃣ Stories (poziomy scroll)

Po hero sekcji.

Elementy:

- Okrągłe zdjęcia restauracji
- Kolorowa obwódka (`#FF4D4F`) przy nowych promocjach
- Nazwa pod zdjęciem

Cel:

- Szybkie odkrywanie
- Instagramowy klimat

---

## 4️⃣ Feed Restauracji (Główna część)

Scroll pionowy (infinite scroll).

Każda karta zawiera:

- Duże zdjęcie (16:9)
- Nazwa restauracji (bold)
- Ocena ⭐ + liczba opinii
- Czas dostawy
- Minimalna kwota
- Przyciski:
  - ❤️ Ulubione
  - 🛒 Zamów teraz (kolor primary)

### Styl karty:

- Background: `#FFFFFF`
- Border-radius: 20px
- Delikatny cień
- Hover: lekkie podniesienie (transform: translateY(-4px))

---

## 5️⃣ Sekcja „Trendujące 🔥”

Tło: bardzo jasny pomarańcz `#FFF3E0`

Zawiera:

- Najczęściej zamawiane dania
- Nowości
- Promocje dnia

---

## 6️⃣ Stopka

Tło: `#FFFFFF`
Tekst: `#8C8C8C`

Zawiera:

- Regulamin
- Polityka prywatności
- Kontakt
- Social media

---

# ✨ Mikrointerakcje

- Animacja serduszka przy dodaniu do ulubionych
- Skeleton loading przy ładowaniu feedu
- Lazy loading zdjęć
- Pull-to-refresh (mobile)
- Delikatne fade-in przy pojawianiu się kart

---

# ⚙️ Wymagania Techniczne

- Mobile-first
- Responsywność
- Infinite scroll
- Lazy loading obrazów
- API endpoint: `GET /feed`
- Obsługa pustego stanu (brak restauracji)
- Cache danych (opcjonalnie PWA)

---

# 🎓 Opis do pracy

Strona główna została zaprojektowana jako dynamiczny feed inspirowany aplikacjami społecznościowymi. Celem projektu było stworzenie wizualnie atrakcyjnego środowiska sprzyjającego eksploracji oferty gastronomicznej. Zastosowanie ciepłej kolorystyki, dużych zdjęć oraz mechanizmu infinite scroll zwiększa zaangażowanie użytkownika i skraca ścieżkę prowadzącą do złożenia zamówienia.
