import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const isDev = process.env.NODE_ENV !== "production";

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and set your Postgres URL.");
  }
  _client = postgres(url, {
    max: isDev ? 5 : 20,
    idle_timeout: 20,
    prepare: false,
  });
  _db = drizzle(_client, { schema, casing: "snake_case" });
  return _db;
}

// Proxy that lazy-initialises on first access.
// Lets server components import { db } at module top-level without crashing the build
// when DATABASE_URL isn't set during `next build` page-data collection.
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const real = getDb();
    const value = real[prop as keyof typeof real];
    return typeof value === "function" ? (value as Function).bind(real) : value;
  },
});

export type DB = ReturnType<typeof drizzle<typeof schema>>;
export { schema };
