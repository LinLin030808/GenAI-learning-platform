// Applies SQL migrations from ./drizzle to the configured database.
// Local: PGlite in .data/pglite (stop `npm run dev` first, PGlite allows one process).
// Production: DATABASE_URL (Neon). Runs automatically in `npm run vercel-build`.
import { config } from 'dotenv';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

// .env.local wins over .env (same order as Next.js)
config({ path: '.env.local', quiet: true });
config({ path: '.env', quiet: true });

async function main() {
  const url = process.env.DATABASE_URL;
  const migrationsFolder = path.join(process.cwd(), 'drizzle');
  if (url) {
    const { neon } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-http');
    const { migrate } = await import('drizzle-orm/neon-http/migrator');
    await migrate(drizzle({ client: neon(url) }), { migrationsFolder });
    console.info('Migrated Neon database.');
  } else {
    const { PGlite } = await import('@electric-sql/pglite');
    const { drizzle } = await import('drizzle-orm/pglite');
    const { migrate } = await import('drizzle-orm/pglite/migrator');
    const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), '.data', 'pglite');
    mkdirSync(dir, { recursive: true }); // PGlite only creates the last path segment
    const client = new PGlite(dir);
    await migrate(drizzle({ client }), { migrationsFolder });
    await client.close();
    console.info(`Migrated local PGlite database at ${dir}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
