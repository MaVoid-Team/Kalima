import { PrismaClient } from "../../apps/store-api/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Extract the schema from the DATABASE_URL (?schema=kalima), default to "public"
const schema = new URL(databaseUrl).searchParams.get("schema") ?? "public";

const pool =
  globalForPrisma.pool ?? new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool, { schema });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export type { PrismaClient };
