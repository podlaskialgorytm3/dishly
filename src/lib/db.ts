import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

let prismaClient: PrismaClient | undefined = globalThis.prisma;

function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient();

    if (process.env.NODE_ENV !== "production") {
      globalThis.prisma = prismaClient;
    }
  }

  return prismaClient;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    return Reflect.get(client, property, client);
  },
});
