# Tech Stack

> Chinese version: [TECH_STACK.zh-CN.md](TECH_STACK.zh-CN.md). Versions are pinned exactly in
> `package.json`. Do not upgrade or add packages without agreeing in the group first.

## 1. Stack at a glance

| Layer | Choice | Version | Why |
|---|---|---|---|
| Runtime | Node.js | ≥ 22.12 (we use 24) | Required by Next 16 / Vitest 5 |
| Framework | Next.js App Router, Turbopack | 16.4.2 | Front end + back end in one project, deploys to Vercel in one click |
| UI library | React | 19.3.1 | Server Components, `useActionState` for forms |
| Language | TypeScript, strict | 5.9.3 | Type errors catch most AI-agent mistakes early |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) | 4.3.3 | Design tokens live in `src/app/globals.css` |
| Database | PostgreSQL via Drizzle ORM | drizzle-orm 0.45.4, drizzle-kit 0.31.11 | Typed SQL, plain migrations |
| DB (local) | PGlite (embedded Postgres, no install) | 0.5.10 | Clone → `npm run setup` → works. No Docker, no account |
| DB (production) | Neon serverless Postgres (via Vercel Storage) | @neondatabase/serverless 1.2.0 | Free tier, sets `DATABASE_URL` automatically |
| Auth | Email + password, JWT session cookie | jose 6.2.12, bcryptjs 3.0.3 | Small, readable, no third-party auth service |
| Validation | Zod | 4.6.7 | Forms, JSON bodies, AI output |
| AI | Any OpenAI-compatible Chat API, default DeepSeek | plain `fetch` in `src/core/ai/client.ts` | One file to change provider; built-in mock when no key |
| Markdown | react-markdown + remark-gfm | 10.1.0 / 4.0.1 | Lesson content, AI replies (no raw HTML) |
| Code editor | CodeMirror (`@uiw/react-codemirror`) | 4.25.12 | Coding activities; code runs in a Web Worker |
| Charts | Recharts | 3.10.1 | Instructor engagement dashboard |
| CSV | Papa Parse | 5.7.0 | Student import |
| Icons | lucide-react | 1.58.0 | One icon set for the whole app |
| Tests | Vitest | 5.0.5 | Unit tests for pure logic |
| Lint / format | ESLint 9 (flat config, eslint-config-next) + Prettier 3 | 9.39.5 / 3.9.10 | Module-boundary rules + consistent formatting |
| Hosting | Vercel | — | Push to GitHub → deployed; preview URL per PR |

### Not used (on purpose)

- No separate backend server, no Docker, no Redux/Zustand (server components + URL state are enough).
- No component library beyond our own `src/components/ui` (keeps the look ours, not "default shadcn").
- No AI SDK wrappers: the provider is called with `fetch` so the code is easy to read and swap.
- Next.js **Cache Components** is turned off (`cacheComponents: false`): every page is per-user.

## 2. Commands

| Command | What it does |
|---|---|
| `npm install` | Install exact versions from `package-lock.json` |
| `npm run setup` | Create local DB tables + demo data (first time) |
| `npm run dev` | Start at http://localhost:3000 |
| `npm run check` | Typecheck + lint + unit tests (run before every PR) |
| `npm run db:generate` | After editing a `schema.ts`: create a new SQL migration |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Insert demo data if missing |
| `npm run db:reset` | Delete the local DB and re-create it with demo data |
| `npm run build` | Production build |

PGlite allows **one process** at a time: stop `npm run dev` before `db:migrate`, `db:seed` or `db:reset`.

## 3. Environment variables

Copy `.env.example` to `.env.local`. Never commit `.env.local`.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Production only | Empty locally (PGlite). Set by Vercel when you add Neon |
| `AUTH_SECRET` | Production | Long random string for signing session cookies |
| `AI_API_KEY` | No | Empty = mock AI. DeepSeek key for real responses |
| `AI_BASE_URL` | No | Default `https://api.deepseek.com` |
| `AI_MODEL_FAST` / `AI_MODEL_SMART` | No | Model names for cheap vs. quality calls |
| `AI_JSON_MODE` | No | `false` if the provider rejects `response_format` |
| `AI_DAILY_LIMIT_PER_USER` | No | Default 200 real calls per user per day |

## 4. Deploying to Vercel

1. Push the repo to GitHub, then **Import Project** in Vercel.
2. In the Vercel project: **Storage → Create → Neon (Postgres)**, connect it. This sets `DATABASE_URL`.
3. **Settings → Environment Variables**: add `AUTH_SECRET`, and `AI_API_KEY` if you have one.
4. Build command: `npm run vercel-build` (migrates, seeds if empty, builds).
5. Deploy. Log in with the demo accounts listed in the README.
