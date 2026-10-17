import { defineConfig } from 'drizzle-kit';

// Core tables live in src/core/db/schema.ts; each module may add its own tables in
// src/modules/<name>/schema.ts. Both are picked up here, so adding a module never
// requires editing core.
export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/core/db/schema.ts', './src/modules/*/schema.ts'],
  out: './drizzle',
  casing: 'snake_case',
});
