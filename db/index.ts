import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as relations from "./relations";

const schemaCompleto = { ...schema, ...relations };
type Database = NodePgDatabase<typeof schemaCompleto>;

let database: Database | undefined;

function getDatabase(): Database {
  if (database) return database;

  const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DB_URL;
  if (!connectionString) {
    throw new Error("Banco não configurado. Defina DATABASE_URL ou NETLIFY_DB_URL na Netlify.");
  }

  const pool = new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX ?? "3"),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  database = drizzle(pool, { schema: schemaCompleto });

  return database;
}

// Inicializa o pool só na primeira consulta, não durante a coleta de páginas do build.
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const client = getDatabase();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
