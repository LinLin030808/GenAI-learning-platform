// Deletes the local PGlite database and rebuilds it with demo data.
// Refuses to run against a remote DATABASE_URL. Stop `npm run dev` first.
import { config } from 'dotenv';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

config({ path: '.env.local', quiet: true });
config({ path: '.env', quiet: true });

if (process.env.DATABASE_URL) {
  console.error('db:reset only works on the local PGlite database. Unset DATABASE_URL first.');
  process.exit(1);
}

const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), '.data', 'pglite');
rmSync(dir, { recursive: true, force: true });
console.info(`Deleted ${dir}`);
execSync('npm run setup', { stdio: 'inherit' });
