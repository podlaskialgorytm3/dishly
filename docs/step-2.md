Oto szczegółowy plan techniczny **Etapu 2**. Na tym etapie budujesz system kontroli nad całą platformą. Dostęp do tych funkcjonalności musi być rygorystycznie ograniczony do użytkowników z rolą `ADMIN`.

---

# 👑 Etap 2: Panel Administratora Systemu (Backoffice)

Ten etap skupia się na stworzeniu panelu operacyjnego, który pozwoli Ci (jako producentowi DISHLY) zarządzać modelem biznesowym i dbać o jakość danych w systemie.

---

## 2.1. Infrastruktura Panelu Admina

Zanim wdrożysz konkretne funkcje, przygotuj bezpieczny layout.

- **Routing:** Wszystkie widoki w folderze `@/app/(admin)/admin/*`.
- **Layout:** Boczne menu (Sidebar) z linkami: _Pulpit, Subskrypcje, Restauracje, Słowniki, Moderacja_.
- **Ochrona dostępu:**
  - Stworzenie komponentu Higher-Order lub sprawdzanie w `layout.tsx`:
  - `if (session?.user.role !== 'ADMIN') redirect('/')`.
- **Komponenty UI (Shadcn/ui):** Wykorzystanie `DataTable` do wyświetlania list, `Dialog` do formularzy oraz `Badge` do statusów.

---

## 2.2. Zarządzanie Planami Subskrypcyjnymi (SaaS Core)

To tutaj definiujesz, na czym zarabia aplikacja.

- **Interfejs CRUD:**
  - Tabela wyświetlająca wszystkie dostępne pakiety (np. Basic, Pro, Enterprise).
- **Formularz edycji/dodawania (Zod Validation):**
  - `name`: Nazwa planu.
  - `price`: Cena miesięczna.
  - `limits`:
    - Maksymalna liczba lokalizacji (Integer).
    - Maksymalna liczba dań w menu (Integer).
    - Maksymalna liczba kont personelu (Integer).
- **Logika Biznesowa:** Zmiana planu w bazie danych (`SubscriptionPlan`) powinna być natychmiastowo widoczna dla wszystkich przypisanych do niego restauracji (poprzez relację w Prisma).

---

## 2.3. System Weryfikacji i Akceptacji Restauracji

Zgodnie ze specyfikacją (str. 7), każda nowa firma trafia w status "oczekująca".

- **Widok Kolejki (Pending Queue):**
  - Lista restauracji ze statusem `PENDING`.
  - Podgląd szczegółów: nazwa właściciela, NIP/dane firmowe (jeśli dodasz), data rejestracji.
- **Akcje:**
  - **Przycisk "Akceptuj":** Zmiana statusu na `APPROVED`, co odblokowuje właścicielowi możliwość konfiguracji menu.
  - **Przycisk "Odrzuć":** Usunięcie rekordu lub zmiana statusu na `REJECTED` (z opcjonalnym podaniem przyczyny).
- **Automatyzacja:** (Opcjonalnie) Po akceptacji wysyłka prostego e-maila do właściciela (np. przez Resend/Nodemailer).

---

## 2.4. Zarządzanie Globalnymi Słownikami (Data Integrity)

Aby filtry wyszukiwania dla klientów działały poprawnie, etykiety muszą być ustandaryzowane przez Admina.

- **Typy Kuchni:** Zarządzanie listą (np. Włoska, Japońska, Veggie). Restauratorzy wybierają z tej listy, nie mogą tworzyć własnych (aby uniknąć literówek typu "Włoska" i "Wloska").
- **Etykiety Restauracji (Amenities):** CRUD dla tagów typu: "Przyjazne dzieciom", "Wi-Fi", "Ogródek letni".
- **Etykiety Dań:** Zarządzanie tagami "Ostre", "Wegetariańskie", "Bezglutenowe".
- **System Akceptacji Prośby:** (Specyfikacja str. 8) Funkcjonalność akceptowania propozycji nowych etykiet zgłoszonych przez właścicieli restauracji.

---

## 2.5. Moderacja i Bezpieczeństwo Ekosystemu

Ochrona przed nadużyciami.

- **Panel Opinii:**
  - Centralna lista wszystkich recenzji z systemu.
  - Możliwość filtrowania po niskich ocenach lub słowach kluczowych.
  - Akcja: Usuń opinię (jeśli narusza regulamin).
- **Zarządzanie Użytkownikami (Global User Management):**
  - Lista wszystkich użytkowników (`User`).
  - Możliwość edycji podstawowych danych.
  - Funkcja "Ban / Deactivate": Wyłączenie dostępu do konta (np. flaga `isActive: boolean` w Prisma).
- **Reset haseł:** Możliwość wygenerowania linku do resetu hasła dla użytkownika (str. 8 specyfikacji).

---

## ✅ Kryteria zakończenia Etapu 2:

1. [ ] Admin może stworzyć nowy plan subskrypcyjny o dowolnej nazwie z określonymi limitami.
2. [ ] Nowo zarejestrowana restauracja pojawia się w panelu admina i nie może nic zrobić, dopóki admin jej nie kliknie "Akceptuj".
3. [ ] Admin może dodać nową kategorię kuchni "Fusion", która staje się natychmiast dostępna dla wszystkich restauracji w ich panelach.
4. [ ] Nieuprawniony użytkownik (Klient lub Pracownik) próbujący wejść pod adres `/admin` jest przekierowywany na stronę główną.

**Potrzebne biblioteki dla tego etapu:**

- `@tanstack/react-table` – do wydajnych tabel danych.
- `lucide-react` – zestaw ikon do nawigacji.
- `recharts` – (opcjonalnie) jeśli chcesz dodać wykres ilości użytkowników na pulpicie.

---

**Co dalej?** W Etapie 3 przejdziemy do **Panelu Restauracji**, gdzie właściciel (zaakceptowany przez Ciebie) będzie mógł zacząć zarządzać swoim biznesem w ramach narzuconych w tym kroku limitów.
