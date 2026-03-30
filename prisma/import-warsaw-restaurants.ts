import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const RESTAURANT_LIMIT = 100;

const DEFAULT_OPENING_HOURS = {
  monday: { open: "10:00", close: "22:00", closed: false },
  tuesday: { open: "10:00", close: "22:00", closed: false },
  wednesday: { open: "10:00", close: "22:00", closed: false },
  thursday: { open: "10:00", close: "22:00", closed: false },
  friday: { open: "10:00", close: "23:00", closed: false },
  saturday: { open: "11:00", close: "23:00", closed: false },
  sunday: { open: "12:00", close: "21:00", closed: false },
};

const CUISINE_SEEDS = [
  { name: "Kuchnia Polska", slug: "polska" },
  { name: "Kuchnia Wloska", slug: "wloska" },
  { name: "Kuchnia Japonska", slug: "japonska" },
  { name: "Kuchnia Meksykanska", slug: "meksykanska" },
  { name: "Kuchnia Indyjska", slug: "indyjska" },
  { name: "Kuchnia Amerykanska", slug: "amerykanska" },
  { name: "Kuchnia Tajska", slug: "tajska" },
  { name: "Kuchnia Turecka", slug: "turecka" },
  { name: "Kuchnia Azjatycka", slug: "azjatycka" },
  { name: "Kuchnia Weganska", slug: "weganska" },
  { name: "Kuchnia Europejska", slug: "europejska" },
];

const TAG_SEEDS = [
  { name: "Darmowa dostawa", slug: "darmowa-dostawa" },
  { name: "Szybka dostawa", slug: "szybka-dostawa" },
  { name: "Wegetarianskie", slug: "wegetarianskie" },
  { name: "Weganskie", slug: "weganskie" },
  { name: "Bezglutenowe", slug: "bezglutenowe" },
  { name: "Popularne", slug: "popularne" },
  { name: "Nowe", slug: "nowe" },
  { name: "Premium", slug: "premium" },
];

const CATEGORY_SEEDS = [
  { name: "Przystawki", slug: "przystawki", sortOrder: 1 },
  { name: "Zupy", slug: "zupy", sortOrder: 2 },
  { name: "Dania glowne", slug: "dania-glowne", sortOrder: 3 },
  { name: "Pizza", slug: "pizza", sortOrder: 4 },
  { name: "Burgery", slug: "burgery", sortOrder: 5 },
  { name: "Sushi", slug: "sushi", sortOrder: 6 },
  { name: "Makarony", slug: "makarony", sortOrder: 7 },
  { name: "Salatki", slug: "salatki", sortOrder: 8 },
  { name: "Desery", slug: "desery", sortOrder: 9 },
  { name: "Napoje", slug: "napoje", sortOrder: 10 },
];

type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OsmResponse = {
  elements: OsmElement[];
};

type ImportedRestaurant = {
  sourceId: string;
  name: string;
  city: string;
  address: string;
  postalCode: string;
  phone: string;
  cuisineSlug: string;
  tagSlugs: string[];
  latitude: number | null;
  longitude: number | null;
  popularityScore: number;
};

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 55);
}

function emailLocalPart(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

function parseAddress(tags: Record<string, string>): string {
  const street = tags["addr:street"] ?? tags["street"] ?? "";
  const housenumber = tags["addr:housenumber"] ?? "";
  const full = `${street} ${housenumber}`.trim();
  return full || tags["addr:full"] || "Adres nieznany";
}

function cuisineFromTags(tags: Record<string, string>): string {
  const c = (tags.cuisine ?? "").toLowerCase();

  if (c.includes("italian") || c.includes("pizza")) return "wloska";
  if (c.includes("japanese") || c.includes("sushi")) return "japonska";
  if (c.includes("mexican")) return "meksykanska";
  if (c.includes("indian")) return "indyjska";
  if (c.includes("thai")) return "tajska";
  if (c.includes("turkish") || c.includes("kebab")) return "turecka";
  if (c.includes("burger") || c.includes("american")) return "amerykanska";
  if (c.includes("vegan")) return "weganska";
  if (c.includes("polish")) return "polska";
  if (
    c.includes("asian") ||
    c.includes("chinese") ||
    c.includes("vietnamese")
  ) {
    return "azjatycka";
  }
  return "europejska";
}

function tagsFromMetadata(
  tags: Record<string, string>,
  score: number,
): string[] {
  const result = new Set<string>();

  if (tags.delivery === "yes") result.add("szybka-dostawa");
  if (tags["diet:vegan"] === "yes") result.add("weganskie");
  if (tags["diet:vegetarian"] === "yes") result.add("wegetarianskie");
  if (tags["diet:gluten_free"] === "yes") result.add("bezglutenowe");
  if (score >= 4) result.add("popularne");
  if (score >= 6) result.add("premium");

  if (result.size === 0) result.add("nowe");

  return [...result];
}

function popularityScore(tags: Record<string, string>): number {
  let score = 0;

  if (tags.website) score += 2;
  if (tags.phone || tags["contact:phone"]) score += 2;
  if (tags.opening_hours) score += 1;
  if (tags.cuisine) score += 1;
  if (tags.delivery === "yes") score += 1;
  if (tags.takeaway === "yes") score += 1;
  if (tags["brand:wikidata"]) score += 2;

  return score;
}

function uniqueLocalPart(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let idx = 2;
  while (used.has(`${base}_${idx}`)) {
    idx += 1;
  }

  const withSuffix = `${base}_${idx}`;
  used.add(withSuffix);
  return withSuffix;
}

function mealTemplates(restaurantName: string) {
  return [
    {
      name: `Starter ${restaurantName}`,
      slug: "starter",
      category: "przystawki",
      basePrice: 18,
      prep: 10,
    },
    {
      name: `Soup ${restaurantName}`,
      slug: "soup",
      category: "zupy",
      basePrice: 16,
      prep: 12,
    },
    {
      name: `Chef Special ${restaurantName}`,
      slug: "chef-special",
      category: "dania-glowne",
      basePrice: 34,
      prep: 25,
    },
    {
      name: `House Pasta ${restaurantName}`,
      slug: "house-pasta",
      category: "makarony",
      basePrice: 31,
      prep: 20,
    },
    {
      name: `Garden Salad ${restaurantName}`,
      slug: "garden-salad",
      category: "salatki",
      basePrice: 22,
      prep: 8,
    },
    {
      name: `Signature Bowl ${restaurantName}`,
      slug: "signature-bowl",
      category: "dania-glowne",
      basePrice: 36,
      prep: 22,
    },
    {
      name: `Lunch Set ${restaurantName}`,
      slug: "lunch-set",
      category: "dania-glowne",
      basePrice: 29,
      prep: 18,
    },
    {
      name: `Sweet Dessert ${restaurantName}`,
      slug: "sweet-dessert",
      category: "desery",
      basePrice: 17,
      prep: 7,
    },
    {
      name: `Fresh Lemonade ${restaurantName}`,
      slug: "fresh-lemonade",
      category: "napoje",
      basePrice: 11,
      prep: 4,
    },
    {
      name: `Daily Combo ${restaurantName}`,
      slug: "daily-combo",
      category: "dania-glowne",
      basePrice: 39,
      prep: 24,
    },
  ];
}

async function fetchWarsawRestaurants(): Promise<ImportedRestaurant[]> {
  const query = `
[out:json][timeout:180];
area["name"="Warszawa"]["boundary"="administrative"]->.searchArea;
(
  node["amenity"="restaurant"](area.searchArea);
  way["amenity"="restaurant"](area.searchArea);
  relation["amenity"="restaurant"](area.searchArea);
);
out center tags;
`;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: new URLSearchParams({ data: query }),
  });

  if (!response.ok) {
    throw new Error(
      `Overpass request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as OsmResponse;

  const mapped = data.elements
    .map((element): ImportedRestaurant | null => {
      const tags = element.tags ?? {};
      const name = tags.name?.trim();
      if (!name) return null;

      const lat = element.lat ?? element.center?.lat ?? null;
      const lon = element.lon ?? element.center?.lon ?? null;
      const score = popularityScore(tags);

      return {
        sourceId: `${element.type}/${element.id}`,
        name,
        city: tags["addr:city"] ?? "Warszawa",
        address: parseAddress(tags),
        postalCode: tags["addr:postcode"] ?? "",
        phone: tags.phone ?? tags["contact:phone"] ?? "",
        cuisineSlug: cuisineFromTags(tags),
        tagSlugs: tagsFromMetadata(tags, score),
        latitude: lat,
        longitude: lon,
        popularityScore: score,
      };
    })
    .filter((x): x is ImportedRestaurant => x !== null);

  // Prefer entries with richer metadata; this is a practical popularity proxy in OSM.
  const uniqueByNameAddress = new Map<string, ImportedRestaurant>();
  for (const r of mapped) {
    const key = `${r.name.toLowerCase()}|${r.address.toLowerCase()}`;
    const prev = uniqueByNameAddress.get(key);
    if (!prev || r.popularityScore > prev.popularityScore) {
      uniqueByNameAddress.set(key, r);
    }
  }

  return [...uniqueByNameAddress.values()]
    .sort(
      (a, b) =>
        b.popularityScore - a.popularityScore || a.name.localeCompare(b.name),
    )
    .slice(0, RESTAURANT_LIMIT);
}

async function ensureDictionaries() {
  const cuisineMap = new Map<string, string>();
  const tagMap = new Map<string, string>();
  const categoryMap = new Map<string, string>();

  for (const c of CUISINE_SEEDS) {
    const record = await prisma.cuisineType.upsert({
      where: { slug: c.slug },
      update: { isActive: true },
      create: c,
      select: { id: true, slug: true },
    });
    cuisineMap.set(record.slug, record.id);
  }

  for (const t of TAG_SEEDS) {
    const record = await prisma.restaurantTag.upsert({
      where: { slug: t.slug },
      update: { isActive: true },
      create: t,
      select: { id: true, slug: true },
    });
    tagMap.set(record.slug, record.id);
  }

  for (const c of CATEGORY_SEEDS) {
    const record = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: c,
      select: { id: true, slug: true },
    });
    categoryMap.set(record.slug, record.id);
  }

  return { cuisineMap, tagMap, categoryMap };
}

async function upsertOneRestaurant(
  imported: ImportedRestaurant,
  index: number,
  usedEmails: Set<string>,
  dictionaries: Awaited<ReturnType<typeof ensureDictionaries>>,
) {
  const shortId = imported.sourceId.replace("/", "-");
  const restaurantSlug =
    `${slugify(imported.name) || "restauracja"}-${shortId}`.slice(0, 80);

  const localBase =
    emailLocalPart(slugify(imported.name).replace(/-/g, "_")) ||
    `restauracja_${index + 1}`;
  const localPart = uniqueLocalPart(localBase, usedEmails);
  const ownerEmail = `${localPart}@dishly.com`;
  const ownerPasswordRaw = localPart;
  const passwordHash = await hash(ownerPasswordRaw, 12);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      passwordHash,
      role: "OWNER",
      isApproved: true,
      isActive: true,
      firstName: imported.name.slice(0, 40),
      lastName: "Owner",
      phone: imported.phone || undefined,
    },
    create: {
      email: ownerEmail,
      passwordHash,
      role: "OWNER",
      isApproved: true,
      isActive: true,
      firstName: imported.name.slice(0, 40),
      lastName: "Owner",
      phone: imported.phone || undefined,
    },
    select: { id: true },
  });

  const cuisineId =
    dictionaries.cuisineMap.get(imported.cuisineSlug) ??
    dictionaries.cuisineMap.get("europejska");

  const tagIds = imported.tagSlugs
    .map((slug) => dictionaries.tagMap.get(slug))
    .filter((id): id is string => Boolean(id));

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: restaurantSlug },
    update: {
      name: imported.name,
      ownerId: owner.id,
      status: "APPROVED",
      isActive: true,
      bio: `Zaimportowane z OpenStreetMap (${imported.sourceId}).`,
      cuisineTypes: cuisineId ? { set: [{ id: cuisineId }] } : undefined,
      tags:
        tagIds.length > 0 ? { set: tagIds.map((id) => ({ id })) } : undefined,
    },
    create: {
      name: imported.name,
      slug: restaurantSlug,
      ownerId: owner.id,
      status: "APPROVED",
      isActive: true,
      bio: `Zaimportowane z OpenStreetMap (${imported.sourceId}).`,
      cuisineTypes: cuisineId ? { connect: [{ id: cuisineId }] } : undefined,
      tags:
        tagIds.length > 0
          ? { connect: tagIds.map((id) => ({ id })) }
          : undefined,
    },
    select: { id: true, name: true },
  });

  const existingLocation = await prisma.location.findFirst({
    where: { restaurantId: restaurant.id },
    select: { id: true },
  });

  const location = existingLocation
    ? await prisma.location.update({
        where: { id: existingLocation.id },
        data: {
          name: `${imported.name} - Warszawa`,
          address: imported.address,
          city: imported.city || "Warszawa",
          postalCode: imported.postalCode,
          phone: imported.phone || "+48 000 000 000",
          deliveryRadius: 6,
          deliveryFee: 6.99,
          minOrderValue: 30,
          latitude: imported.latitude,
          longitude: imported.longitude,
          openingHours: DEFAULT_OPENING_HOURS,
          isActive: true,
        },
        select: { id: true },
      })
    : await prisma.location.create({
        data: {
          restaurantId: restaurant.id,
          name: `${imported.name} - Warszawa`,
          address: imported.address,
          city: imported.city || "Warszawa",
          postalCode: imported.postalCode,
          phone: imported.phone || "+48 000 000 000",
          deliveryRadius: 6,
          deliveryFee: 6.99,
          minOrderValue: 30,
          latitude: imported.latitude,
          longitude: imported.longitude,
          openingHours: DEFAULT_OPENING_HOURS,
          isActive: true,
        },
        select: { id: true },
      });

  const meals = mealTemplates(imported.name);
  for (const meal of meals) {
    const categoryId = dictionaries.categoryMap.get(meal.category);
    if (!categoryId) continue;

    const mealRecord = await prisma.meal.upsert({
      where: {
        restaurantId_slug: {
          restaurantId: restaurant.id,
          slug: meal.slug,
        },
      },
      update: {
        name: meal.name,
        description: `Danie przygotowane dla restauracji ${imported.name}.`,
        basePrice: meal.basePrice,
        preparationTime: meal.prep,
        isAvailable: true,
        approvalStatus: "APPROVED",
        categoryId,
      },
      create: {
        restaurantId: restaurant.id,
        categoryId,
        name: meal.name,
        slug: meal.slug,
        description: `Danie przygotowane dla restauracji ${imported.name}.`,
        basePrice: meal.basePrice,
        preparationTime: meal.prep,
        spiceLevel: 1,
        isAvailable: true,
        approvalStatus: "APPROVED",
      },
      select: { id: true },
    });

    await prisma.mealLocation.upsert({
      where: {
        mealId_locationId: {
          mealId: mealRecord.id,
          locationId: location.id,
        },
      },
      update: { isAvailable: true },
      create: {
        mealId: mealRecord.id,
        locationId: location.id,
        isAvailable: true,
      },
    });
  }

  return {
    restaurantName: restaurant.name,
    ownerEmail,
    ownerPasswordRaw,
  };
}

async function main() {
  console.log("[Import] Pobieram restauracje z OpenStreetMap (Overpass)...");
  const imported = await fetchWarsawRestaurants();

  if (imported.length < RESTAURANT_LIMIT) {
    console.warn(
      `[Import] Ostrzezenie: pobrano ${imported.length} rekordow, mniej niz ${RESTAURANT_LIMIT}.`,
    );
  }

  console.log(`[Import] Wybrane rekordy: ${imported.length}`);

  const dictionaries = await ensureDictionaries();
  const usedEmails = new Set<string>();
  const credentials: Array<{
    restaurantName: string;
    ownerEmail: string;
    ownerPasswordRaw: string;
  }> = [];

  for (let i = 0; i < imported.length; i += 1) {
    const r = imported[i];
    const result = await upsertOneRestaurant(r, i, usedEmails, dictionaries);
    credentials.push(result);

    if ((i + 1) % 10 === 0) {
      console.log(`[Import] Przetworzono ${i + 1}/${imported.length}`);
    }
  }

  console.log("\n[Import] Zakonczono.");
  console.log(`[Import] Restauracje: ${credentials.length}`);
  console.log("[Import] Przykladowe konta owner (pierwsze 10):");

  for (const row of credentials.slice(0, 10)) {
    console.log(
      `- ${row.restaurantName}: ${row.ownerEmail} / ${row.ownerPasswordRaw}`,
    );
  }
}

main()
  .catch((error) => {
    console.error("[Import] Blad:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
