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

  // ============================================
  // CUISINE TYPES
  // ============================================
  console.log("Creating cuisine types...");

  const cuisineTypesData = [
    { name: "Kuchnia Polska", slug: "polska" },
    { name: "Kuchnia Włoska", slug: "wloska" },
    { name: "Kuchnia Japońska", slug: "japonska" },
    { name: "Kuchnia Meksykańska", slug: "meksykanska" },
    { name: "Kuchnia Indyjska", slug: "indyjska" },
    { name: "Kuchnia Amerykańska", slug: "amerykanska" },
    { name: "Kuchnia Tajska", slug: "tajska" },
    { name: "Kuchnia Turecka", slug: "turecka" },
  ];

  const cuisineTypes: Record<string, any> = {};
  for (const ct of cuisineTypesData) {
    cuisineTypes[ct.slug] = await prisma.cuisineType.upsert({
      where: { slug: ct.slug },
      update: {},
      create: ct,
    });
  }

  // ============================================
  // RESTAURANT TAGS
  // ============================================
  console.log("Creating restaurant tags...");

  const tagsData = [
    { name: "Darmowa dostawa", slug: "darmowa-dostawa" },
    { name: "Szybka dostawa", slug: "szybka-dostawa" },
    { name: "Wegetariańskie", slug: "wegetarianskie" },
    { name: "Wegańskie", slug: "weganskie" },
    { name: "Bezglutenowe", slug: "bezglutenowe" },
    { name: "Popularne", slug: "popularne" },
    { name: "Nowe", slug: "nowe" },
    { name: "Premium", slug: "premium" },
  ];

  const tags: Record<string, any> = {};
  for (const t of tagsData) {
    tags[t.slug] = await prisma.restaurantTag.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }

  // ============================================
  // CATEGORIES (Meal Categories)
  // ============================================
  console.log("Creating meal categories...");

  const categoriesData = [
    { name: "Przystawki", slug: "przystawki", sortOrder: 1 },
    { name: "Zupy", slug: "zupy", sortOrder: 2 },
    { name: "Dania główne", slug: "dania-glowne", sortOrder: 3 },
    { name: "Pizza", slug: "pizza", sortOrder: 4 },
    { name: "Burgery", slug: "burgery", sortOrder: 5 },
    { name: "Sushi", slug: "sushi", sortOrder: 6 },
    { name: "Makarony", slug: "makarony", sortOrder: 7 },
    { name: "Sałatki", slug: "salatki", sortOrder: 8 },
    { name: "Desery", slug: "desery", sortOrder: 9 },
    { name: "Napoje", slug: "napoje", sortOrder: 10 },
  ];

  const categories: Record<string, any> = {};
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // ============================================
  // OWNER USER
  // ============================================
  console.log("Creating owner user...");

  const ownerPasswordHash = await hash("owner123", 12);
  const owner = await prisma.user.upsert({
    where: { email: "owner@dishly.pl" },
    update: {},
    create: {
      email: "owner@dishly.pl",
      passwordHash: ownerPasswordHash,
      role: "OWNER",
      firstName: "Jan",
      lastName: "Kowalski",
      phone: "+48 500 100 200",
      isApproved: true,
    },
  });

  // ============================================
  // CLIENT USER
  // ============================================
  console.log("Creating client user...");

  const clientPasswordHash = await hash("client123", 12);
  await prisma.user.upsert({
    where: { email: "client@dishly.pl" },
    update: {},
    create: {
      email: "client@dishly.pl",
      passwordHash: clientPasswordHash,
      role: "CLIENT",
      firstName: "Anna",
      lastName: "Nowak",
      phone: "+48 600 300 400",
      isApproved: true,
    },
  });

  // ============================================
  // DEFAULT OPENING HOURS
  // ============================================
  const defaultOpeningHours = {
    monday: { open: "10:00", close: "22:00", closed: false },
    tuesday: { open: "10:00", close: "22:00", closed: false },
    wednesday: { open: "10:00", close: "22:00", closed: false },
    thursday: { open: "10:00", close: "22:00", closed: false },
    friday: { open: "10:00", close: "23:00", closed: false },
    saturday: { open: "11:00", close: "23:00", closed: false },
    sunday: { open: "12:00", close: "21:00", closed: false },
  };

  // ============================================
  // RESTAURANT 1: BELLA ITALIA
  // ============================================
  console.log("Creating restaurant: Bella Italia...");

  const bellaItalia = await prisma.restaurant.upsert({
    where: { slug: "bella-italia" },
    update: {},
    create: {
      name: "Bella Italia",
      slug: "bella-italia",
      bio: "Autentyczna kuchnia włoska w sercu Warszawy. Świeże składniki, tradycyjne receptury i pasja do gotowania — to nasza wizytówka. Zapraszamy na podróż kulinarną do Włoch!",
      ownerId: owner.id,
      status: "APPROVED",
      isActive: true,
      cuisineTypes: { connect: [{ id: cuisineTypes["wloska"].id }] },
      tags: {
        connect: [
          { id: tags["popularne"].id },
          { id: tags["szybka-dostawa"].id },
        ],
      },
    },
  });

  const bellaItaliaLocation = await prisma.location.create({
    data: {
      restaurantId: bellaItalia.id,
      name: "Bella Italia - Centrum",
      address: "ul. Nowy Świat 42",
      city: "Warszawa",
      postalCode: "00-363",
      phone: "+48 22 100 20 30",
      deliveryRadius: 8,
      deliveryFee: 5.99,
      minOrderValue: 30.0,
      latitude: 52.2297,
      longitude: 21.0122,
      openingHours: defaultOpeningHours,
    },
  });

  // Meals for Bella Italia
  const biMeals = [
    {
      name: "Bruschetta Classica",
      slug: "bruschetta-classica",
      categorySlug: "przystawki",
      description:
        "Chrupiąca grzanka z pomidorami, bazylią, czosnkiem i oliwą z oliwek extra virgin.",
      basePrice: 18.0,
      preparationTime: 10,
      calories: 220,
      protein: 5.0,
      carbs: 28.0,
      fat: 10.0,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
    },
    {
      name: "Zupa Minestrone",
      slug: "zupa-minestrone",
      categorySlug: "zupy",
      description:
        "Klasyczna włoska zupa warzywna z makaronem, fasolą i świeżymi ziołami.",
      basePrice: 22.0,
      preparationTime: 15,
      calories: 180,
      protein: 8.0,
      carbs: 25.0,
      fat: 4.0,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
    },
    {
      name: "Pizza Margherita",
      slug: "pizza-margherita",
      categorySlug: "pizza",
      description:
        "Klasyczna pizza na cienkim cieście z sosem pomidorowym San Marzano, mozzarellą fior di latte i świeżą bazylią.",
      basePrice: 32.0,
      preparationTime: 20,
      calories: 800,
      protein: 28.0,
      carbs: 90.0,
      fat: 25.0,
      spiceLevel: 0,
      isVegetarian: true,
    },
    {
      name: "Pizza Pepperoni",
      slug: "pizza-pepperoni",
      categorySlug: "pizza",
      description:
        "Pizza z podwójną porcją pepperoni, mozzarellą i sosem pomidorowym. Pikantna i aromatyczna!",
      basePrice: 38.0,
      preparationTime: 20,
      calories: 950,
      protein: 35.0,
      carbs: 85.0,
      fat: 38.0,
      spiceLevel: 2,
    },
    {
      name: "Pizza Quattro Formaggi",
      slug: "pizza-quattro-formaggi",
      categorySlug: "pizza",
      description:
        "Pizza z czterema serami: mozzarella, gorgonzola, parmezan i fontina.",
      basePrice: 42.0,
      preparationTime: 20,
      calories: 1050,
      protein: 40.0,
      carbs: 82.0,
      fat: 48.0,
      spiceLevel: 0,
      isVegetarian: true,
    },
    {
      name: "Spaghetti Carbonara",
      slug: "spaghetti-carbonara",
      categorySlug: "makarony",
      description:
        "Makaron spaghetti z guanciale, jajkiem, pecorino romano i czarnym pieprzem. Klasyka Rzymu.",
      basePrice: 36.0,
      preparationTime: 18,
      calories: 750,
      protein: 30.0,
      carbs: 70.0,
      fat: 32.0,
      spiceLevel: 1,
    },
    {
      name: "Penne Arrabbiata",
      slug: "penne-arrabbiata",
      categorySlug: "makarony",
      description:
        "Penne w pikantnym sosie pomidorowym z czosnkiem, chili i świeżą pietruszką.",
      basePrice: 30.0,
      preparationTime: 15,
      calories: 600,
      protein: 15.0,
      carbs: 80.0,
      fat: 18.0,
      spiceLevel: 4,
      isVegetarian: true,
      isVegan: true,
    },
    {
      name: "Risotto ai Funghi",
      slug: "risotto-ai-funghi",
      categorySlug: "dania-glowne",
      description:
        "Kremowe risotto z mieszanką leśnych grzybów, parmezanem i truflowym olejkiem.",
      basePrice: 40.0,
      preparationTime: 25,
      calories: 650,
      protein: 18.0,
      carbs: 75.0,
      fat: 22.0,
      spiceLevel: 0,
      isVegetarian: true,
    },
    {
      name: "Tiramisu",
      slug: "tiramisu",
      categorySlug: "desery",
      description:
        "Klasyczne tiramisu z mascarpone, kawą espresso i kakao. Domowa receptura!",
      basePrice: 24.0,
      preparationTime: 5,
      calories: 380,
      protein: 8.0,
      carbs: 35.0,
      fat: 22.0,
      spiceLevel: 0,
      isVegetarian: true,
    },
    {
      name: "Panna Cotta",
      slug: "panna-cotta",
      categorySlug: "desery",
      description: "Delikatna panna cotta z sosem z malin i listkami mięty.",
      basePrice: 20.0,
      preparationTime: 5,
      calories: 320,
      protein: 5.0,
      carbs: 30.0,
      fat: 18.0,
      spiceLevel: 0,
      isVegetarian: true,
    },
  ];

  for (const mealData of biMeals) {
    const { categorySlug, ...rest } = mealData;
    const meal = await prisma.meal.create({
      data: {
        ...rest,
        restaurantId: bellaItalia.id,
        categoryId: categories[categorySlug].id,
        approvalStatus: "APPROVED",
      },
    });

    // Link to location
    await prisma.mealLocation.create({
      data: {
        mealId: meal.id,
        locationId: bellaItaliaLocation.id,
        isAvailable: true,
      },
    });

    // Add variants for pizza
    if (categorySlug === "pizza") {
      await prisma.mealVariant.createMany({
        data: [
          { mealId: meal.id, name: "Mała (25cm)", priceModifier: -6.0 },
          { mealId: meal.id, name: "Średnia (32cm)", priceModifier: 0.0 },
          { mealId: meal.id, name: "Duża (40cm)", priceModifier: 8.0 },
          { mealId: meal.id, name: "Rodzinna (50cm)", priceModifier: 16.0 },
        ],
      });
    }

    // Add addons for pasta / main dishes
    if (categorySlug === "makarony" || categorySlug === "dania-glowne") {
      await prisma.mealAddon.createMany({
        data: [
          { mealId: meal.id, name: "Parmezan", price: 4.0 },
          { mealId: meal.id, name: "Oliwa truflowa", price: 6.0 },
          { mealId: meal.id, name: "Dodatkowy sos", price: 3.0 },
        ],
      });
    }
  }

  // ============================================
  // RESTAURANT 2: SUSHI MASTER
  // ============================================
  console.log("Creating restaurant: Sushi Master...");

  const sushiMaster = await prisma.restaurant.upsert({
    where: { slug: "sushi-master" },
    update: {},
    create: {
      name: "Sushi Master",
      slug: "sushi-master",
      bio: "Najlepsze sushi w mieście! Świeże ryby dostarczane codziennie, tradycyjne japońskie techniki i nowoczesne kompozycje smakowe.",
      ownerId: owner.id,
      status: "APPROVED",
      isActive: true,
      cuisineTypes: { connect: [{ id: cuisineTypes["japonska"].id }] },
      tags: {
        connect: [{ id: tags["premium"].id }, { id: tags["popularne"].id }],
      },
    },
  });

  const sushiMasterLocation = await prisma.location.create({
    data: {
      restaurantId: sushiMaster.id,
      name: "Sushi Master - Mokotów",
      address: "ul. Puławska 112",
      city: "Warszawa",
      postalCode: "02-620",
      phone: "+48 22 200 30 40",
      deliveryRadius: 10,
      deliveryFee: 7.99,
      minOrderValue: 50.0,
      latitude: 52.1935,
      longitude: 21.0224,
      openingHours: defaultOpeningHours,
    },
  });

  const smMeals = [
    {
      name: "Edamame",
      slug: "edamame",
      categorySlug: "przystawki",
      description: "Gotowane na parze strączki soi z solą morską.",
      basePrice: 14.0,
      preparationTime: 5,
      calories: 120,
      protein: 11.0,
      carbs: 9.0,
      fat: 5.0,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
    },
    {
      name: "Zupa Miso",
      slug: "zupa-miso",
      categorySlug: "zupy",
      description:
        "Tradycyjna japońska zupa z pastą miso, tofu, wakame i szczypiorkiem.",
      basePrice: 16.0,
      preparationTime: 8,
      calories: 85,
      protein: 6.0,
      carbs: 8.0,
      fat: 3.0,
      spiceLevel: 0,
      isVegetarian: true,
    },
    {
      name: "Nigiri Łosoś (2 szt.)",
      slug: "nigiri-losos",
      categorySlug: "sushi",
      description: "Dwa kawałki świeżego łososia na ryżu sushi.",
      basePrice: 18.0,
      preparationTime: 10,
      calories: 140,
      protein: 12.0,
      carbs: 18.0,
      fat: 4.0,
      spiceLevel: 0,
    },
    {
      name: "Nigiri Tuńczyk (2 szt.)",
      slug: "nigiri-tunczyk",
      categorySlug: "sushi",
      description: "Dwa kawałki świeżego tuńczyka na ryżu sushi.",
      basePrice: 22.0,
      preparationTime: 10,
      calories: 130,
      protein: 14.0,
      carbs: 18.0,
      fat: 2.0,
      spiceLevel: 0,
    },
    {
      name: "California Roll (8 szt.)",
      slug: "california-roll",
      categorySlug: "sushi",
      description:
        "Klasyczny roll z krabem, awokado i ogórkiem. Posypany sezamem.",
      basePrice: 32.0,
      preparationTime: 15,
      calories: 350,
      protein: 12.0,
      carbs: 50.0,
      fat: 10.0,
      spiceLevel: 0,
    },
    {
      name: "Dragon Roll (8 szt.)",
      slug: "dragon-roll",
      categorySlug: "sushi",
      description:
        "Roll z krewetką w tempurze, awokado na wierzchu, sos unagi. Nasz bestseller!",
      basePrice: 42.0,
      preparationTime: 20,
      calories: 480,
      protein: 18.0,
      carbs: 55.0,
      fat: 16.0,
      spiceLevel: 1,
    },
    {
      name: "Spicy Tuna Roll (8 szt.)",
      slug: "spicy-tuna-roll",
      categorySlug: "sushi",
      description:
        "Pikantny roll z tuńczykiem, majonezem sriracha i szczypiorkiem.",
      basePrice: 38.0,
      preparationTime: 15,
      calories: 390,
      protein: 20.0,
      carbs: 45.0,
      fat: 12.0,
      spiceLevel: 3,
    },
    {
      name: "Ramen Tonkotsu",
      slug: "ramen-tonkotsu",
      categorySlug: "dania-glowne",
      description:
        "Bogaty ramen na bazie bulionu wieprzowego z jajkiem marynowanym, wieprzowiną chashu, nori i szczypiorkiem.",
      basePrice: 38.0,
      preparationTime: 20,
      calories: 680,
      protein: 35.0,
      carbs: 60.0,
      fat: 28.0,
      spiceLevel: 1,
    },
    {
      name: "Mochi Lodowe (3 szt.)",
      slug: "mochi-lodowe",
      categorySlug: "desery",
      description:
        "Japońskie kuleczki mochi z lodami w smakach: matcha, mango, truskawka.",
      basePrice: 18.0,
      preparationTime: 3,
      calories: 220,
      protein: 3.0,
      carbs: 35.0,
      fat: 7.0,
      spiceLevel: 0,
      isVegetarian: true,
    },
  ];

  for (const mealData of smMeals) {
    const { categorySlug, ...rest } = mealData;
    const meal = await prisma.meal.create({
      data: {
        ...rest,
        restaurantId: sushiMaster.id,
        categoryId: categories[categorySlug].id,
        approvalStatus: "APPROVED",
      },
    });

    await prisma.mealLocation.create({
      data: {
        mealId: meal.id,
        locationId: sushiMasterLocation.id,
        isAvailable: true,
      },
    });

    // Addons for sushi
    if (categorySlug === "sushi") {
      await prisma.mealAddon.createMany({
        data: [
          { mealId: meal.id, name: "Sos sojowy", price: 2.0 },
          { mealId: meal.id, name: "Wasabi extra", price: 2.0 },
          { mealId: meal.id, name: "Imbir marynowany", price: 2.0 },
        ],
      });
    }
  }

  // ============================================
  // RESTAURANT 3: BURGER HOUSE
  // ============================================
  console.log("Creating restaurant: Burger House...");

  const burgerHouse = await prisma.restaurant.upsert({
    where: { slug: "burger-house" },
    update: {},
    create: {
      name: "Burger House",
      slug: "burger-house",
      bio: "Soczyste burgery z najlepszego mięsa wołowego, domowe bułki i świeże składniki. Każdy burger to dzieło sztuki!",
      ownerId: owner.id,
      status: "APPROVED",
      isActive: true,
      cuisineTypes: { connect: [{ id: cuisineTypes["amerykanska"].id }] },
      tags: {
        connect: [
          { id: tags["popularne"].id },
          { id: tags["szybka-dostawa"].id },
          { id: tags["nowe"].id },
        ],
      },
    },
  });

  const burgerHouseLocation = await prisma.location.create({
    data: {
      restaurantId: burgerHouse.id,
      name: "Burger House - Śródmieście",
      address: "ul. Marszałkowska 78",
      city: "Warszawa",
      postalCode: "00-517",
      phone: "+48 22 300 40 50",
      deliveryRadius: 7,
      deliveryFee: 4.99,
      minOrderValue: 25.0,
      latitude: 52.2277,
      longitude: 21.0155,
      openingHours: defaultOpeningHours,
    },
  });

  const bhMeals = [
    {
      name: "Nachos z serem",
      slug: "nachos-z-serem",
      categorySlug: "przystawki",
      description:
        "Chrupiące nachos z ciągnącym się serem cheddar, jalapeño, guacamole i śmietaną.",
      basePrice: 22.0,
      preparationTime: 10,
      calories: 450,
      protein: 15.0,
      carbs: 40.0,
      fat: 25.0,
      spiceLevel: 2,
      isVegetarian: true,
    },
    {
      name: "Classic Burger",
      slug: "classic-burger",
      categorySlug: "burgery",
      description:
        "Klasyczny burger: wołowina 180g, ser cheddar, sałata, pomidor, cebula, ogórek kiszony i nasz firmowy sos.",
      basePrice: 32.0,
      preparationTime: 15,
      calories: 780,
      protein: 42.0,
      carbs: 45.0,
      fat: 38.0,
      spiceLevel: 0,
    },
    {
      name: "Bacon Smash Burger",
      slug: "bacon-smash-burger",
      categorySlug: "burgery",
      description:
        "Podwójny smash burger z wędzonym bekonem, karmelizowaną cebulą i serem amerykańskim.",
      basePrice: 38.0,
      preparationTime: 15,
      calories: 950,
      protein: 52.0,
      carbs: 40.0,
      fat: 55.0,
      spiceLevel: 0,
    },
    {
      name: "BBQ Pulled Pork Burger",
      slug: "bbq-pulled-pork-burger",
      categorySlug: "burgery",
      description:
        "Szarpana wieprzowina w sosie BBQ, colesław, prażona cebulka na maślanej bułce brioche.",
      basePrice: 36.0,
      preparationTime: 15,
      calories: 850,
      protein: 38.0,
      carbs: 55.0,
      fat: 42.0,
      spiceLevel: 1,
    },
    {
      name: "Veggie Burger",
      slug: "veggie-burger",
      categorySlug: "burgery",
      description:
        "Burger roślinny z ciecierzycy i buraka, awokado, rukola, pomidor suszony i sos tahini.",
      basePrice: 30.0,
      preparationTime: 15,
      calories: 580,
      protein: 18.0,
      carbs: 55.0,
      fat: 28.0,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
    },
    {
      name: "Hot Chicken Burger",
      slug: "hot-chicken-burger",
      categorySlug: "burgery",
      description:
        "Panierowany kurczak w pikantnej panierce Nashville Hot, colesław, ogórki kiszone.",
      basePrice: 34.0,
      preparationTime: 18,
      calories: 820,
      protein: 38.0,
      carbs: 60.0,
      fat: 35.0,
      spiceLevel: 5,
    },
    {
      name: "Frytki Belgijskie",
      slug: "frytki-belgijskie",
      categorySlug: "przystawki",
      description: "Grube frytki dwukrotnie smażone, podawane z trzema sosami.",
      basePrice: 16.0,
      preparationTime: 10,
      calories: 420,
      protein: 5.0,
      carbs: 55.0,
      fat: 20.0,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
    },
    {
      name: "Sałatka Cezar",
      slug: "salatka-cezar-bh",
      categorySlug: "salatki",
      description:
        "Sałata rzymska, kurczak grillowany, grzanki, parmezan i sos Caesar.",
      basePrice: 28.0,
      preparationTime: 10,
      calories: 380,
      protein: 28.0,
      carbs: 20.0,
      fat: 18.0,
      spiceLevel: 0,
    },
    {
      name: "Brownie z lodami",
      slug: "brownie-z-lodami",
      categorySlug: "desery",
      description:
        "Ciepłe brownie czekoladowe z gałką lodów waniliowych i sosem karmelowym.",
      basePrice: 22.0,
      preparationTime: 8,
      calories: 520,
      protein: 8.0,
      carbs: 65.0,
      fat: 25.0,
      spiceLevel: 0,
      isVegetarian: true,
    },
    {
      name: "Milkshake",
      slug: "milkshake",
      categorySlug: "napoje",
      description:
        "Gęsty shake mleczny do wyboru: czekolada, truskawka, wanilia lub karmel.",
      basePrice: 18.0,
      preparationTime: 5,
      calories: 450,
      protein: 10.0,
      carbs: 55.0,
      fat: 20.0,
      spiceLevel: 0,
      isVegetarian: true,
    },
  ];

  for (const mealData of bhMeals) {
    const { categorySlug, ...rest } = mealData;
    const meal = await prisma.meal.create({
      data: {
        ...rest,
        restaurantId: burgerHouse.id,
        categoryId: categories[categorySlug].id,
        approvalStatus: "APPROVED",
      },
    });

    await prisma.mealLocation.create({
      data: {
        mealId: meal.id,
        locationId: burgerHouseLocation.id,
        isAvailable: true,
      },
    });

    // Addons for burgers
    if (categorySlug === "burgery") {
      await prisma.mealAddon.createMany({
        data: [
          { mealId: meal.id, name: "Dodatkowy ser", price: 4.0 },
          { mealId: meal.id, name: "Bekon", price: 5.0 },
          { mealId: meal.id, name: "Jalapeño", price: 3.0 },
          { mealId: meal.id, name: "Dodatkowy kotlet", price: 10.0 },
          { mealId: meal.id, name: "Frytki do zestawu", price: 8.0 },
        ],
      });

      await prisma.mealVariant.createMany({
        data: [
          { mealId: meal.id, name: "Standardowy", priceModifier: 0.0 },
          { mealId: meal.id, name: "Podwójny", priceModifier: 12.0 },
        ],
      });
    }
  }

  // ============================================
  // RESTAURANT 4: SMAK POLSKI
  // ============================================
  console.log("Creating restaurant: Smak Polski...");

  const smakPolski = await prisma.restaurant.upsert({
    where: { slug: "smak-polski" },
    update: {},
    create: {
      name: "Smak Polski",
      slug: "smak-polski",
      bio: "Tradycyjna kuchnia polska w nowoczesnym wydaniu. Babcine receptury, lokalne składniki i domowy smak, który przywołuje wspomnienia.",
      ownerId: owner.id,
      status: "APPROVED",
      isActive: true,
      cuisineTypes: { connect: [{ id: cuisineTypes["polska"].id }] },
      tags: {
        connect: [
          { id: tags["popularne"].id },
          { id: tags["darmowa-dostawa"].id },
        ],
      },
    },
  });

  const smakPolskiLocation = await prisma.location.create({
    data: {
      restaurantId: smakPolski.id,
      name: "Smak Polski - Wola",
      address: "ul. Wolska 18",
      city: "Warszawa",
      postalCode: "01-258",
      phone: "+48 22 400 50 60",
      deliveryRadius: 10,
      deliveryFee: 0.0,
      minOrderValue: 35.0,
      latitude: 52.2352,
      longitude: 20.9717,
      openingHours: defaultOpeningHours,
    },
  });

  const spMeals = [
    {
      name: "Żurek w chlebku",
      slug: "zurek-w-chlebku",
      categorySlug: "zupy",
      description:
        "Tradycyjny żurek z białą kiełbasą i jajkiem, podawany w wydrążonym bochenku chleba.",
      basePrice: 26.0,
      preparationTime: 15,
      calories: 420,
      protein: 22.0,
      carbs: 45.0,
      fat: 15.0,
      spiceLevel: 1,
    },
    {
      name: "Rosół babci",
      slug: "rosol-babci",
      categorySlug: "zupy",
      description:
        "Złocisty rosół z domowym makaronem, marchewką, pietruszką i koperkiem.",
      basePrice: 20.0,
      preparationTime: 10,
      calories: 250,
      protein: 15.0,
      carbs: 20.0,
      fat: 10.0,
      spiceLevel: 0,
    },
    {
      name: "Pierogi ruskie (12 szt.)",
      slug: "pierogi-ruskie",
      categorySlug: "dania-glowne",
      description:
        "Ręcznie lepione pierogi z nadzieniem z ziemniaków, twarogu i smażonej cebuli.",
      basePrice: 28.0,
      preparationTime: 20,
      calories: 580,
      protein: 18.0,
      carbs: 70.0,
      fat: 22.0,
      spiceLevel: 0,
      isVegetarian: true,
    },
    {
      name: "Pierogi z mięsem (12 szt.)",
      slug: "pierogi-z-miesem",
      categorySlug: "dania-glowne",
      description:
        "Pierogi z tradycyjnym farszem mięsnym z wieprzowiny i cebuli.",
      basePrice: 30.0,
      preparationTime: 20,
      calories: 640,
      protein: 28.0,
      carbs: 65.0,
      fat: 25.0,
      spiceLevel: 0,
    },
    {
      name: "Kotlet Schabowy",
      slug: "kotlet-schabowy",
      categorySlug: "dania-glowne",
      description:
        "Chrupiący kotlet schabowy panierowany, podawany z ziemniakami puree i surówką z kapusty.",
      basePrice: 34.0,
      preparationTime: 25,
      calories: 750,
      protein: 38.0,
      carbs: 55.0,
      fat: 32.0,
      spiceLevel: 0,
    },
    {
      name: "Bigos Staropolski",
      slug: "bigos-staropolski",
      categorySlug: "dania-glowne",
      description:
        "Tradycyjny bigos z kiszoną i świeżą kapustą, wieprzowiną, kiełbasą i grzybami. Dojrzewający 3 dni!",
      basePrice: 30.0,
      preparationTime: 15,
      calories: 450,
      protein: 25.0,
      carbs: 30.0,
      fat: 22.0,
      spiceLevel: 0,
    },
    {
      name: "Placki ziemniaczane",
      slug: "placki-ziemniaczane",
      categorySlug: "dania-glowne",
      description:
        "Złociste placki ziemniaczane podawane ze śmietaną i gulaszem wołowym.",
      basePrice: 26.0,
      preparationTime: 20,
      calories: 520,
      protein: 18.0,
      carbs: 50.0,
      fat: 25.0,
      spiceLevel: 0,
    },
    {
      name: "Gołąbki (3 szt.)",
      slug: "golabki",
      categorySlug: "dania-glowne",
      description: "Kapuściane gołąbki z mięsem i ryżem w sosie pomidorowym.",
      basePrice: 28.0,
      preparationTime: 20,
      calories: 520,
      protein: 22.0,
      carbs: 45.0,
      fat: 24.0,
      spiceLevel: 0,
    },
    {
      name: "Sernik Babci",
      slug: "sernik-babci",
      categorySlug: "desery",
      description:
        "Domowy sernik na kruchym cieście z rodzynkami i polewą czekoladową.",
      basePrice: 18.0,
      preparationTime: 5,
      calories: 380,
      protein: 10.0,
      carbs: 40.0,
      fat: 20.0,
      spiceLevel: 0,
      isVegetarian: true,
    },
    {
      name: "Kompot z jabłek",
      slug: "kompot-z-jablek",
      categorySlug: "napoje",
      description:
        "Domowy kompot z polskich jabłek z cynamonem. Podawany na ciepło lub zimno.",
      basePrice: 8.0,
      preparationTime: 2,
      calories: 80,
      protein: 0.0,
      carbs: 20.0,
      fat: 0.0,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
    },
  ];

  for (const mealData of spMeals) {
    const { categorySlug, ...rest } = mealData;
    const meal = await prisma.meal.create({
      data: {
        ...rest,
        restaurantId: smakPolski.id,
        categoryId: categories[categorySlug].id,
        approvalStatus: "APPROVED",
      },
    });

    await prisma.mealLocation.create({
      data: {
        mealId: meal.id,
        locationId: smakPolskiLocation.id,
        isAvailable: true,
      },
    });

    // Add addons for pierogi and main dishes
    if (mealData.slug.includes("pierogi")) {
      await prisma.mealAddon.createMany({
        data: [
          { mealId: meal.id, name: "Śmietana", price: 3.0 },
          { mealId: meal.id, name: "Masło ze skwarkami", price: 5.0 },
          { mealId: meal.id, name: "Cebulka smażona", price: 3.0 },
        ],
      });
    }
  }

  // ============================================
  // RESTAURANT 5: SPICY THAI
  // ============================================
  console.log("Creating restaurant: Spicy Thai...");

  const spicyThai = await prisma.restaurant.upsert({
    where: { slug: "spicy-thai" },
    update: {},
    create: {
      name: "Spicy Thai",
      slug: "spicy-thai",
      bio: "Autentyczne smaki Tajlandii w Warszawie! Aromatyczne curry, świeże pad thai i egzotyczne desery prosto z Bangkoku.",
      ownerId: owner.id,
      status: "APPROVED",
      isActive: true,
      cuisineTypes: { connect: [{ id: cuisineTypes["tajska"].id }] },
      tags: {
        connect: [{ id: tags["nowe"].id }, { id: tags["premium"].id }],
      },
    },
  });

  const spicyThaiLocation = await prisma.location.create({
    data: {
      restaurantId: spicyThai.id,
      name: "Spicy Thai - Praga",
      address: "ul. Targowa 56",
      city: "Warszawa",
      postalCode: "03-733",
      phone: "+48 22 500 60 70",
      deliveryRadius: 8,
      deliveryFee: 6.99,
      minOrderValue: 40.0,
      latitude: 52.2518,
      longitude: 21.0405,
      openingHours: defaultOpeningHours,
    },
  });

  const stMeals = [
    {
      name: "Sajgonki (4 szt.)",
      slug: "sajgonki",
      categorySlug: "przystawki",
      description:
        "Chrupiące sajgonki z nadzieniem z warzyw i makaronu ryżowego, podawane ze słodkim sosem chili.",
      basePrice: 20.0,
      preparationTime: 12,
      calories: 280,
      protein: 8.0,
      carbs: 30.0,
      fat: 14.0,
      spiceLevel: 1,
      isVegetarian: true,
      isVegan: true,
    },
    {
      name: "Tom Yum Goong",
      slug: "tom-yum-goong",
      categorySlug: "zupy",
      description:
        "Pikantna tajska zupa z krewetkami, trawą cytrynową, liśćmi limonki i galangalem.",
      basePrice: 28.0,
      preparationTime: 15,
      calories: 180,
      protein: 15.0,
      carbs: 12.0,
      fat: 8.0,
      spiceLevel: 5,
    },
    {
      name: "Pad Thai z Krewetkami",
      slug: "pad-thai-krewetki",
      categorySlug: "dania-glowne",
      description:
        "Klasyczny pad thai z makaronem ryżowym, krewetkami, orzeszkami ziemnymi, kiełkami fasoli i limonką.",
      basePrice: 38.0,
      preparationTime: 18,
      calories: 550,
      protein: 25.0,
      carbs: 60.0,
      fat: 20.0,
      spiceLevel: 2,
    },
    {
      name: "Zielone Curry z Kurczakiem",
      slug: "zielone-curry-kurczak",
      categorySlug: "dania-glowne",
      description:
        "Aromatyczne zielone curry z mlekiem kokosowym, kurczakiem, bambusem, bakłażanem i bazylią tajską. Podawane z ryżem jaśminowym.",
      basePrice: 36.0,
      preparationTime: 20,
      calories: 620,
      protein: 30.0,
      carbs: 50.0,
      fat: 28.0,
      spiceLevel: 4,
    },
    {
      name: "Massaman Curry Wołowe",
      slug: "massaman-curry-wolowe",
      categorySlug: "dania-glowne",
      description:
        "Łagodne, aromatyczne curry massaman z wołowiną, ziemniakami, orzeszkami i mlekiem kokosowym.",
      basePrice: 40.0,
      preparationTime: 25,
      calories: 680,
      protein: 32.0,
      carbs: 55.0,
      fat: 30.0,
      spiceLevel: 2,
    },
    {
      name: "Sticky Rice z Mango",
      slug: "sticky-rice-mango",
      categorySlug: "desery",
      description:
        "Tradycyjny tajski deser: kleisty ryż z mlekiem kokosowym i świeżym mango.",
      basePrice: 22.0,
      preparationTime: 5,
      calories: 350,
      protein: 5.0,
      carbs: 60.0,
      fat: 10.0,
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
    },
  ];

  for (const mealData of stMeals) {
    const { categorySlug, ...rest } = mealData;
    const meal = await prisma.meal.create({
      data: {
        ...rest,
        restaurantId: spicyThai.id,
        categoryId: categories[categorySlug].id,
        approvalStatus: "APPROVED",
      },
    });

    await prisma.mealLocation.create({
      data: {
        mealId: meal.id,
        locationId: spicyThaiLocation.id,
        isAvailable: true,
      },
    });

    // Addons for curry/main dishes
    if (categorySlug === "dania-glowne") {
      await prisma.mealAddon.createMany({
        data: [
          { mealId: meal.id, name: "Ryż jaśminowy extra", price: 5.0 },
          { mealId: meal.id, name: "Dodatkowe warzywa", price: 4.0 },
          { mealId: meal.id, name: "Poziom ostrości +1", price: 0.0 },
        ],
      });
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
