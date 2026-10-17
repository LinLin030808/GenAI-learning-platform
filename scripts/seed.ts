// Seeds demo accounts, the three built-in mini-courses, a demo class and a few weeks of
// fake classmate activity so the leaderboard and dashboards are not empty.
// Idempotent: does nothing if the demo admin already exists. Use `npm run db:reset` to
// start over. Stop `npm run dev` first when using the local PGlite database.
import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });
config({ path: '.env', quiet: true });

async function main() {
  const { runSeed } = await import('./seed/run');
  await runSeed();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
