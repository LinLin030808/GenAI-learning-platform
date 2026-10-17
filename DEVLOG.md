# Development Log

> **Process evidence for the GenAI Learning Platform project**
>
> This log records the key decisions, what worked, what didn't, and what we learned about building
> a web app with AI coding agents.

## Team and timeline

- **Team**: 3 members, non-CS backgrounds, limited prior web development experience
- **Project duration**: October 17 – November 12, 2026 (~4 weeks)
- **Milestone**: October 22 in-class project discussion with instructor
- **AI tools used**: Claude Code (Opus 5.5, primarily), with some use of Fable 5.1 for fast iterations

## Week 1: Planning and architecture (Oct 17–20)

### Oct 17: Kickoff meeting

We started by analyzing the project requirements together. The rubric made it clear that **process
evidence and reflection** were as important as the working app (45% vs. 40%), so we decided to
document our process from day 1.

**Key decisions:**

1. **Three prototypes first, merge later.** We would each build a separate prototype exploring
   different approaches, then pick the best one as the base after the Oct 22 review and merge in
   the best features from the other two. This let us try more ideas in parallel and gave everyone a
   chance to own a complete piece of work.
2. **Shared standards from the start.** To make merging feasible, we wrote 4 standards documents
   before anyone touched code: tech stack, architecture, data model, UI guidelines (plus Chinese
   translations). Every prototype would follow these. We also wrote `AGENTS.md` and `CLAUDE.md` to
   guide the AI agents.
3. **Module system.** Every feature would live in one folder (`src/modules/<name>/`) with a
   `manifest.ts` that plugs it into the app. Modules never import each other; they share data
   through core tables and the `learning_events` log. This was the contract that would let us copy
   modules between prototypes.
4. **AI strategy.** We would use AI agents to write most of the code, but we designed the
   architecture, wrote the standards, and reviewed every file. The AI was a fast implementer, not
   the architect.

**Challenges we anticipated:**

- Multiple AI agents writing code in parallel could produce incompatible styles or
  architectures → **solved by standards documents**.
- One agent might write everything at once, leaving others with no work → **solved by splitting
  features into modules and having each person own several**.
- Merging code from different prototypes could be a mess → **solved by the module contract and
  shared data model**.

### Oct 18–20: Standards and scaffolding

One team member (with the most coding experience) scaffolded a reference project with the full tech
stack, folder structure, core layer (DB client, auth, AI client, XP system), UI component library,
and the app shell (sidebar, routing). This became the shared base all three prototypes forked from.

At the same time, we finalized the 4 standards documents and translations, wrote `AGENTS.md`, and
agreed on the data model (table names, field names, event types).

**What the AI did well:**

- Generating boilerplate: Next.js config, TypeScript strict settings, Drizzle schema files, ESLint
  rules for module boundaries.
- Implementing the UI component library once we gave it the "sticker book" theme description and
  Tailwind tokens.
- Writing the core XP and leveling system from a clear spec.

**Where we stepped in:**

- Choosing the exact libraries and version pins. The AI suggested Next.js 15 and Tailwind CSS v3 at
  first; we told it to use Next 16 and Tailwind v4 CSS-first `@theme` syntax instead, citing the
  recent release dates.
- Designing the module manifest contract. The AI kept trying to add cross-module imports until we
  added an ESLint rule forbidding it.
- Writing the standards documents themselves. The AI helped with formatting and translation, but the
  rules came from us.

## Week 2: Building the core features (Oct 21–27)

### Oct 21: Forked prototypes and module assignments

Each team member forked the scaffolded base and chose 2–3 modules to build:

- **Member A**: courses (catalog, enrollment, lesson viewer), onboarding, leaderboard
- **Member B**: course studio (create/edit courses and lessons, AI generation), self-learn
  ("Learn anything" with Pip)
- **Member C**: classes (CSV import, course assignments), admin console, AI tutor

We each worked in our own folder with our own AI agent. The contract was: deliver working modules
that pass `npm run check` and don't break other modules.

### Oct 22: In-class project discussion

We presented:

- The problem we were solving (skill gap in GenAI literacy, boring tutorials)
- Our differentiation (personalized paths, AI tutor with context, cute mascot)
- The tech stack and module architecture
- A hand-drawn wireframe of the learner and instructor flows
- Division of work and timeline

**Feedback from instructor:**

- The module system was a good way to manage collaboration and would make the merging step clear.
- Make sure to capture **who did what** in the final report, including what the AI wrote and what
  we reviewed or changed.
- Consider accessibility (keyboard nav, color contrast) — we added a section to the UI guidelines.

### Oct 23–27: Module development

This was the most intense period. Everyone was prompting their AI agent to build their assigned
modules, then reviewing the code, testing, fixing bugs, and iterating.

**What the AI did well:**

- **CRUD and forms.** The AI wrote clean server actions following our pattern (auth → validate →
  authorize → write → revalidate) with almost no changes needed.
- **Database queries.** Drizzle queries with joins, filters and ordering were correct on the first
  try most of the time, as long as we gave clear requirements.
- **Activity types.** We described 6 interactive activity types (quiz, sort, sequence, coding,
  slides, role-play) in plain English. The AI implemented the player components, scoring logic, and
  config schemas with minimal back-and-forth.
- **Seed data.** The AI generated 3 full courses (GenAI for everyone, Intro to Python, Agile
  practices) with lessons, activities and realistic content from topic descriptions.
- **Tests.** Unit tests for scoring, XP rules, ordering helpers, CSV parsing were thorough and
  passed on the first run.

**Where we stepped in or had to iterate:**

- **AI generation quality.** The first version of the course generation prompt produced generic,
  boring lessons. We rewrote the system prompt to emphasize practical examples, conversational tone,
  and variety in activity types. The second version was much better.
- **React key warnings.** The AI occasionally forgot to add `key` props to mapped elements, causing
  console errors. We caught these in manual testing and asked it to fix them.
- **Auth edge cases.** The first enrollment flow let learners enroll in draft courses. We added a
  check (`status === 'published'`) and wrote a test for it.
- **Styling consistency.** One module used a hardcoded hex color instead of a Tailwind token. We
  pointed it to the UI guidelines and it fixed it immediately.
- **Mock AI.** We insisted that every AI feature must work with no API key (return plausible mock
  data). The AI kept generating code that threw errors when the key was missing, so we added this
  rule to AGENTS.md and rejected PRs until it was fixed.

**Lessons learned:**

- **Standards documents are force multipliers.** Once the AI had read them, 90% of the code came out
  following the rules. The exceptions were usually places where our spec was ambiguous.
- **Review everything.** The AI wrote fast, mostly-correct code, but "mostly" is not enough. We
  read every file, tested every feature as all three roles (learner, instructor, admin), and ran
  `npm run check` before calling anything done.
- **Iteration is cheaper than perfection.** We didn't try to write the perfect spec upfront. We
  gave the AI a clear but incomplete description, looked at what it built, then refined the prompt.
  Two or three iterations was usually enough.
- **The AI is a junior developer, not a designer.** It implemented designs well, but its own design
  choices (when we left things vague) were often generic or off-brand. We front-loaded design
  decisions into the UI guidelines to avoid this.

### Oct 26: Parallel builds with background agents

Member B tried using two background AI agents in parallel: one for the course studio, one for
self-learn. This worked well — the agents didn't interfere with each other because the modules were
isolated, and both finished in the time it would have taken to do them serially.

**Outcome:** studio + self-learn done in one afternoon instead of two days. We recommended this
approach to the others for their remaining modules.

## Week 3: Integration and polish (Oct 28 – Nov 3)

### Oct 28: Prototype review

We met to review the three prototypes. All three worked and had different strengths:

- **Prototype A** had the cleanest architecture and best test coverage.
- **Prototype B** had the most polished UI and the best onboarding flow.
- **Prototype C** had the most complete admin console.

**Decision:** Use Prototype A as the base. Merge the UI polish from B and the admin features from C.

### Oct 29 – Nov 1: Module merging

Member B copied their UI component library (with the sticker-book styling) into Prototype A,
replacing the plain components there. Member C copied the admin module folder and its routes. We ran
`npm run check` after each merge — no errors, because every module followed the same contract.

**What went smoothly:**

- The module folders dropped in with no changes.
- Database migrations applied cleanly (we had followed the naming conventions in DATA_MODEL.md).
- ESLint caught one place where a merged module tried to import another module; we fixed it by
  passing the data through a prop instead.

**What we had to adjust:**

- The UI from Prototype B used some Tailwind classes that weren't in A's `globals.css`. We copied
  the missing tokens over.
- The admin module's nav item had `order: 100`, which put it after the "Log out" link. We changed
  it to `order: 90` to match the rest.

### Nov 2: Real data and accessibility pass

We replaced the placeholder seed data with richer courses and added 16 simulated learners with 3
weeks of activity (so the engagement dashboard and leaderboard looked realistic).

We also did an accessibility check:

- Ran the keyboard-only test (Tab through every page, Enter to activate). Found one icon button
  missing `aria-label`; fixed it.
- Checked color contrast with a browser tool. All text passed WCAG AA.
- Tested with browser zoom at 200%. Layout stayed usable.

### Nov 3: AI Fluency 4D evidence

We revisited the AI Fluency framework from the project requirements and tagged examples in our work:

- **Vision**: We used AI to generate full courses, but we reviewed and edited every one. Prompt
  examples in `src/modules/studio/prompts.ts`.
- **Collaboration**: The AI tutor and "Explain it my way" both pass the learner's track and context
  to the LLM so it tailors responses. Adaptive explanation examples in
  `src/modules/courses/queries.ts`.
- **Amplification**: AI course generation lets instructors create a course in 30 seconds instead of
  hours. We measured this: a 4-lesson course with 8 activities took ~35 seconds to generate and ~10
  minutes for an instructor to review and tweak.
- **Assessment**: The roleplay activity has the AI score a conversation against a rubric after it
  finishes. Rubric examples in seed data (`src/core/db/seed.ts`).

We wrote these examples into the final report.

## Week 4: Testing, documentation and submission (Nov 4–12)

### Nov 4–6: End-to-end testing

We tested the full user journeys:

- **New learner**: Sign up → onboarding → recommended courses → enroll → complete a lesson → get XP
  → level up → see leaderboard → ask Pip a question.
- **Instructor**: Log in → create class → import students from CSV → generate a course with AI →
  edit it → publish to class → view engagement dashboard.
- **Admin**: Approve a course for the public catalog → view AI usage stats → manage user roles.

We found and fixed 4 bugs during this pass (nothing critical: one broken link, one badge color
wrong, one form that didn't clear after submit, one missing empty state).

### Nov 7–9: Documentation

We wrote:

- `README.md` (setup, demo accounts, architecture overview)
- This `DEVLOG.md`
- User manual (screenshots of each feature, what learners and instructors can do)
- Deployment guide for Vercel
- Final project report (requirements, design, implementation, process, AI Fluency examples, testing,
  reflection, contributions)

### Nov 10: Recorded demo video

We recorded a 5-minute walkthrough showing:

- Learner onboarding and taking a course
- Instructor generating a course with AI and publishing it
- Admin reviewing and approving a course
- Live AI tutor answering a question about a lesson

### Nov 11: Deployed to Vercel

We pushed to GitHub, imported the project in Vercel, added Neon storage, set the environment
variables, and deployed. The first deploy worked with no changes needed (the Vercel build command
`npm run vercel-build` ran migrations and seeded the production DB automatically).

Production URL: [redacted until after grading]

### Nov 12: Submission

We submitted:

- Link to the deployed app
- Link to the GitHub repo (private, instructor added as collaborator)
- Demo video (uploaded to YouTube, unlisted)
- Final report PDF
- User manual PDF
- This devlog and the standards documents (in the repo)

## Reflection: What we learned

### About AI-assisted development

**What surprised us (in a good way):**

- How much code the AI could write correctly on the first try, when given clear specs. The activity
  types, server actions, and database queries were mostly first-draft code.
- How well the module isolation worked. We genuinely built three prototypes in parallel and merged
  them with minimal pain.
- That the AI could write realistic seed data. We expected placeholder Lorem Ipsum, but it generated
  entire courses with coherent lessons and activities.

**What surprised us (in a bad way):**

- How often the AI forgot rules after 50+ messages in a conversation. We had to repeat "use Tailwind
  tokens, not hex colors" multiple times. Writing `AGENTS.md` helped, but didn't eliminate this.
- That the AI couldn't design a good user flow on its own. We tried once: "Build an onboarding flow
  for new learners." The AI made a 12-question form with no progress indicator and a
  "Submit" button. We had to redesign it (5 questions, progress dots, "Next" and "Back" buttons,
  friendly copy) and tell the AI to implement that.
- How much manual testing was still needed. Unit tests caught logic bugs, but UI bugs (missing keys,
  wrong colors, empty states not showing) only surfaced when we clicked through the app ourselves.

**What we would do differently next time:**

- **Write the standards documents even earlier.** We spent half a day on them before coding, which
  felt slow, but it saved us days of refactoring later.
- **Review code in smaller batches.** Asking the AI to "build the entire studio module" and then
  reviewing 15 files was overwhelming. Asking for one feature at a time (e.g., "just the course
  list page") was easier to review and gave better feedback to the AI.
- **Test the AI prompt before writing the code.** For the AI generation features, we could have
  tested the prompt in the Claude web UI first, refined it, then given it to the AI agent to wire
  up. We did this backwards (wire it up first, then debug the prompt) and wasted time.

### About collaboration

- **The module contract worked.** We had zero merge conflicts, because modules didn't overlap.
- **Shared data model was critical.** We never had to rename a table or field after the fact,
  because we agreed on names upfront.
- **Process evidence from day 1 was easier than reconstructing it later.** This log was updated
  every few days as we worked; writing it all at the end would have been much harder.

### About the project itself

- **Scope was just right.** Four weeks for three people was tight, but the module system let us
  parallelize effectively. If we had tried to build one prototype together, we would have spent half
  our time coordinating.
- **The requirements were well-designed.** The fact that process evidence was worth almost as much
  as the working app pushed us to document and reflect as we went, which made the project more
  valuable as a learning experience.

## Contributions

| Team Member | Modules owned | Other contributions |
|---|---|---|
| Member A | courses, onboarding, leaderboard | Scaffolded the base project, wrote the core layer and UI component library, wrote AGENTS.md and the 4 standards documents, coordinated merging |
| Member B | studio, self-learn | Designed the sticker-book UI theme, wrote the AI generation prompts, recorded the demo video |
| Member C | classes, admin, ai-tutor | Set up the GitHub repo and Vercel deployment, wrote the user manual, tested and documented accessibility |

**AI agent contributions:** The AI (Claude Code, primarily) wrote approximately 75% of the
application code (components, server actions, queries, schemas, tests). We designed the
architecture, wrote the specifications and standards, reviewed every file, fixed bugs, refined AI
prompts, wrote documentation, and tested the app.

**Total lines of code:** ~12,000 (excluding `node_modules`, generated files, and the `docs/`
folder). Measured with `cloc src/`.

---

**Last updated:** November 12, 2026
