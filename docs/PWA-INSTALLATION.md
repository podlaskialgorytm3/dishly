# 📱 DISHLY PWA - Instrukcja instalacji

DISHLY jest Progressive Web App (PWA), co oznacza, że możesz ją zainstalować na swoim telefonie i używać jak natywnej aplikacji!

---

## 🍎 Instalacja na iOS (iPhone/iPad)

### Krok 1: Otwórz stronę w Safari

- Otwórz **Safari** (to ważne - musi być Safari!)
- Wejdź na stronę DISHLY pod adresem: `https://twoja-domena.pl`

### Krok 2: Otwórz menu udostępniania

- Naciśnij ikonę **udostępniania** (kwadrat ze strzałką w górę) na dole ekranu

### Krok 3: Dodaj do ekranu głównego

- Przewiń w dół i wybierz **„Dodaj do ekranu głównego"** (ang. „Add to Home Screen")
- Zatwierdź nazwę aplikacji (domyślnie „DISHLY")
- Naciśnij **„Dodaj"**

### ✅ Gotowe!

Na ekranie głównym pojawi się ikona DISHLY. Po kliknięciu aplikacja otworzy się w trybie pełnoekranowym, bez paska adresu Safari.

---

## 🤖 Instalacja na Android

### Metoda 1: Automatyczny banner (zalecana)

1. Otwórz stronę DISHLY w **Chrome**
2. Po chwili na dole ekranu pojawi się banner z propozycją **„Zainstaluj aplikację"**
3. Naciśnij **„Zainstaluj"**
4. Potwierdź instalację

### Metoda 2: Ręczna instalacja

1. Otwórz stronę DISHLY w **Chrome**
2. Naciśnij ikonę **menu** (trzy kropki w prawym górnym rogu)
3. Wybierz **„Zainstaluj aplikację"** lub **„Dodaj do ekranu głównego"**
4. Potwierdź instalację

### ✅ Gotowe!

Ikona DISHLY pojawi się na ekranie głównym lub w szufladzie aplikacji.

---

## 💻 Instalacja na komputerze (Windows/Mac/Linux)

### Chrome / Edge

1. Otwórz stronę DISHLY
2. Kliknij ikonę **instalacji** w pasku adresu (po prawej stronie)
3. Lub: Menu → **„Zainstaluj DISHLY..."**

### Firefox

Firefox nie wspiera instalacji PWA natywnie, ale możesz używać rozszerzenia **PWAs for Firefox**.

---

## 🚀 Uruchamianie w trybie deweloperskim (localhost)

Aby przetestować PWA lokalnie:

```bash
# 1. Zbuduj aplikację produkcyjną
npm run build

# 2. Uruchom serwer produkcyjny
npm run start
```

Następnie otwórz `http://localhost:3000` w przeglądarce.

> ⚠️ **Uwaga:** Service Worker (offline) działa tylko w trybie produkcyjnym (`npm run start`), nie w `npm run dev`.

---

## 🔧 Rozwiązywanie problemów

### PWA się nie instaluje?

- Upewnij się, że strona działa przez **HTTPS** (lub localhost)
- Wyczyść cache przeglądarki i odśwież stronę
- Na iOS używaj tylko **Safari**
- Na Android używaj tylko **Chrome**

### Aplikacja nie działa offline?

- PWA wymaga pierwszego załadowania online, aby zapisać zasoby w cache
- Odśwież stronę kilka razy będąc online
- Service worker wymaga trybu produkcyjnego (nie `npm run dev`)

### Jak odinstalować?

- **iOS:** Przytrzymaj ikonę → usuń aplikację
- **Android:** Ustawienia → Aplikacje → DISHLY → Odinstaluj
- **Desktop:** Kliknij PPM na ikonie → Odinstaluj

---

## 📋 Funkcje PWA w DISHLY

| Funkcja                           | Status         |
| --------------------------------- | -------------- |
| Instalacja na ekranie głównym     | ✅             |
| Praca w trybie pełnoekranowym     | ✅             |
| Cache zasobów (szybsze ładowanie) | ✅             |
| Podstawowa praca offline          | ✅             |
| Powiadomienia push                | ❌ (w planach) |

---

## 🛠️ Dla deweloperów

### Struktura plików PWA

```
public/
├── manifest.json          # Manifest PWA
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── apple-touch-icon.png    # Ikona dla iOS
│   ├── maskable-icon-512x512.png  # Ikona maskable (Android adaptive icons)
│   └── favicon-32x32.png
```

### Generowanie nowych ikon

Jeśli chcesz zmienić ikonę aplikacji:

```bash
npx tsx scripts/generate-pwa-icons.ts
```

### Konfiguracja PWA

Konfiguracja znajduje się w:

- `next.config.ts` - konfiguracja `@ducanh2912/next-pwa`
- `public/manifest.json` - manifest aplikacji
- `src/app/layout.tsx` - meta tagi dla iOS/Android

---

## 📞 Pomoc

Jeśli masz problemy z instalacją PWA, skontaktuj się z nami lub otwórz issue na GitHubie.
