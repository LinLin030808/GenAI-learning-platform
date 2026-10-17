import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Every page in this app is per-user (session cookie), so we use the classic dynamic
  // rendering model instead of Cache Components. Revisit if we add public marketing pages.
  cacheComponents: false,
  // PGlite ships WASM + data files; let Node load it natively instead of bundling it.
  serverExternalPackages: ['@electric-sql/pglite'],
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
