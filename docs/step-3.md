Oto szczegółowy opis **Etapu 3** (Onboarding i struktura restauracji) w formacie Markdown. Zgodnie z Twoją prośbą, treść została przygotowana tak, aby bezpośrednio opisywać wymagania zawarte w specyfikacji (bez powoływania się na numery stron).

---

# 🏢 Etap 3: Onboarding Restauracji i Struktura (Panel Właściciela)

Celem tego etapu jest umożliwienie restauracjom wejścia do systemu DISHLY. Proces obejmuje przejście od zwykłego użytkownika do roli Właściciela (Owner), zdefiniowanie marki oraz stworzenie sieci placówek (Lokalizacji) wraz z ich personelem.

## 3.1. Rejestracja Biznesowa (Onboarding SaaS)

W systemie DISHLY istnieją dwie ścieżki wejścia. W tym kroku implementujemy proces "Dla Firm".

- **Logika wyboru ścieżki:** W menu głównym obok przycisku „rejestracja” (dla klientów) znajduje się przycisk „Dla firm”, prowadzący do formularza biznesowego.
- **Wybór modelu płatności:** Restauracja podczas rejestracji od razu wybiera rodzaj subskrypcji. Po wypełnieniu formularza konto otrzymuje status „oczekujące”, a system przesyła informację do administratora o nowym zgłoszeniu.
- **Domyślne konto:** Konto utworzone podczas rejestracji biznesowej staje się automatycznie kontem Właściciela – najwyższym poziomem dostępu w ramach danej restauracji.

## 3.2. Zarządzanie Strukturą Sieci (Lokalizacje)

Właściciel zarządza restauracją nie tylko jako pojedynczym punktem, ale może budować całą sieć (np. 10 punktów podpiętych pod jednego właściciela).

- **Dodawanie oddziałów:** Implementacja modułu CRUD (Create, Read, Update, Delete) dla lokalizacji.
- **Atrybuty specyficzne dla lokalizacji:** Każdy dodany punkt posiada własne:
  - Dane adresowe i numer telefonu.
  - **Obszar dostawy:** Zdefiniowany promień (ilość kilometrów) od lokalizacji punktu.
  - **Finanse lokalu:** Minimalna kwota zamówienia oraz koszt dostawy.
  - **Logistyka czasu:** Indywidualne godziny otwarcia (lub opcja sprzedaży całodobowej).
- **Relacja Subskrypcyjna:** System blokuje dodanie większej liczby lokalizacji niż przewiduje wybrany plan subskrypcyjny (atrybut "Maksymalna ilość lokalizacji").

## 3.3. Budowanie Zespołu i Hierarchia Ról

Właściciel jest jedynym użytkownikiem, który ma pełną kontrolę nad personelem. Tworzy on hierarchiczną strukturę dostępu dla swoich pracowników.

- **Kreator Kont Pracowniczych:** Właściciel tworzy konta podając: imię, nazwisko, adres email oraz przypisaną rolę.
- **Definicja ról personelu:**
  - **Menadżer (Poziom pośredni):** Posiada dostęp do zarządzania menu, cenami, godzinami otwarcia oraz widzi raporty operacyjne i statystyki sprzedaży danej lokalizacji. Nie może jednak zarządzać subskrypcją i płatnościami firmy.
  - **Pracownik (Najniższy poziom):** Ma dostęp wyłącznie do przyjmowania zamówień, zmiany ich statusów (np. "W trakcie realizacji", "Gotowe") i obsługi bieżącej komunikacji z kuchnią.
- **Przydział do miejsca pracy:** Każdy menadżer i pracownik jest przypisany do **tylko jednej konkretnej lokalizacji**.

## 3.4. Zarządzanie widocznością elementów panelu

System DISHLY posiada unikalną funkcjonalność personalizacji uprawnień wewnątrz restauracji. Tylko właściciel posiada dostęp do specjalnego widoku konfiguracji interfejsu.

- **Przełączniki uprawnień (Visibility Management):** Właściciel może zdecydować, jakie konkretne karty lub panele zarządzania (elementy UI) są widoczne dla konkretnej roli.
- **Przykłady kontroli:** Właściciel może włączyć lub wyłączyć widoczność "Karty Statystyk" dla roli Menadżer lub widoczność "Strony Głównej z Przychodem" dla roli Pracownik. Mechanizm ten jest realizowany poprzez prosty wybór "tak/nie" przy danym elemencie panelu.

## 3.5. Zarządzanie brandingiem i zapytaniami do systemu

Zanim restauracja wystawi menu, właściciel konfiguruje cechy identyfikujące firmę:

- **Identyfikacja wizualna:** Dodawanie Logo oraz Zdjęcia Głównego (cover image) sieci.
- **Etykiety i Kuchnia:** Wybór z bazy danych takich parametrów jak "Przyjazne dzieciom", "Ogródek letni", "Widok na miasto" czy rodzaj kuchni (np. "Włoska").
- **Interakcja z Adminem:** System umożliwia właścicielowi wystąpienie z prośbą o dodanie nowej, niestandardowej etykiety lub nowej kuchni do systemu globalnego (użytkownik musi zaznaczyć co dokładnie zgłasza).

---

## ✅ Kryteria zakończenia i sukcesu Etapu 3:

1. **Poprawny Flow SaaS:** System pozwala na rejestrację właściciela, wybór subskrypcji i ląduje w bazie jako rekord "oczekujący".
2. **Kontrola limitów:** Próba dodania większej liczby lokalizacji lub kont personelu niż pozwala subskrypcja skutkuje czytelnym błędem i zachętą do ulepszenia planu.
3. **Logowanie personelu:** Konto stworzone przez Właściciela (np. Pracownik) pozwala na zalogowanie się, ale po wejściu do panelu użytkownik widzi informację, do której konkretnej restauracji i lokalizacji jest przypięty.
4. **Izolacja danych:** Menadżer lokalizacji A nie ma technicznej możliwości podejrzenia statystyk lokalizacji B należącej do tego samego właściciela.
5. **Dynamiczny Interfejs:** Jeśli Właściciel wyłączy daną funkcję (np. "Raporty") dla roli Pracownika, po odświeżeniu konta pracownika ta opcja znika z menu nawigacyjnego.
