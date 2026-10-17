# Team Standards (start here)

> Chinese version: [README.zh-CN.md](README.zh-CN.md)

These documents keep three prototypes, built by three people with different AI agents,
compatible enough that we can merge the best parts into one app after the 10.19 review.

| Document | Read it when |
|---|---|
| [TECH_STACK.md](TECH_STACK.md) | Setting up a project, choosing a library, deploying |
| [CODING_STANDARDS.md](CODING_STANDARDS.md) | Before writing any code (architecture, module rules, naming, git) |
| [DATA_MODEL.md](DATA_MODEL.md) | Adding or reading data, naming fields and events |
| [UI_GUIDELINES.md](UI_GUIDELINES.md) | Building any screen, writing any user-facing text |

## How to use these with your AI agent

**If you start from this repo** (recommended): `AGENTS.md` and `CLAUDE.md` at the root point to
these files, so Claude Code and Codex read them automatically. Just give your agent a task like:

> Build a new module `src/modules/flashcards/` following AGENTS.md and docs/standards.
> Register it in src/registry/modules.ts. Do not touch other modules.

**If you start your own prototype from scratch**, copy `AGENTS.md`, `CLAUDE.md`, `docs/standards/`,
`package.json`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json` and `src/app/globals.css`
into it first, then tell your agent:

> Read AGENTS.md and everything in docs/standards before writing code. Use exactly this stack,
> folder structure, naming and UI tokens. Build each feature as a module in src/modules/<name>/
> with a manifest.ts, so it can be copied into another project later.

## The three things that matter most for merging later

1. **One feature = one folder** in `src/modules/`, plugged in through `manifest.ts`.
2. **Modules never import each other.** They share data through core tables and `learning_events`.
3. **Same names for the same things**: tables, fields and event types from DATA_MODEL.md.
