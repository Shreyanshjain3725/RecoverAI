import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function ensureVercelDatabase() {
  // Check if running in Vercel serverless environment
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const tmpDbPath = "/tmp/dev.db";
      process.env.DATABASE_URL = `file:${tmpDbPath}`;

      if (!fs.existsSync(tmpDbPath)) {
        const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");
        if (fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
          console.log("Successfully copied seeded database to /tmp/dev.db for Vercel serverless.");
        }
      }
    } catch (err) {
      console.error("Error setting up Vercel serverless database in /tmp:", err);
    }
  }
}

ensureVercelDatabase();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
