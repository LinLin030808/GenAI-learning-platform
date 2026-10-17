// Database client. Two drivers, one schema:
// - DATABASE_URL set   -> Neon serverless Postgres (production / Vercel)
// - DATABASE_URL empty -> PGlite, an embedded Postgres stored in .data/pglite (local dev)
//
// The client is created lazily on first use so that importing this file (e.g. during
// `next build`) never opens a database.
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';

export type Database = PgDatabase<PgQueryResultHKT>;

const globalForDb = globalThis as unknown as { __sproutDb?: Promise<Database> };

async function createDb(): Promise<Database> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { neon } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-http');
    return drizzle({ client: neon(url), casing: 'snake_case' }) as unknown as Database;
  }
  if (process.env.VERCEL) {
    throw new Error(
      'DATABASE_URL is not set. Add a Postgres database in Vercel → Storage (Neon) and redeploy.',
    );
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const dataDir = process.env.PGLITE_DIR ?? path.join(process.cwd(), '.data', 'pglite');
  mkdirSync(dataDir, { recursive: true }); // PGlite only creates the last path segment
  const client = new PGlite(dataDir);
  return drizzle({ client, casing: 'snake_case' }) as unknown as Database;
}

/** Returns the shared database instance (one per server process). */
export function getDb(): Promise<Database> {
  // Kept on globalThis so Next.js hot reload does not open a second PGlite instance.
  globalForDb.__sproutDb ??= createDb();
  return globalForDb.__sproutDb;
}
