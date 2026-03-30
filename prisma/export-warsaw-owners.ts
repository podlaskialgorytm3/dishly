import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.restaurant.findMany({
    where: {
      bio: {
        contains: "Zaimportowane z OpenStreetMap",
      },
    },
    select: {
      name: true,
      owner: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const header = "restaurant_name,owner_email,owner_password";
  const lines = rows.map((row) => {
    const email = row.owner.email;
    const password = email.split("@")[0];
    const safeName = `"${row.name.replaceAll('"', '""')}"`;
    return `${safeName},${email},${password}`;
  });

  writeFileSync("docs/warsaw-import-owners.csv", [header, ...lines].join("\n"));
  console.log(
    `Wygenerowano docs/warsaw-import-owners.csv (${rows.length} rekordow)`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
