import { PrismaClient, PageCategory } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Sprawdzenie czy admin już istnieje
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin" },
  });

  if (existingAdmin) {
    console.log("Admin user already exists");
    return;
  }

  // Utworzenie konta administratora
  const passwordHash = await hash("admin", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin",
      passwordHash,
      role: "ADMIN",
      firstName: "Admin",
      lastName: "DISHLY",
      isApproved: true,
    },
  });

  console.log("Created admin user:", {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });

  // Utworzenie początkowych stron
  const pagesData: {
    title: string;
    slug: string;
    category: PageCategory;
    content: string;
    metaDescription: string;
    isPublished: boolean;
    showInHeader: boolean;
    showInFooter: boolean;
    sortOrder: number;
  }[] = [
    // Nawigacja
    {
      title: "O nas",
      slug: "o-nas",
      category: "NAVIGATION",
      content: `<h2>O DISHLY</h2>
<p>DISHLY to innowacyjna platforma łącząca restauracje z głodnymi klientami. Naszą misją jest ułatwienie zamawiania jedzenia i wspieranie lokalnych biznesów kulinarnych.</p>

<h3>Nasza historia</h3>
<p>Założona w 2026 roku przez zespół pasjonatów jedzenia i technologii, DISHLY szybko stała się jedną z najpopularniejszych platform do zamawiania jedzenia online.</p>

<h3>Nasza misja</h3>
<p>Wierzymy, że każdy zasługuje na dostęp do pysznego jedzenia najwyższej jakości, dostarczonego szybko i wygodnie pod same drzwi.</p>`,
      metaDescription:
        "Poznaj DISHLY - platformę łączącą restauracje z klientami. Odkryj naszą historię i misję.",
      isPublished: true,
      showInHeader: true,
      showInFooter: false,
      sortOrder: 1,
    },
    {
      title: "Jak to działa",
      slug: "jak-to-dziala",
      category: "NAVIGATION",
      content: `<h2>Jak działa DISHLY?</h2>
<p>Zamawianie jedzenia przez DISHLY jest proste jak 1-2-3!</p>

<h3>1. Wybierz restaurację</h3>
<p>Przeglądaj setki restauracji w Twojej okolicy. Filtruj według kuchni, ocen lub czasu dostawy.</p>

<h3>2. Złóż zamówienie</h3>
<p>Dodaj ulubione dania do koszyka, dostosuj dodatki i przejdź do płatności.</p>

<h3>3. Ciesz się jedzeniem</h3>
<p>Śledź status zamówienia w czasie rzeczywistym i ciesz się pysznym jedzeniem!</p>

<h3>Dla restauracji</h3>
<p>Jesteś właścicielem restauracji? Dołącz do DISHLY i rozwijaj swój biznes online!</p>`,
      metaDescription:
        "Dowiedz się, jak w prosty sposób zamawiać jedzenie przez DISHLY. Proces zamawiania krok po kroku.",
      isPublished: true,
      showInHeader: true,
      showInFooter: false,
      sortOrder: 2,
    },
    {
      title: "Kariera",
      slug: "kariera",
      category: "NAVIGATION",
      content: `<h2>Dołącz do zespołu DISHLY</h2>
<p>Szukamy utalentowanych osób, które pomogą nam budować przyszłość zamawiania jedzenia online!</p>

<h3>Dlaczego DISHLY?</h3>
<ul>
<li>Dynamiczne środowisko startupowe</li>
<li>Konkurencyjne wynagrodzenie</li>
<li>Elastyczne godziny pracy</li>
<li>Możliwość rozwoju i nauki</li>
<li>Świetny zespół</li>
</ul>

<h3>Aktualne oferty</h3>
<p>Obecnie poszukujemy:</p>
<ul>
<li>Full Stack Developer (React/Node.js)</li>
<li>UX/UI Designer</li>
<li>Marketing Manager</li>
<li>Customer Success Specialist</li>
</ul>

<h3>Aplikuj</h3>
<p>Wyślij swoje CV na adres: <strong>kariera@dishly.pl</strong></p>`,
      metaDescription:
        "Dołącz do zespołu DISHLY! Zobacz aktualne oferty pracy i aplikuj już dziś.",
      isPublished: true,
      showInHeader: true,
      showInFooter: false,
      sortOrder: 3,
    },
    {
      title: "Blog",
      slug: "blog",
      category: "NAVIGATION",
      content: `<h2>Blog DISHLY</h2>
<p>Witaj w naszym blogu! Znajdziesz tu porady kulinarne, nowości z branży gastronomicznej oraz ciekawostki o jedzeniu.</p>

<h3>Najnowsze wpisy</h3>
<p>Wkrótce pojawią się tu nasze najnowsze artykuły!</p>

<h3>Kategorie</h3>
<ul>
<li>Poradniki kulinarne</li>
<li>Nowości w DISHLY</li>
<li>Wywiady z szefami kuchni</li>
<li>Trendy w gastronomii</li>
</ul>`,
      metaDescription:
        "Blog DISHLY - porady kulinarne, nowości i ciekawostki ze świata gastronomii.",
      isPublished: true,
      showInHeader: true,
      showInFooter: false,
      sortOrder: 4,
    },
    {
      title: "Kontakt",
      slug: "kontakt",
      category: "NAVIGATION",
      content: `<h2>Skontaktuj się z nami</h2>
<p>Masz pytania? Chętnie pomożemy!</p>

<h3>Dane kontaktowe</h3>
<p><strong>Email:</strong> kontakt@dishly.pl<br>
<strong>Telefon:</strong> +48 123 456 789<br>
<strong>Godziny:</strong> Pon-Pt 9:00-17:00</p>

<h3>Adres</h3>
<p>DISHLY Sp. z o.o.<br>
ul. Przykładowa 123<br>
00-001 Warszawa<br>
Polska</p>

<h3>Dla mediów</h3>
<p>Zapytania prasowe: <strong>media@dishly.pl</strong></p>

<h3>Wsparcie techniczne</h3>
<p>Pomoc techniczna: <strong>pomoc@dishly.pl</strong></p>`,
      metaDescription:
        "Skontaktuj się z DISHLY. Znajdź nasze dane kontaktowe, adres biura i formy komunikacji.",
      isPublished: true,
      showInHeader: true,
      showInFooter: false,
      sortOrder: 5,
    },
    // Informacje
    {
      title: "Regulamin",
      slug: "regulamin",
      category: "INFORMATION",
      content: `<h2>Regulamin serwisu DISHLY</h2>
<p><em>Ostatnia aktualizacja: 26 lutego 2026</em></p>

<h3>§1 Postanowienia ogólne</h3>
<p>Niniejszy regulamin określa zasady korzystania z platformy DISHLY dostępnej pod adresem dishly.pl</p>

<h3>§2 Definicje</h3>
<ul>
<li><strong>Serwis</strong> - platforma DISHLY</li>
<li><strong>Użytkownik</strong> - osoba korzystająca z Serwisu</li>
<li><strong>Restauracja</strong> - podmiot oferujący posiłki w Serwisie</li>
<li><strong>Zamówienie</strong> - zlecenie dostawy posiłków</li>
</ul>

<h3>§3 Warunki korzystania</h3>
<p>Korzystanie z Serwisu wymaga:</p>
<ul>
<li>Ukończenia 18 lat lub zgody opiekuna</li>
<li>Utworzenia konta w Serwisie</li>
<li>Akceptacji niniejszego regulaminu</li>
</ul>

<h3>§4 Proces zamawiania</h3>
<p>Zamówienie jest wiążące po potwierdzeniu przez Restaurację i dokonaniu płatności.</p>

<h3>§5 Płatności</h3>
<p>Serwis przyjmuje płatności kartą, przelewem lub gotówką przy odbiorze.</p>

<h3>§6 Reklamacje</h3>
<p>Reklamacje należy zgłaszać w ciągu 24h od realizacji zamówienia.</p>

<h3>§7 Odpowiedzialność</h3>
<p>DISHLY pełni rolę pośrednika między Użytkownikiem a Restauracją.</p>

<h3>§8 Ochrona danych osobowych</h3>
<p>Dane osobowe są przetwarzane zgodnie z Polityką Prywatności.</p>

<h3>§9 Postanowienia końcowe</h3>
<p>DISHLY zastrzega sobie prawo do zmiany regulaminu.</p>`,
      metaDescription:
        "Regulamin serwisu DISHLY - poznaj zasady korzystania z platformy do zamawiania jedzenia.",
      isPublished: true,
      showInHeader: false,
      showInFooter: true,
      sortOrder: 1,
    },
    {
      title: "Polityka prywatności",
      slug: "polityka-prywatnosci",
      category: "INFORMATION",
      content: `<h2>Polityka Prywatności DISHLY</h2>
<p><em>Ostatnia aktualizacja: 26 lutego 2026</em></p>

<h3>1. Administrator danych</h3>
<p>Administratorem danych osobowych jest DISHLY Sp. z o.o., ul. Przykładowa 123, 00-001 Warszawa.</p>

<h3>2. Jakie dane zbieramy</h3>
<p>Zbieramy następujące kategorie danych:</p>
<ul>
<li>Dane identyfikacyjne (imię, nazwisko, email)</li>
<li>Dane kontaktowe (telefon, adres dostawy)</li>
<li>Dane o zamówieniach</li>
<li>Dane techniczne (adres IP, cookies)</li>
</ul>

<h3>3. Cel przetwarzania danych</h3>
<p>Przetwarzamy dane w celu:</p>
<ul>
<li>Realizacji zamówień</li>
<li>Komunikacji z klientami</li>
<li>Ulepszania serwisu</li>
<li>Marketing (za zgodą)</li>
</ul>

<h3>4. Podstawa prawna</h3>
<p>Przetwarzamy dane na podstawie:</p>
<ul>
<li>Wykonania umowy (art. 6 ust. 1 lit. b RODO)</li>
<li>Zgody (art. 6 ust. 1 lit. a RODO)</li>
<li>Prawnie uzasadnionego interesu (art. 6 ust. 1 lit. f RODO)</li>
</ul>

<h3>5. Udostępnianie danych</h3>
<p>Dane mogą być udostępniane:</p>
<ul>
<li>Restauracjom realizującym zamówienia</li>
<li>Kurierom</li>
<li>Operatorom płatności</li>
<li>Organom państwowym (na żądanie)</li>
</ul>

<h3>6. Twoje prawa</h3>
<p>Przysługuje Ci prawo do:</p>
<ul>
<li>Dostępu do danych</li>
<li>Sprostowania danych</li>
<li>Usunięcia danych</li>
<li>Ograniczenia przetwarzania</li>
<li>Przenoszenia danych</li>
<li>Sprzeciwu wobec przetwarzania</li>
<li>Cofnięcia zgody</li>
</ul>

<h3>7. Bezpieczeństwo</h3>
<p>Stosujemy środki techniczne i organizacyjne zapewniające bezpieczeństwo danych.</p>

<h3>8. Okres przechowywania</h3>
<p>Dane przechowujemy przez okres niezbędny do realizacji celów lub wymagany prawem.</p>

<h3>9. Kontakt</h3>
<p>W sprawach dotyczących danych osobowych: <strong>rodo@dishly.pl</strong></p>`,
      metaDescription:
        "Polityka prywatności DISHLY - dowiedz się, jak chronimy Twoje dane osobowe.",
      isPublished: true,
      showInHeader: false,
      showInFooter: true,
      sortOrder: 2,
    },
    {
      title: "Polityka cookies",
      slug: "polityka-cookies",
      category: "INFORMATION",
      content: `<h2>Polityka Cookies DISHLY</h2>
<p><em>Ostatnia aktualizacja: 26 lutego 2026</em></p>

<h3>1. Czym są cookies?</h3>
<p>Cookies to małe pliki tekstowe zapisywane na Twoim urządzeniu podczas przeglądania stron internetowych.</p>

<h3>2. Jakie cookies wykorzystujemy</h3>

<h4>Cookies niezbędne</h4>
<p>Umożliwiają podstawowe funkcje serwisu, takie jak logowanie czy przechowywanie koszyka.</p>

<h4>Cookies funkcjonalne</h4>
<p>Zapamiętują Twoje preferencje (język, lokalizacja).</p>

<h4>Cookies analityczne</h4>
<p>Pomagają nam zrozumieć, jak użytkownicy korzystają z serwisu (Google Analytics).</p>

<h4>Cookies marketingowe</h4>
<p>Wykorzystywane do wyświetlania spersonalizowanych reklam.</p>

<h3>3. Cel wykorzystania cookies</h3>
<ul>
<li>Zapewnienie prawidłowego działania serwisu</li>
<li>Dostosowanie treści do preferencji</li>
<li>Analiza ruchu na stronie</li>
<li>Marketing i reklama</li>
</ul>

<h3>4. Zarządzanie cookies</h3>
<p>Możesz kontrolować i usuwać cookies w ustawieniach swojej przeglądarki:</p>
<ul>
<li><strong>Chrome:</strong> Ustawienia → Prywatność i bezpieczeństwo → Pliki cookie</li>
<li><strong>Firefox:</strong> Opcje → Prywatność i bezpieczeństwo</li>
<li><strong>Safari:</strong> Preferencje → Prywatność</li>
<li><strong>Edge:</strong> Ustawienia → Prywatność i usługi</li>
</ul>

<h3>5. Cookies stron trzecich</h3>
<p>Używamy cookies od dostawców zewnętrznych:</p>
<ul>
<li>Google Analytics (analityka)</li>
<li>Facebook Pixel (remarketing)</li>
<li>Stripe (płatności)</li>
</ul>

<h3>6. Zgoda na cookies</h3>
<p>Podczas pierwszej wizyty na stronie prosimy o zgodę na wykorzystanie cookies marketingowych i analitycznych. Cookies niezbędne są wykorzystywane automatycznie.</p>

<h3>7. Wycofanie zgody</h3>
<p>Możesz wycofać zgodę w dowolnym momencie poprzez zmianę ustawień cookies w bannerze na stronie lub w przeglądarce.</p>

<h3>8. Kontakt</h3>
<p>Pytania dotyczące cookies: <strong>kontakt@dishly.pl</strong></p>`,
      metaDescription:
        "Polityka cookies DISHLY - dowiedz się, jakie pliki cookies wykorzystujemy i jak nimi zarządzać.",
      isPublished: true,
      showInHeader: false,
      showInFooter: true,
      sortOrder: 3,
    },
  ];

  console.log("Creating initial pages...");

  for (const pageData of pagesData) {
    const existingPage = await prisma.page.findUnique({
      where: { slug: pageData.slug },
    });

    if (!existingPage) {
      await prisma.page.create({
        data: pageData,
      });
      console.log(`Created page: ${pageData.title}`);
    } else {
      console.log(`Page already exists: ${pageData.title}`);
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
