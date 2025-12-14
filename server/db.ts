import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL must be set (required only if using server-side DB features)");
  }

  let useSsl = process.env.DATABASE_SSL === "true";
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");
    if (sslmode && sslmode !== "disable") {
      useSsl = true;
    }
  } catch {
    // ignore invalid URLs; pg can still accept some non-standard connection strings
  }

  return new Pool({
    connectionString,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop) {
    const realPool = createPool();
    return (realPool as any)[prop];
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const realDb = drizzle(createPool(), { schema });
    return (realDb as any)[prop];
  },
});
