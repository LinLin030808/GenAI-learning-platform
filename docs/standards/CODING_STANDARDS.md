# Coding Standards

> Applies to every prototype and the final app. Chinese version: [CODING_STANDARDS.zh-CN.md](CODING_STANDARDS.zh-CN.md).
> If your AI agent writes code that breaks a rule here, ask it to fix the code, not the rule.

## 1. Why these rules exist

Three people, three prototypes, different AI agents. After the 10.19 review we keep **one**
prototype as the base and move the best features from the other two into it. That only works
if every feature is a **self-contained module** that plugs into the app through a small, stable
contract. The rules below are mostly about keeping that contract intact.

## 2. Architecture

```
src/
├── app/                  Routes only (thin). Next.js App Router.
│   ├── (auth)/           login, signup
│   ├── (app)/            signed-in pages, wrapped by the app shell
│   └── api/              route handlers (streaming AI endpoints)
├── core/                 Shared foundation. Knows nothing about modules.
│   ├── db/               schema.ts (core tables) + client.ts (getDb)
│   ├── auth/             session (requireUser), password, login/signup actions
│   ├── ai/               the ONLY LLM client (generateText / generateJson / streamText)
│   ├── progress/         XP, levels, streaks, completeActivity, enrolment
│   ├── content/          course queries + AI course draft generation
│   ├── events.ts         recordEvent() into the learning_events log
│   ├── activity-types.ts contract for interactive activity types
│   ├── ids.ts            newId('course') → "crs_k3j9x2m1q8wz"
│   └── types.ts          ModuleManifest, NavItem, HomeWidget, ActionResult, SessionUser
├── components/ui/        Shared UI kit (Button, Card, Pip, Avatar...). No business logic.
├── registry/             The two lists that wire modules in: modules.ts, activities.ts
├── shell/                App frame (sidebar, top bar). Reads the registry.
└── modules/<name>/       One folder per feature module (see §3)
scripts/                  migrate, seed, reset
drizzle/                  Generated SQL migrations (do not edit by hand)
docs/standards/           These documents
```

### Dependency direction (enforced by ESLint)

```
app  ──►  shell  ──►  registry  ──►  modules  ──►  core + components/ui
```

- `core/` and `components/ui/` never import from `modules/`, `registry/` or `app/`.
- A module never imports another module. It may import `core`, `components/ui`, and
  `@/registry/activities` (to render activity players).
- `app/` route files import from modules, core and the registry.

## 3. Modules: the plug-in contract

### 3.1 Folder layout

```
src/modules/leaderboard/
├── manifest.ts        REQUIRED. Nav items, home widgets, shell add-ons (see ModuleManifest)
├── schema.ts          Optional. Tables owned by this module (picked up by drizzle.config.ts)
├── queries.ts         Read functions (server only)
├── actions.ts         'use server' mutations
├── components/        React components (kebab-case files)
├── pages/             Full page components that src/app routes render (optional)
└── *.test.ts          Unit tests next to the code they test
```

### 3.2 How a module plugs in

| Need | How | File you touch outside your module |
|---|---|---|
| A sidebar link | `navItems` in your manifest | `src/registry/modules.ts` (one line, once) |
| A card on the home page | `homeWidgets` in your manifest | same line |
| Something on every page (e.g. floating tutor) | `shellAddons` in your manifest | same line |
| A new interactive activity type | export an `ActivityDefinition` | `src/registry/activities.ts` (one line) |
| A page | create `src/app/(app)/<route>/page.tsx` that renders your component | the route file |
| React to learning activity | read `learning_events` (append-only log) | none |
| Report learning activity | `recordEvent()` from `@/core/events` | none |
| Your own data | `src/modules/<name>/schema.ts` + `npm run db:generate` | none |

### 3.3 Moving a module into another prototype

1. Copy `src/modules/<name>/` and its route files under `src/app/`.
2. Add the manifest to `src/registry/modules.ts` (and activity types to `src/registry/activities.ts`).
3. `npm run db:generate && npm run db:migrate` if the module has a `schema.ts`.
4. `npm run check`. If it fails, the module was reaching outside its contract: fix the module.

### 3.4 Rules

- Talk to other features **through data, not imports**: core tables, `learning_events`, the
  registries. Example: the leaderboard never calls the courses module; it sums `xp` in
  `learning_events`, which `completeActivity()` writes.
- Never add a column to a core table for one module. Create a module table keyed by the core id.
- A route file is ≤ 20 lines: `requireUser()`, read `params`, render a module component.
- Server-only files (DB, AI) must not be imported by `'use client'` files. Pass data as props
  or call a server action.

## 4. Naming

| Thing | Convention | Example |
|---|---|---|
| Files & folders | kebab-case | `course-card.tsx`, `self-learn/` |
| React components | PascalCase, named export | `export function CourseCard()` |
| Hooks | camelCase with `use` | `useCountdown` |
| Functions, variables | camelCase, verb first for functions | `getCourseOutline`, `isPublished` |
| Constants | UPPER_SNAKE_CASE | `LESSON_COMPLETE_XP` |
| Types / interfaces | PascalCase, no `I` prefix | `CourseOutline`, `ActivityPlayerProps` |
| Zod schemas | camelCase + `Schema` | `quizConfigSchema` |
| Server actions | verb + noun | `enrollInCourse`, `publishCourse` |
| DB tables | snake_case, plural | `learning_events`, `class_members` |
| DB columns | snake_case in SQL, camelCase in TS (drizzle maps it) | `created_at` / `createdAt` |
| IDs | prefixed string via `newId()` | `crs_…`, `usr_…`, `act_…` |
| Event types | `domain.past_tense` | `activity.completed`, `class.joined` |
| AI feature names | `module.action` | `tutor.chat`, `studio.generate_course` |
| Routes (URLs) | kebab-case, plural nouns | `/courses/[slug]/lessons/[lessonId]` |
| Module ids | kebab-case = folder name | `ai-tutor` |
| Env vars | UPPER_SNAKE_CASE | `AI_MODEL_FAST` |
| Branches | `feat/<module>-<short-desc>`, `fix/…`, `docs/…` | `feat/leaderboard-weekly-tab` |

Booleans read as questions: `isDraft`, `hasProfile`, `canEdit`.

## 5. TypeScript & React

- `strict` and `noUncheckedIndexedAccess` are on. Do not silence errors with `any`, `as any`
  or `// @ts-ignore`. Use `unknown` + zod at boundaries.
- Validate **every** external input (form data, JSON bodies, AI output) with zod.
- Prefer **Server Components**. Add `'use client'` only for state, effects or browser APIs, and
  keep client components small (leaf components).
- Data fetching happens in server components or `queries.ts`, not in `useEffect`.
- Mutations are **server actions** in `actions.ts`. Use route handlers (`src/app/api/`) only for
  streaming responses.
- Named exports everywhere, except Next.js files that require a default export (`page.tsx`,
  `layout.tsx`, `route.ts`).
- Imports: use the `@/` alias for anything outside the current folder. Order: external
  packages, `@/core`, `@/components`, `@/registry`, then relative.
- Comments explain **why**, not what. Every module file starts with a 1-3 line comment saying
  what it is for if the name is not obvious.

### Server action pattern

```ts
'use server';

const schema = z.object({ courseId: z.string(), title: z.string().trim().min(1).max(100) });

export async function renameCourse(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(['instructor', 'admin']);            // 1. auth
  const parsed = schema.safeParse(Object.fromEntries(formData));       // 2. validate
  if (!parsed.success) return { ok: false, error: 'Give the course a title.' };
  const course = await getCourseById(parsed.data.courseId);            // 3. authorise
  if (!course || !(await canEditCourse(user, course))) return { ok: false, error: 'Not allowed.' };
  const db = await getDb();                                            // 4. write
  await db.update(courses).set({ title: parsed.data.title, updatedAt: new Date() }).where(eq(courses.id, course.id));
  revalidatePath(`/studio/${course.id}`);                              // 5. refresh
  return { ok: true, message: 'Saved.' };
}
```

Client side: `const [state, action] = useActionState(renameCourse, null)` and show
`state.error` with `<Notice tone="error">`.

## 6. AI usage in code

- Import only from `@/core/ai/client`. Pick a tier: `fast` (bulk, cheap) or `smart`
  (role-play, whole-course generation).
- Always pass `feature: '<module>.<action>'`, `userId`, and a `mock` that returns something
  sensible offline. The app must be fully clickable with no API key.
- Structured output: `generateJson(messages, zodSchema, ...)`. Describe the JSON shape in the
  system prompt; the schema enforces it.
- Keep prompts in the module next to the feature, as exported constants or builder functions.
- Store generated content in the database. Do not regenerate the same thing on every view.

## 7. Errors & loading

- Expected failures (validation, permission) → return `{ ok: false, error }`, show inline.
- Unexpected failures → throw; Next.js shows the nearest `error.tsx`.
- Every action button shows a pending state (`<SubmitButton pendingText="Saving…">`).
- Every list has an empty state (`<EmptyState>`).

## 8. Testing

- Unit tests with Vitest for pure logic (scoring, XP, parsing, ranking): `*.test.ts` next to the file.
- Before a PR: `npm run check` (typecheck + lint + tests) must pass.
- Manually click through your feature as learner, instructor and admin with the demo accounts.

## 9. Git

- Branch from `main`: `feat/<module>-<desc>`. One feature per PR, small PRs.
- Commit messages (Conventional Commits): `feat(leaderboard): add weekly tab`,
  `fix(studio): keep lesson order after delete`, `docs: update data model`.
- Commit with **your own GitHub account**. Your commits are your contribution record.
- PR description: what changed, how you tested it, which parts the AI wrote and what you changed.
- Never commit `.env.local`, `.data/` or API keys.

## 10. Checklist before you open a PR

- [ ] Code is inside my module (plus thin route files / one registry line)
- [ ] No new dependencies, no hard-coded colours, no direct LLM calls
- [ ] Inputs validated with zod, actions call `requireUser()`
- [ ] Works with no `AI_API_KEY` (mock path)
- [ ] Empty, loading and error states exist
- [ ] `npm run check` passes
- [ ] I can explain every file in the diff
