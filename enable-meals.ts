import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function enableAllMeals() {
  console.log("=== Włączanie dostępności wszystkich posiłków ===\n");

  const result = await prisma.meal.updateMany({
    where: {
      isAvailable: false,
    },
    data: {
      isAvailable: true,
    },
  });

  console.log(`✅ Zaktualizowano ${result.count} posiłków`);

  const allMeals = await prisma.meal.findMany({
    include: {
      restaurant: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  console.log("\n=== Wszystkie posiłki ===");
  allMeals.forEach((m) => {
    console.log(
      `- ${m.name} (${m.slug}) z ${m.restaurant.name}: isAvailable=${m.isAvailable}`,
    );
  });

  await prisma.$disconnect();
}

enableAllMeals().catch((e) => {
  console.error(e);
  process.exit(1);
});
