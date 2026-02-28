import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Unsplash free images for dishes
const mealImages: Record<string, string> = {
  // Bella Italia
  "bruschetta-classica":
    "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800",
  "zupa-minestrone":
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
  "pizza-margherita":
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
  "pizza-pepperoni":
    "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
  "pizza-quattro-formaggi":
    "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=800",
  "spaghetti-carbonara":
    "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800",
  "penne-arrabbiata":
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
  "risotto-ai-funghi":
    "https://images.unsplash.com/photo-1476124369491-f01ca9f9e1f0?w=800",
  tiramisu:
    "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
  "panna-cotta":
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",

  // Sushi Master
  edamame: "https://images.unsplash.com/photo-1606850780554-b55db2026261?w=800",
  "zupa-miso":
    "https://images.unsplash.com/photo-1605031396520-d5c97113bdb8?w=800",
  "nigiri-losos":
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
  "nigiri-tunczyk":
    "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=800",
  "california-roll":
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
  "dragon-roll":
    "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800",
  "spicy-tuna-roll":
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
  "ramen-tonkotsu":
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
  "mochi-lodowe":
    "https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=800",

  // Burger House
  "nachos-z-serem":
    "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=800",
  "classic-burger":
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  "bacon-smash-burger":
    "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800",
  "bbq-pulled-pork-burger":
    "https://images.unsplash.com/photo-1572448862527-d3c904757de6?w=800",
  "veggie-burger":
    "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800",
  "hot-chicken-burger":
    "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800",
  "frytki-belgijskie":
    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800",
  "salatka-cezar-bh":
    "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800",
  "brownie-z-lodami":
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",
  milkshake:
    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800",

  // Smak Polski
  "zurek-w-chlebku":
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
  "rosol-babci":
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
  "pierogi-ruskie":
    "https://images.unsplash.com/photo-1626776877886-7416488e7b21?w=800",
  "pierogi-z-miesem":
    "https://images.unsplash.com/photo-1626776877886-7416488e7b21?w=800",
  "kotlet-schabowy":
    "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800",
  "bigos-staropolski":
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
  "placki-ziemniaczane":
    "https://images.unsplash.com/photo-1626776877886-7416488e7b21?w=800",
  golabki: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
  "sernik-babci":
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800",
  "kompot-z-jablek":
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800",

  // Spicy Thai
  sajgonki:
    "https://images.unsplash.com/photo-1587573089615-5c6773c96846?w=800",
  "tom-yum-goong":
    "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800",
  "pad-thai-krewetki":
    "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
  "zielone-curry-kurczak":
    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800",
  "massaman-curry-wolowe":
    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800",
  "sticky-rice-mango":
    "https://images.unsplash.com/photo-1587374093020-4784e854e8e0?w=800",
};

async function updateMealImages() {
  console.log("Starting meal images update...");

  let updated = 0;
  let notFound = 0;

  for (const [slug, imageUrl] of Object.entries(mealImages)) {
    try {
      const meal = await prisma.meal.findFirst({
        where: { slug },
      });

      if (meal) {
        await prisma.meal.update({
          where: { id: meal.id },
          data: { imageUrl },
        });
        console.log(`✓ Updated image for: ${slug}`);
        updated++;
      } else {
        console.log(`✗ Meal not found: ${slug}`);
        notFound++;
      }
    } catch (error) {
      console.error(`Error updating ${slug}:`, error);
    }
  }

  console.log(`\n✅ Update complete!`);
  console.log(`   Updated: ${updated} meals`);
  console.log(`   Not found: ${notFound} meals`);
}

updateMealImages()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
