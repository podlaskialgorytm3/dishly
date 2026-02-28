import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Unsplash free images for restaurants
const restaurantImages: Record<
  string,
  { logoUrl: string; coverImageUrl: string }
> = {
  "bella-italia": {
    logoUrl:
      "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400",
    coverImageUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200",
  },
  "sushi-master": {
    logoUrl:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
    coverImageUrl:
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1200",
  },
  "burger-house": {
    logoUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400",
    coverImageUrl:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200",
  },
  "smak-polski": {
    logoUrl:
      "https://images.unsplash.com/photo-1626776877886-7416488e7b21?w=400",
    coverImageUrl:
      "https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=1200",
  },
  "spicy-thai": {
    logoUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400",
    coverImageUrl:
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=1200",
  },
};

async function updateRestaurantImages() {
  console.log("Starting restaurant images update...");

  let updated = 0;
  let notFound = 0;

  for (const [slug, images] of Object.entries(restaurantImages)) {
    try {
      const restaurant = await prisma.restaurant.findFirst({
        where: { slug },
      });

      if (restaurant) {
        await prisma.restaurant.update({
          where: { id: restaurant.id },
          data: {
            logoUrl: images.logoUrl,
            coverImageUrl: images.coverImageUrl,
          },
        });
        console.log(`✓ Updated images for restaurant: ${slug}`);
        updated++;
      } else {
        console.log(`✗ Restaurant not found: ${slug}`);
        notFound++;
      }
    } catch (error) {
      console.error(`Error updating ${slug}:`, error);
    }
  }

  console.log(`\n✅ Update complete!`);
  console.log(`   Updated: ${updated} restaurants`);
  console.log(`   Not found: ${notFound} restaurants`);
}

updateRestaurantImages()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
