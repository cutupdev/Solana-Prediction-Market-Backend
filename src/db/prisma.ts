import { PrismaClient } from "@prisma/client";
import { logger } from "../lib/logger";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function connectDb(): Promise<void> {
  await prisma.$connect();
  logger.info("Database connected");
}

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
