import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Code, MessagesSquare, Trophy, WandSparkles } from 'lucide-react';
import { getSessionUser } from '@/core/auth/session';
import { buttonClasses, Card, Pip } from '@/components/ui';

const FEATURES = [
  {
    icon: MessagesSquare,
    tint: 'coral' as const,
    title: 'Practise the awkward parts',
    body: 'Run a requirements meeting with a picky client or sit a mock interview. The other side is played by AI, and it gives you honest feedback afterwards.',
  },
  {
    icon: Code,
    tint: 'sky' as const,
    title: 'Learn by poking at things',
    body: 'Sort cards, put steps in order, fix code that an AI agent got wrong. Short lessons, then you try it straight away.',
  },
  {
    icon: Trophy,
    tint: 'butter' as const,
    title: 'See how the class is doing',
    body: 'A weekly leaderboard and a course race show who is ahead and by how much. Friendly pressure, opt-in nicknames.',
  },
  {
    icon: WandSparkles,
    tint: 'mint' as const,
    title: 'Any topic, your pace',
    body: 'Type what you want to learn and Pip builds you a mini-course. Teachers can do the same for their own classes.',
  },
];

export default async function LandingPage() {
  if (await getSessionUser()) redirect('/home');
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 lg:px-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pip size={40} />
          <span className="font-display text-2xl font-bold">Sprout</span>
        </div>
        <div className="flex gap-2">
          <Link href="/login" className={buttonClasses('secondary', 'sm')}>
            Log in
          </Link>
          <Link href="/signup" className={buttonClasses('primary', 'sm')}>
            Sign up
          </Link>
        </div>
      </header>

      <section className="grid items-center gap-10 py-14 lg:grid-cols-[1.2fr_1fr] lg:py-20">
        <div>
          <p className="mb-3 inline-block rounded-pill border-2 border-line bg-butter px-3 py-1 font-display text-sm font-semibold">
            Mini-courses for the AI era
          </p>
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
            Software skills, one small sprout at a time.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            Sprout teaches how software really gets built: requirements, teamwork, testing, and how to
            work with AI coding agents without letting them drive. Made for curious non-CS folks and
            CS grads getting job-ready.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className={buttonClasses('primary', 'lg')}>
              Start learning, it is free
            </Link>
            <Link href="/login" className={buttonClasses('secondary', 'lg')}>
              Try a demo account
            </Link>
          </div>
        </div>
        <div className="relative mx-auto">
          <div className="absolute inset-0 -z-10 translate-x-3 translate-y-3 rounded-[2.5rem] border-2 border-line bg-mint" />
          <div className="flex flex-col items-center gap-4 rounded-[2.5rem] border-2 border-line bg-paper px-10 py-10">
            <Pip size={200} stage={3} mood="cheer" float />
            <p className="max-w-[16rem] text-center font-display text-lg font-semibold">
              Hi, I am Pip. I grow a new leaf every time you level up.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 pb-16 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, tint, title, body }) => (
          <Card key={title} tint={tint} className="p-6">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-full border-2 border-line bg-paper">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-2 text-ink-soft">{body}</p>
          </Card>
        ))}
      </section>

      <footer className="mt-auto border-t-2 border-line/20 pt-6 text-sm text-ink-soft">
        Built by a student team for COMP software engineering, 2026. Prototype, demo data only.
      </footer>
    </div>
  );
}
