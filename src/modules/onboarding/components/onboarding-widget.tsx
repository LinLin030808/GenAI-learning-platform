import Link from 'next/link';
import { eq, inArray } from 'drizzle-orm';
import { Check, Compass, RefreshCw } from 'lucide-react';
import { getDb } from '@/core/db/client';
import { courses, learnerProfiles } from '@/core/db/schema';
import { getCourseProgress } from '@/core/progress/service';
import type { HomeWidgetProps } from '@/core/types';
import { asTint, Badge, buttonClasses, Card, cn, Pip, TINT_SOLID } from '@/components/ui';

const TRACK_LABEL = { explorer: 'Explorer track · ideas first', builder: 'Builder track · hands-on first' } as const;

export async function OnboardingWidget({ user }: HomeWidgetProps) {
  const db = await getDb();
  const [profile] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, user.id)).limit(1);

  if (!profile) {
    return (
      <Card tint="mint" className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <Pip mood="wow" size={88} float />
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Let Pip plan your path</h2>
          <p className="mt-1 text-ink-soft">Five quick questions (about a minute) and you get courses that fit your background and goals.</p>
        </div>
        <Link href="/onboarding" className={buttonClasses('primary', 'lg')}>
          <Compass className="h-5 w-5" /> Start
        </Link>
      </Card>
    );
  }

  const ids = profile.recommendedCourseIds;
  const rows = ids.length
    ? await db
        .select({ id: courses.id, slug: courses.slug, title: courses.title, emoji: courses.emoji, color: courses.color })
        .from(courses)
        .where(inArray(courses.id, ids))
    : [];
  const path = ids.map((id) => rows.find((r) => r.id === id)).filter((r): r is NonNullable<typeof r> => Boolean(r));
  const progress = await getCourseProgress(user.id, ids);
  const nextIndex = path.findIndex((c) => (progress.get(c.id)?.percent ?? 0) < 100);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Your path</h2>
          <Badge tint="mint" className="mt-1">
            {TRACK_LABEL[profile.track]}
          </Badge>
        </div>
        <Link href="/onboarding" className={buttonClasses('ghost', 'sm')}>
          <RefreshCw className="h-4 w-4" /> Retake
        </Link>
      </div>
      {profile.welcomeNote ? <p className="mt-3 max-w-3xl text-ink-soft">{profile.welcomeNote}</p> : null}

      <ol className="mt-5 flex flex-col gap-3 md:flex-row md:items-stretch">
        {path.map((c, i) => {
          const pct = progress.get(c.id)?.percent ?? 0;
          const done = pct === 100;
          const isNext = i === nextIndex;
          const tint = asTint(c.color);
          return (
            <li key={c.id} className="flex flex-1 items-center gap-3 md:flex-col md:items-stretch">
              <Link
                href={`/courses/${c.slug}`}
                className={cn(
                  'flex flex-1 items-center gap-3 rounded-blob border-2 border-line bg-paper p-3 transition hover:-translate-y-0.5 hover:shadow-sticker-sm',
                  isNext && 'bg-butter-soft shadow-sticker-sm',
                )}
              >
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-line text-2xl', TINT_SOLID[tint])} aria-hidden>
                  {done ? <Check className="h-6 w-6" /> : c.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-ink-soft">Step {i + 1}{isNext ? ' · up next' : done ? ' · done' : ''}</span>
                  <span className="block font-display leading-tight font-semibold">{c.title}</span>
                  <span className="text-xs text-ink-soft">{pct}%</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
