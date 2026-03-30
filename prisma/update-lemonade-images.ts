import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const lemonadeImages = [
  "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=900",
  "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=900",
  "https://images.unsplash.com/photo-1556881286-fc6915169721?w=900",
  "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=900",
  "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900",
  "https://images.unsplash.com/photo-1462887749044-b47cb05b83b8?w=900",
];

async function main() {
  const rows = await db.meal.findMany({
    where: {
      OR: [
        { name: { contains: "lemon", mode: "insensitive" } },
        { name: { contains: "lemoniada", mode: "insensitive" } },
        { slug: { contains: "lemon", mode: "insensitive" } },
        { slug: { contains: "lemoniada", mode: "insensitive" } },
      ],
    },
    select: { id: true, slug: true, name: true },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });

  let updated = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const meal = rows[i];
    const base = lemonadeImages[i % lemonadeImages.length];
    const imageUrl = `${base}&sig=${i + 1}`;

    await db.meal.update({
      where: { id: meal.id },
      data: { imageUrl },
    });

    updated += 1;
  }

  console.log(JSON.stringify({ found: rows.length, updated }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
