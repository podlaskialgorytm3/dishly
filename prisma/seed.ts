import { PrismaClient } from "@prisma/client";
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
