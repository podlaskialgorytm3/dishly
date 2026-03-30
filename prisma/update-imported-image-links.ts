import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function simpleHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const IMAGE_POOLS = {
  pizza: [
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200",
    "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=1200",
    "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200",
  ],
  burger: [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200",
    "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=1200",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200",
    "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=1200",
  ],
  sushi: [
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200",
    "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=1200",
    "https://images.unsplash.com/photo-1563612116625-3012372fccce?w=1200",
  ],
  polish: [
    "https://images.unsplash.com/photo-1626776877886-7416488e7b21?w=1200",
    "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=1200",
  ],
  thai: [
    "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200",
    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200",
  ],
  turkish: [
    "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=1200",
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200",
  ],
  mexican: [
    "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=1200",
    "https://images.unsplash.com/photo-1604467715878-83e57e8bc129?w=1200",
  ],
  indian: [
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200",
    "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=1200",
  ],
  vegan: [
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200",
  ],
  dessert: [
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200",
    "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=1200",
  ],
  drink: [
    "https://images.unsplash.com/photo-1551024709-8f23befc6cf7?w=1200",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=1200",
  ],
  generic: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200",
  ],
};

function primaryCuisineSlug(cuisineSlugs: string[]): string {
  if (cuisineSlugs.length === 0) {
    return "europejska";
  }
  return cuisineSlugs[0] ?? "europejska";
}

function pickFromPool(seed: string, pool: string[]): string {
  const index = simpleHash(seed) % pool.length;
  return pool[index] ?? IMAGE_POOLS.generic[0];
}

function detectTheme(
  restaurantName: string,
  cuisineSlug: string,
): "pizza" | "fastfood" | "other" {
  const normalizedName = restaurantName.toLowerCase();
  if (
    cuisineSlug === "wloska" ||
    normalizedName.includes("pizza") ||
    normalizedName.includes("pizzeria")
  ) {
    return "pizza";
  }

  if (
    cuisineSlug === "amerykanska" ||
    normalizedName.includes("burger") ||
    normalizedName.includes("fast") ||
    normalizedName.includes("kfc") ||
    normalizedName.includes("mcdonald")
  ) {
    return "fastfood";
  }

  return "other";
}

function cuisinePool(cuisineSlug: string): string[] {
  if (cuisineSlug === "japonska" || cuisineSlug === "azjatycka") {
    return IMAGE_POOLS.sushi;
  }
  if (cuisineSlug === "polska") {
    return IMAGE_POOLS.polish;
  }
  if (cuisineSlug === "tajska") {
    return IMAGE_POOLS.thai;
  }
  if (cuisineSlug === "turecka") {
    return IMAGE_POOLS.turkish;
  }
  if (cuisineSlug === "meksykanska") {
    return IMAGE_POOLS.mexican;
  }
  if (cuisineSlug === "indyjska") {
    return IMAGE_POOLS.indian;
  }
  if (cuisineSlug === "weganska") {
    return IMAGE_POOLS.vegan;
  }
  return IMAGE_POOLS.generic;
}

function restaurantLogoUrl(
  restaurantName: string,
  restaurantSlug: string,
  cuisineSlug: string,
): string {
  const theme = detectTheme(restaurantName, cuisineSlug);
  if (theme === "pizza") {
    return pickFromPool(`${restaurantSlug}-logo-pizza`, IMAGE_POOLS.pizza);
  }
  if (theme === "fastfood") {
    return pickFromPool(`${restaurantSlug}-logo-burger`, IMAGE_POOLS.burger);
  }

  return pickFromPool(
    `${restaurantSlug}-logo-${cuisineSlug}`,
    cuisinePool(cuisineSlug),
  );
}

function restaurantCoverUrl(
  restaurantName: string,
  restaurantSlug: string,
  cuisineSlug: string,
): string {
  const theme = detectTheme(restaurantName, cuisineSlug);
  if (theme === "pizza") {
    return pickFromPool(`${restaurantSlug}-cover-pizza`, IMAGE_POOLS.pizza);
  }
  if (theme === "fastfood") {
    return pickFromPool(`${restaurantSlug}-cover-burger`, IMAGE_POOLS.burger);
  }

  return pickFromPool(
    `${restaurantSlug}-cover-${cuisineSlug}`,
    cuisinePool(cuisineSlug),
  );
}

function mealImageUrl(
  restaurantName: string,
  restaurantSlug: string,
  mealSlug: string,
  mealId: string,
  cuisineSlug: string,
): string {
  const theme = detectTheme(restaurantName, cuisineSlug);

  if (mealSlug === "sweet-dessert") {
    return pickFromPool(
      `${restaurantSlug}-${mealId}-dessert`,
      IMAGE_POOLS.dessert,
    );
  }
  if (mealSlug === "fresh-lemonade") {
    return pickFromPool(`${restaurantSlug}-${mealId}-drink`, IMAGE_POOLS.drink);
  }
  if (theme === "pizza") {
    return pickFromPool(`${restaurantSlug}-${mealId}-pizza`, IMAGE_POOLS.pizza);
  }
  if (theme === "fastfood") {
    return pickFromPool(
      `${restaurantSlug}-${mealId}-burger`,
      IMAGE_POOLS.burger,
    );
  }

  return pickFromPool(
    `${restaurantSlug}-${mealSlug}-${mealId}-${cuisineSlug}`,
    cuisinePool(cuisineSlug),
  );
}

type NutritionProfile = {
  caloriesMin: number;
  caloriesMax: number;
  proteinMin: number;
  proteinMax: number;
  carbsMin: number;
  carbsMax: number;
  fatMin: number;
  fatMax: number;
  weightMin: number;
  weightMax: number;
};

const NUTRITION_BY_SLUG: Record<string, NutritionProfile> = {
  starter: {
    caloriesMin: 220,
    caloriesMax: 360,
    proteinMin: 7,
    proteinMax: 16,
    carbsMin: 12,
    carbsMax: 34,
    fatMin: 8,
    fatMax: 20,
    weightMin: 150,
    weightMax: 280,
  },
  soup: {
    caloriesMin: 140,
    caloriesMax: 280,
    proteinMin: 5,
    proteinMax: 14,
    carbsMin: 10,
    carbsMax: 28,
    fatMin: 4,
    fatMax: 12,
    weightMin: 250,
    weightMax: 420,
  },
  "chef-special": {
    caloriesMin: 540,
    caloriesMax: 860,
    proteinMin: 20,
    proteinMax: 42,
    carbsMin: 35,
    carbsMax: 75,
    fatMin: 18,
    fatMax: 38,
    weightMin: 360,
    weightMax: 620,
  },
  "house-pasta": {
    caloriesMin: 520,
    caloriesMax: 780,
    proteinMin: 16,
    proteinMax: 30,
    carbsMin: 58,
    carbsMax: 95,
    fatMin: 10,
    fatMax: 24,
    weightMin: 320,
    weightMax: 520,
  },
  "garden-salad": {
    caloriesMin: 180,
    caloriesMax: 360,
    proteinMin: 6,
    proteinMax: 20,
    carbsMin: 10,
    carbsMax: 28,
    fatMin: 8,
    fatMax: 20,
    weightMin: 220,
    weightMax: 380,
  },
  "signature-bowl": {
    caloriesMin: 460,
    caloriesMax: 760,
    proteinMin: 18,
    proteinMax: 36,
    carbsMin: 44,
    carbsMax: 88,
    fatMin: 10,
    fatMax: 28,
    weightMin: 340,
    weightMax: 560,
  },
  "lunch-set": {
    caloriesMin: 430,
    caloriesMax: 690,
    proteinMin: 16,
    proteinMax: 34,
    carbsMin: 38,
    carbsMax: 78,
    fatMin: 10,
    fatMax: 26,
    weightMin: 300,
    weightMax: 520,
  },
  "sweet-dessert": {
    caloriesMin: 300,
    caloriesMax: 520,
    proteinMin: 3,
    proteinMax: 10,
    carbsMin: 34,
    carbsMax: 70,
    fatMin: 10,
    fatMax: 24,
    weightMin: 140,
    weightMax: 260,
  },
  "fresh-lemonade": {
    caloriesMin: 90,
    caloriesMax: 210,
    proteinMin: 0,
    proteinMax: 2,
    carbsMin: 16,
    carbsMax: 44,
    fatMin: 0,
    fatMax: 1,
    weightMin: 250,
    weightMax: 450,
  },
  "daily-combo": {
    caloriesMin: 620,
    caloriesMax: 980,
    proteinMin: 24,
    proteinMax: 48,
    carbsMin: 62,
    carbsMax: 112,
    fatMin: 20,
    fatMax: 42,
    weightMin: 420,
    weightMax: 720,
  },
};

function pickInRange(min: number, max: number, seed: string): number {
  const h = simpleHash(seed);
  return min + (h % (max - min + 1));
}

function rounded2(value: number): number {
  return Math.round(value * 100) / 100;
}

function nutritionForMeal(slug: string, seed: string) {
  const profile = NUTRITION_BY_SLUG[slug] ?? NUTRITION_BY_SLUG["chef-special"];

  const calories = pickInRange(
    profile.caloriesMin,
    profile.caloriesMax,
    `${seed}-cal`,
  );
  const protein = rounded2(
    pickInRange(
      profile.proteinMin * 100,
      profile.proteinMax * 100,
      `${seed}-pro`,
    ) / 100,
  );
  const carbs = rounded2(
    pickInRange(
      profile.carbsMin * 100,
      profile.carbsMax * 100,
      `${seed}-carb`,
    ) / 100,
  );
  const fat = rounded2(
    pickInRange(profile.fatMin * 100, profile.fatMax * 100, `${seed}-fat`) /
      100,
  );
  const weight = pickInRange(profile.weightMin, profile.weightMax, `${seed}-w`);

  const isVegan = slug === "fresh-lemonade" || slug === "garden-salad";
  const isVegetarian = isVegan || slug === "sweet-dessert" || slug === "soup";

  return {
    calories,
    protein,
    carbs,
    fat,
    weight,
    isVegan,
    isVegetarian,
  };
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
      cuisineTypes: {
        select: {
          slug: true,
        },
      },
      meals: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  });

  let updatedRestaurants = 0;
  let updatedMeals = 0;

  for (const restaurant of importedRestaurants) {
    const cuisineSlug = primaryCuisineSlug(
      restaurant.cuisineTypes.map((cuisine) => cuisine.slug),
    );
    const logoUrl = restaurantLogoUrl(
      restaurant.name,
      restaurant.slug,
      cuisineSlug,
    );
    const coverImageUrl = restaurantCoverUrl(
      restaurant.name,
      restaurant.slug,
      cuisineSlug,
    );

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        logoUrl,
        coverImageUrl,
      },
    });
    updatedRestaurants += 1;

    for (const meal of restaurant.meals) {
      const imageUrl = mealImageUrl(
        restaurant.name,
        restaurant.slug,
        meal.slug,
        meal.id,
        cuisineSlug,
      );
      const nutrition = nutritionForMeal(
        meal.slug,
        `${restaurant.slug}-${meal.slug}-${meal.name}`,
      );

      await prisma.meal.update({
        where: { id: meal.id },
        data: {
          imageUrl,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          weight: nutrition.weight,
          isVegan: nutrition.isVegan,
          isVegetarian: nutrition.isVegetarian,
          isGlutenFree: false,
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
