# Panel Zarządzania Treścią - Instrukcja

## 📋 Przegląd

Panel "Zarządzanie treścią" umożliwia administratorom DISHLY zarządzanie wszystkimi statycznymi stronami serwisu z jednego miejsca.

## 🚀 Inicjalizacja

### Krok 1: Zatrzymaj serwer deweloperski

Naciśnij `Ctrl+C` w terminalu, gdzie działa `npm run dev`

### Krok 2: Uruchom setup bazy danych

```powershell
.\setup-database.ps1
```

Lub ręcznie:

```powershell
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Krok 3: Uruchom serwer ponownie

```powershell
npm run dev
```

## 📂 Struktura stron

### Kategorie stron

**NAWIGACJA** - Strony wyświetlane w menu głównym:

- O nas
- Jak to działa
- Kariera
- Blog
- Kontakt

**INFORMACJE** - Strony w stopce:

- Regulamin
- Polityka prywatności
- Polityka cookies

## 💻 Funkcjonalności panelu

### Dostęp do panelu

1. Zaloguj się jako administrator (email: `admin`, hasło: `admin`)
2. W Dashboard kliknij przycisk "Zarządzanie treścią"
3. Lub przejdź bezpośrednio do `/dashboard/content-management`

### Lista stron

Panel wyświetla tabelę ze wszystkimi stronami zawierającą:

- **Tytuł** - nazwa strony
- **Slug** - adres URL (np. `/o-nas`)
- **Kategoria** - NAWIGACJA lub INFORMACJE
- **Status** - Opublikowana / Szkic
- **Kolejność** - porządek w menu
- **Data aktualizacji** - ostatnia modyfikacja

### Dodawanie nowej strony

1. Kliknij "+ Dodaj nową stronę"
2. Wypełnij formularz:
   - **Tytuł** - nazwa strony (wymagane)
   - **Slug** - automatycznie generowany z tytułu, można edytować
   - **Kategoria** - wybierz NAWIGACJA lub INFORMACJE
   - **Treść** - główna zawartość (HTML lub Markdown)
   - **Opis meta** - dla SEO (150-160 znaków)
   - **Kolejność** - numer porządkowy (mniejsza = wyżej)
   - **Opublikuj** - zaznacz, aby strona była widoczna
3. Kliknij "Utwórz stronę"

### Edycja istniejącej strony

1. W tabeli znajdź stronę do edycji
2. Kliknij przycisk "Edytuj"
3. Zmodyfikuj pola
4. Kliknij "Zapisz zmiany"

### Usuwanie strony

1. W tabeli znajdź stronę do usunięcia
2. Kliknij przycisk "Usuń"
3. Potwierdź usunięcie w oknie dialogowym

## 📝 Formatowanie treści

### HTML

Możesz używać podstawowych tagów HTML:

```html
<h2>Nagłówek 2</h2>
<h3>Nagłówek 3</h3>
<p>Paragraf tekstu</p>
<ul>
  <li>Element listy</li>
</ul>
<strong>Pogrubienie</strong>
<em>Kursywa</em>
<a href="/link">Link</a>
```

### Przykład dobrze sformatowanej treści

```html
<h2>Główny tytuł sekcji</h2>
<p>Wprowadzenie do tematu z ważnymi informacjami.</p>

<h3>Podsekcja</h3>
<p>Szczegółowy opis z <strong>ważnymi</strong> elementami.</p>

<ul>
  <li>Pierwszy punkt</li>
  <li>Drugi punkt</li>
  <li>Trzeci punkt</li>
</ul>
```

## 🔒 Bezpieczeństwo

- Tylko użytkownicy z rolą `ADMIN` mają dostęp do panelu
- Wszystkie operacje są logowane
- Strony nieopublikowane (szkice) nie są widoczne dla użytkowników

## 🌐 Wyświetlanie stron

Opublikowane strony są dostępne pod adresem:

```
https://dishly.pl/{slug}
```

Przykłady:

- `https://dishly.pl/o-nas`
- `https://dishly.pl/regulamin`
- `https://dishly.pl/polityka-prywatnosci`

## 📊 SEO

### Opis meta (metaDescription)

- Wykorzystywany w wynikach wyszukiwania Google
- Optymalnie: 150-160 znaków
- Powinien zawierać najważniejsze słowa kluczowe
- Przykład: "Poznaj DISHLY - platformę łączącą restauracje z klientami. Odkryj naszą historię i misję."

### Slug

- Przyjazny dla SEO adres URL
- Tylko małe litery, cyfry i myślniki
- Bez polskich znaków
- Przykłady dobrych slugów:
  - `o-nas`
  - `jak-to-dziala`
  - `polityka-prywatnosci`

## 🎯 Najlepsze praktyki

### Tworzenie treści

1. **Struktura hierarchiczna** - używaj nagłówków H2, H3 dla logicznej struktury
2. **Krótkie paragrafy** - max 3-4 zdania
3. **Punkty wypunktowane** - dla list i wyliczeń
4. **Linki wewnętrzne** - łącz powiązane treści
5. **Call-to-action** - zachęcaj do działania

### Kolejność wyświetlania

- Ustaw `sortOrder` od 1 wzwyż
- Mniejsza wartość = wyżej w menu
- Przykład:
  - O nas: 1
  - Jak to działa: 2
  - Kariera: 3
  - Blog: 4
  - Kontakt: 5

### Statusy publikacji

- **Szkic** - pracuj nad treścią bez publikowania
- **Opublikowana** - widoczna dla wszystkich użytkowników

## 🐛 Rozwiązywanie problemów

### Błąd: "Strona z tym slugiem już istnieje"

- Zmień slug na unikalny
- Sprawdź listę istniejących stron

### Strona nie wyświetla się na froncie

- Sprawdź czy jest opublikowana (checkbox "Opublikuj stronę")
- Sprawdź czy slug jest poprawny
- Wyczyść cache przeglądarki (Ctrl+F5)

### Błędy Prisma przy inicjalizacji

- Upewnij się, że serwer dev jest zatrzymany
- Sprawdź połączenie z bazą danych w `.env`
- Uruchom ponownie `setup-database.ps1`

## 📞 Pomoc

W razie problemów:

1. Sprawdź logi w konsoli deweloperskiej
2. Sprawdź błędy w terminalu serwera
3. Skontaktuj się z zespołem technicznym

## 🔄 Aktualizacje

Panel jest ciągle rozwijany. Planowane funkcjonalności:

- [ ] Edytor WYSIWYG (wizualny)
- [ ] Wersjonowanie treści
- [ ] Podgląd przed publikacją
- [ ] Harmonogram publikacji
- [ ] Szablony stron
- [ ] Media library dla obrazków
