import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as relations from "./relations";

const connectionString = process.env.DATABASE_URL ?? process.env.NETLIFY_DB_URL;

if (!connectionString) {
  throw new Error("Configure DATABASE_URL (ou NETLIFY_DB_URL) para conectar ao PostgreSQL.");
}

const pool = new Pool({
  connectionString,
  max: Number(process.env.DB_POOL_MAX ?? "3"),
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { 
  schema: { ...schema, ...relations } 
});
