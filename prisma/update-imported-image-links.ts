import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RESTAURANT_LOGOS = [
  "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400",
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
  "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400",
  "https://images.unsplash.com/photo-1626776877886-7416488e7b21?w=400",
  "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
  "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
];

const RESTAURANT_COVERS = [
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200",
  "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1200",
  "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200",
  "https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=1200",
  "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=1200",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200",
];

const MEAL_IMAGES = [
  "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800",
  "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
  "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
  "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=800",
  "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800",
  "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
  "https://images.unsplash.com/photo-1476124369491-f01ca9f9e1f0?w=800",
  "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
  "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800",
  "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800",
  "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
];

function simpleHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

async function main() {
  const importedRestaurants = await prisma.restaurant.findMany({
    where: {
      bio: {
        contains: "Zaimportowane z OpenStreetMap",
      },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      meals: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });

  let updatedRestaurants = 0;
  let updatedMeals = 0;

  for (const restaurant of importedRestaurants) {
    const logoIndex =
      simpleHash(`${restaurant.slug}-logo`) % RESTAURANT_LOGOS.length;
    const coverIndex =
      simpleHash(`${restaurant.slug}-cover`) % RESTAURANT_COVERS.length;

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        logoUrl: RESTAURANT_LOGOS[logoIndex],
        coverImageUrl: RESTAURANT_COVERS[coverIndex],
      },
    });
    updatedRestaurants += 1;

    for (const meal of restaurant.meals) {
      const mealIndex =
        simpleHash(`${restaurant.slug}-${meal.slug}`) % MEAL_IMAGES.length;

      await prisma.meal.update({
        where: { id: meal.id },
        data: {
          imageUrl: MEAL_IMAGES[mealIndex],
        },
      });
      updatedMeals += 1;
    }
  }

  console.log(`[Images] Zaktualizowano restauracje: ${updatedRestaurants}`);
  console.log(`[Images] Zaktualizowano dania: ${updatedMeals}`);
}

main()
  .catch((error) => {
    console.error("[Images] Blad:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
