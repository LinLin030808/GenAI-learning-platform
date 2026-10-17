// Page smoke test for local development.
//   1. `npx tsx scripts/smoke.ts prep`  (dev server STOPPED: reads page ids from the local DB)
//   2. `npm run dev`
//   3. `npx tsx scripts/smoke.ts run [port]`  (logs in through the real login form as each
//      demo account, then requests every page)
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

config({ path: '.env.local', quiet: true });
config({ path: '.env', quiet: true });

const FILE = path.join(process.cwd(), '.data', 'smoke.json');
const DEMO_PASSWORD = 'sprout123';
const ACCOUNTS: Record<string, string> = {
  learner: 'learner@demo.dev',
  newbie: 'new@demo.dev',
  instructor: 'instructor@demo.dev',
  admin: 'admin@demo.dev',
};

interface Prep {
  routes: { role: string; path: string }[];
  roleplayActivityId: string | null;
}

async function prep() {
  const { eq, and, asc } = await import('drizzle-orm');
  const { getDb } = await import('@/core/db/client');
  const { courses, lessons, classes, activities } = await import('@/core/db/schema');
  const db = await getDb();

  const [basics] = await db.select().from(courses).where(eq(courses.slug, 'how-software-gets-built')).limit(1);
  const basicsLessons = await db.select().from(lessons).where(eq(lessons.courseId, basics!.id)).orderBy(asc(lessons.position));
  const [agents] = await db.select().from(courses).where(eq(courses.slug, 'working-with-ai-coding-agents')).limit(1);
  const agentLessons = await db.select().from(lessons).where(eq(lessons.courseId, agents!.id)).orderBy(asc(lessons.position));
  const [cls] = await db.select().from(classes).limit(1);
  const [draft] = await db.select().from(courses).where(and(eq(courses.status, 'draft'), eq(courses.source, 'manual'))).limit(1);
  const [draftLesson] = draft ? await db.select().from(lessons).where(eq(lessons.courseId, draft.id)).limit(1) : [];
  const [rp] = await db.select({ id: activities.id }).from(activities).where(eq(activities.type, 'roleplay')).limit(1);

  const L = (p: string) => ({ role: 'learner', path: p });
  const routes = [
    { role: 'anon', path: '/' },
    { role: 'anon', path: '/login' },
    { role: 'anon', path: '/signup' },
    L('/home'),
    L('/courses'),
    L(`/courses/${basics!.slug}`),
    ...basicsLessons.map((l) => L(`/courses/${basics!.slug}/lessons/${l.id}`)),
    ...agentLessons.map((l) => L(`/courses/${agents!.slug}/lessons/${l.id}`)),
    L('/leaderboard'),
    L('/leaderboard?period=all'),
    L(`/leaderboard?scope=global&view=race`),
    L('/classes'),
    L('/create'),
    { role: 'newbie', path: '/home' },
    { role: 'newbie', path: '/onboarding' },
    { role: 'instructor', path: '/home' },
    { role: 'instructor', path: '/studio' },
    { role: 'instructor', path: '/studio/new' },
    ...(draft ? [{ role: 'instructor', path: `/studio/${draft.id}` }] : []),
    ...(draft && draftLesson ? [{ role: 'instructor', path: `/studio/${draft.id}/lessons/${draftLesson.id}` }] : []),
    { role: 'instructor', path: '/classes' },
    { role: 'instructor', path: `/classes/${cls!.id}` },
    { role: 'instructor', path: `/classes/${cls!.id}?tab=courses` },
    { role: 'instructor', path: `/classes/${cls!.id}?tab=engagement` },
    { role: 'instructor', path: `/leaderboard?scope=${cls!.id}` },
    { role: 'admin', path: '/home' },
    { role: 'admin', path: '/admin' },
    { role: 'admin', path: '/admin/users' },
    { role: 'admin', path: '/admin/courses' },
    { role: 'admin', path: '/admin/ai-usage' },
    { role: 'admin', path: '/admin/modules' },
  ];
  writeFileSync(FILE, JSON.stringify({ routes, roleplayActivityId: rp?.id ?? null } satisfies Prep, null, 2));
  console.info(`Prepared ${routes.length} routes → ${FILE}`);
  process.exit(0);
}

const ERROR_MARKERS = ['Unhandled Runtime Error', 'Internal Server Error', 'Application error', '__next_error__'];

const unescape = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** Submits the real /login form (server action, no JS) and returns the session cookie. */
async function login(base: string, email: string): Promise<string> {
  const page = await (await fetch(`${base}/login`)).text();
  const form = new FormData();
  for (const tag of page.match(/<input[^>]*type="hidden"[^>]*>/g) ?? []) {
    const name = tag.match(/name="([^"]*)"/)?.[1];
    if (name) form.append(unescape(name), unescape(tag.match(/value="([^"]*)"/)?.[1] ?? ''));
  }
  form.append('email', email);
  form.append('password', DEMO_PASSWORD);
  const res = await fetch(`${base}/login`, { method: 'POST', body: form, redirect: 'manual' });
  const cookie = res.headers.getSetCookie().find((c) => c.startsWith('sprout_session='));
  if (!cookie) throw new Error(`Login failed for ${email} (status ${res.status})`);
  return cookie.split(';')[0]!;
}

async function run(port: string) {
  const { routes, roleplayActivityId } = JSON.parse(readFileSync(FILE, 'utf8')) as Prep;
  const base = `http://localhost:${port}`;
  const cookies: Record<string, string> = {};
  for (const [role, email] of Object.entries(ACCOUNTS)) cookies[role] = await login(base, email);
  console.info(`Logged in as ${Object.keys(cookies).join(', ')} through the login form.\n`);
  let failed = 0;
  for (const r of routes) {
    const started = Date.now();
    const headers: Record<string, string> = r.role === 'anon' ? {} : { cookie: cookies[r.role]! };
    try {
      const res = await fetch(base + r.path, { headers, redirect: 'manual' });
      const body = await res.text();
      const marker = ERROR_MARKERS.find((m) => body.includes(m));
      const ok = res.status === 200 && !marker;
      if (!ok) failed++;
      console.info(`${ok ? 'OK  ' : 'FAIL'} ${res.status} ${String(Date.now() - started).padStart(5)}ms  [${r.role}] ${r.path}${marker ? `  (${marker})` : ''}${res.headers.get('location') ? `  → ${res.headers.get('location')}` : ''}`);
    } catch (err) {
      failed++;
      console.info(`FAIL ---  [${r.role}] ${r.path}  ${(err as Error).message}`);
    }
  }

  // Streaming AI endpoints (mock mode when no AI_API_KEY)
  const streams = [
    { path: '/api/tutor', body: { messages: [{ role: 'user', content: 'What is a user story?' }] } },
    ...(roleplayActivityId ? [{ path: '/api/activities/roleplay', body: { activityId: roleplayActivityId, messages: [{ role: 'persona', content: 'Hi' }, { role: 'learner', content: 'What happens at lunchtime?' }] } }] : []),
  ];
  for (const s of streams) {
    const res = await fetch(base + s.path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: cookies.learner! },
      body: JSON.stringify(s.body),
    });
    const text = await res.text();
    const ok = res.status === 200 && text.trim().length > 0;
    if (!ok) failed++;
    console.info(`${ok ? 'OK  ' : 'FAIL'} ${res.status}  [learner] POST ${s.path}  "${text.slice(0, 80).replace(/\s+/g, ' ')}…"`);
  }

  console.info(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
  process.exit(failed ? 1 : 0);
}

const [mode, port = '3100'] = process.argv.slice(2);
if (mode === 'prep') void prep();
else if (mode === 'run') void run(port);
else console.info('Usage: tsx scripts/smoke.ts prep | run [port]');
