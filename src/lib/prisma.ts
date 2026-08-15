import { PrismaClient } from "@/generated/prisma/client";

// Prisma Postgres 経由。CLI 系（migrate/seed）は直結の DATABASE_URL を使う
const accelerateUrl = process.env.PRISMA_DATABASE_URL;
if (!accelerateUrl) {
  throw new Error("PRISMA_DATABASE_URL is not set");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ accelerateUrl });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
