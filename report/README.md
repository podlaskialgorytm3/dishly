# DISHLY - Raport Projektu Indywidualnego

## Zawartość Raportu

Raport zwiera kompletną dokumentację projektu **DISHLY** - platformy SaaS do zamawiania jedzenia online.

### Pliki w Folderze

- **sprawozdanie.tex** - Plik źródłowy LaTeX z raportem
- **sprawozdanie.pdf** - Skompilowany plik PDF (główny dokument)
- **sprawozdanie.toc** - Spis treści (generowany automatycznie)
- **screenshots/** - Folder na zrzuty ekranu aplikacji
- **README.md** - Ten plik

## Zawartość Raportu

Raport zawiera następujące sekcje:

### 1. Wstęp

- Cel projektu
- Zakres pracy

### 2. Wymagania Projektu

- Wymagania funkcjonalne (logowanie, zarządzanie menu, filtrowanie, model SaaS, statusy zamówień)
- Wymagania niefunkcjonalne (skalowalność, bezpieczeństwo, wydajność)
- Role użytkowników (Client, Worker, Manager, Owner, Admin)

### 3. Założenia Systemu

- Architektura bazy danych
- Technologie używane (React, Next.js, PostgreSQL, Prisma, etc.)
- Struktura modeli danych

### 4. Implementacja

- Etapy ukończone
- Struktury danych dokumentów
- Modele User, Restaurant, Meal, Order

### 5. Zrzuty Ekranu Interfejsu

- Panel Klienta
- Strona główna z mapą
- Formularz logowania
- Rejestracja klienta
- Rejestracja restauracji
- Panel administracyjny
- Weryfikacja restauracji
- Zarządzanie planami subskrypcyjnymi

### 6. Struktura Projektu

- Organizacja katalogów
- Opis głównych komponentów

### 7. Architektura Aplikacji

- Architektura wielowarstwowa
- Komponenty systemu (Frontend, Backend, Database)
- Przepływ danych

### 8. Funkcjonalności

- Funkcjonalności zaimplementowane
- Funkcjonalności pozostające do wdrożenia

### 9. Testy Użytkowe

- Scenariusze testów dla głównych funkcji

### 10. Podsumowanie i Wnioski

- Osiągnięcia
- Problemy i rozwiązania
- Plany przyszłości
- Spostrzeżenia techniczne

### 11. Zasoby i Literatura

- Dokumentacja technologii
- Narzędzia używane

### 12. Dodatek

- Instrukcja instalacji
- Domyślne konta
- Załączniki - Zrzuty ekranu
- Metryki projektu

## Jak Dodać Zrzuty Ekranu

1. Zrób zrzut ekranu aplikacji (PNG lub JPG)
2. Skopiuj plik do folderu `screenshots/`
3. Zmień linię w `sprawozdanie.tex` z:
   ```latex
   \fbox{\parbox[c][4cm][c]{\textwidth}{...}}
   ```
   na:
   ```latex
   \includegraphics[width=0.9\textwidth]{screenshots/nazwa_pliku.jpg}
   ```
4. Ponownie skompiluj PDF:
   ```bash
   cd report
   xelatex -interaction=nonstopmode sprawozdanie.tex
   ```

## Kompilacja Raportu

### Wymagania

- MiKTeX lub TeX Live
- xelatex (wersja obsługująca UTF-8)

### Polecenie Kompilacji

```bash
xelatex -interaction=nonstopmode sprawozdanie.tex
```

### Zauważ

Dokument wymaga kompilacji dwukrotnie dla prawidłowego spisu treści i odsyłaczy krzyżowych.

## Technologie Użyte w Projekcie

| Komponenta   | Technologia                                               |
| ------------ | --------------------------------------------------------- |
| Frontend     | React 19.2.3, Next.js 16.1.6, Tailwind CSS, Framer Motion |
| Backend      | Next.js API Routes, Node.js                               |
| Baza Danych  | PostgreSQL, Prisma ORM                                    |
| Autentykacja | NextAuth.js 5.0                                           |
| Płatności    | Stripe                                                    |
| Mapy         | Leaflet, React Leaflet                                    |
| Wykresy      | Recharts                                                  |
| PWA          | @ducanh2912/next-pwa                                      |

## Informacje o Projekcie

- **Nazwa Projektu**: DISHLY
- **Typ**: Projekt Indywidualny (1DI1417)
- **Semestr**: Bieżący
- **Prowadzący**: Dr. Ryszard Łagoda
- **Status**: W Trakcie Realizacji

## Linki Przydatne

- [DISHLY GitHub Repository](https://github.com/...)
- [Dokumentacja Next.js](https://nextjs.org/)
- [Dokumentacja Prisma](https://www.prisma.io/)
- [Dokumentacja NextAuth.js](https://next-auth.js.org/)

## Notatki

Aplikacja jest na zaawansowanym etapie implementacji. Podstawowe struktury i funkcjonalności są gotowe. Kolejnym etapem będzie wdrożenie pełnego panelu restauracji i systemu obsługi zamówień.

---

_Raport wygenerowany: `r"+ datetime.now().strftime("%Y-%m-%d %H:%M")`_
