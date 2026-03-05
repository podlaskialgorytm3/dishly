# 🍽️ DISHLY - Platforma do Zamawiania Jedzenia Online

Aplikacja SaaS umożliwiająca restauracjom przyjmowanie zamówień online i klientom zamawianie jedzenia z dostawą do domu.

## 🚀 Getting Started

### Wymagania
 
- Node.js 20.16+ 
- PostgreSQL database (rekomendowane: Neon.tech lub Supabase)

### Instalacja

1. **Sklonuj repozytorium**

```bash
git clone <repository-url>
cd dishly
```

2. **Zainstaluj zależności**

```bash
npm install
```

3. **Skonfiguruj bazę danych**

Utwórz darmową bazę PostgreSQL na:

- [Neon.tech](https://neon.tech) (Rekomendowane)
- [Supabase](https://supabase.com)

4. **Skonfiguruj zmienne środowiskowe**

Skopiuj connection string z Twojej bazy danych i zaktualizuj plik `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dishly?schema=public"

# NextAuth
AUTH_SECRET="FX04qqqvhB1LxH+y9jT5/Mpeu8S9P6dbXV2ej6GWn9g="
NEXTAUTH_SECRET="FX04qqqvhB1LxH+y9jT5/Mpeu8S9P6dbXV2ej6GWn9g="
NEXTAUTH_URL="http://localhost:3000"
```

5. **Uruchom migracje bazy danych**

```bash
npm run db:push
npx prisma generate
```

6. **Seeduj bazę danych kontem admina**

```bash
npm run db:seed
```

To utworzy konto administratora:

- **Email:** admin
- **Hasło:** admin

7. **Uruchom serwer deweloperski**

```bash
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce.

## 📋 Funkcjonalności

### ✅ Etap 1 - Ukończony

- ✅ Schema bazy danych (Prisma)
- ✅ System autentykacji (NextAuth.js)
- ✅ Logowanie i rejestracja klientów
- ✅ Rejestracja właścicieli restauracji (wymaga zatwierdzenia)
- ✅ Konto administratora
- ✅ Middleware ochrony tras (RBAC)
- ✅ Podstawowy Dashboard

### Role użytkowników

- **ADMIN** - Administrator platformy, zatwierdza nowe restauracje
- **OWNER** - Właściciel restauracji, zarządza menu i lokalizacjami
- **MANAGER** - Menadżer lokalizacji
- **WORKER** - Pracownik obsługujący zamówienia
- **CLIENT** - Klient zamawiający jedzenie

## 🔐 Logowanie

### Konto administratora

- Email: `admin`
- Hasło: `admin`

### Rejestracja klienta

Klienci mogą rejestrować się bezpośrednio i są automatycznie zatwierdzani.

### Rejestracja właściciela restauracji

Właściciele restauracji muszą zarejestrować się wraz z danymi restauracji.
Konto wymaga zatwierdzenia przez administratora.

## 📁 Struktura Projektu

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Panel administratora
│   ├── (auth)/            # Strony logowania/rejestracji
│   ├── (client)/          # Storefront dla klientów
│   ├── (dashboard)/       # Panel restauracji
│   └── api/               # API endpoints
├── components/            # Komponenty React
│   ├── ui/                # Komponenty UI (shadcn)
│   ├── forms/             # Formularze
│   ├── shared/            # Komponenty wspólne
│   └── layout/            # Układy nawigacji
├── lib/                   # Konfiguracja (db, auth)
├── types/                 # Definicje TypeScript
├── actions/               # Server Actions
└── constants/             # Stałe aplikacji
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Język:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5
- **Deployment:** Vercel

## 📝 Skrypty npm

- `npm run dev` - Uruchom serwer deweloperski
- `npm run build` - Zbuduj aplikację produkcyjną
- `npm run start` - Uruchom serwer produkcyjny
- `npm run lint` - Sprawdź kod ESLintem
- `npm run db:push` - Wypchnij schema do bazy danych
- `npm run db:seed` - Seeduj bazę danych

## 🔄 Następne kroki

- [ ] Panel administratora - zatwierdzanie restauracji
- [ ] Panel właściciela - zarządzanie restauracjami
- [ ] Tworzenie i edycja menu
- [ ] System zamówień
- [ ] Integracja z Stripe
- [ ] System powiadomień
- [ ] Geolokalizacja i mapy

## 📚 Dokumentacja

Szczegółowa dokumentacja znajduje się w folderze `docs/`:

- [step-0.md](docs/step-0.md) - Inicjalizacja projektu
- [step-1.md](docs/step-1.md) - Fundamenty i baza danych

## 🤝 Contributing

Projekt w fazie rozwoju.

## 📄 License

Projekt edukacyjny.
