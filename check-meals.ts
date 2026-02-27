import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkMeals() {
  console.log("=== Sprawdzanie restauracji ===");
  const restaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      isActive: true,
      _count: {
        select: { meals: true },
      },
    },
  });

  console.log(`Znaleziono ${restaurants.length} restauracji:\n`);
  restaurants.forEach((r) => {
    console.log(
      `- ${r.name} (${r.slug}): status=${r.status}, isActive=${r.isActive}, posiłków=${r._count.meals}`,
    );
  });

  console.log("\n=== Sprawdzanie posiłków ===");
  const meals = await prisma.meal.findMany({
    include: {
      restaurant: {
        select: {
          name: true,
          slug: true,
          status: true,
          isActive: true,
        },
      },
    },
  });

  console.log(`Znaleziono ${meals.length} posiłków:\n`);
  meals.forEach((m) => {
    console.log(
      `- ${m.name} (${m.slug}) z ${m.restaurant.name}: isAvailable=${m.isAvailable}, restauracja: status=${m.restaurant.status}, isActive=${m.restaurant.isActive}`,
    );
  });

  console.log("\n=== Posiłki spełniające warunki wyświetlania ===");
  const visibleMeals = await prisma.meal.findMany({
    where: {
      isAvailable: true,
      restaurant: {
        isActive: true,
        status: "APPROVED",
      },
    },
    include: {
      restaurant: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  console.log(`Znaleziono ${visibleMeals.length} posiłków do wyświetlenia:\n`);
  visibleMeals.forEach((m) => {
    console.log(`- ${m.name} (${m.slug}) z ${m.restaurant.name}`);
  });

  if (visibleMeals.length === 0) {
    console.log("\n⚠️  BRAK POSIŁKÓW DO WYŚWIETLENIA!");
    console.log("Aby posiłki były widoczne, muszą być spełnione warunki:");
    console.log("1. Posiłek: isAvailable = true");
    console.log('2. Restauracja: status = "APPROVED"');
    console.log("3. Restauracja: isActive = true");
  }

  await prisma.$disconnect();
}

checkMeals().catch((e) => {
  console.error(e);
  process.exit(1);
});
