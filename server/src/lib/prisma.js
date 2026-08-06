import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export function getPrisma() {
  if (!globalForPrisma.__studySmartPrisma) {
    globalForPrisma.__studySmartPrisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return globalForPrisma.__studySmartPrisma;
}
